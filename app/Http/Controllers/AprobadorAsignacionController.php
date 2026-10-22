<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\EmpleadoAprobadorTemporal;
use App\Services\PresupuestosApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AprobadorAsignacionController extends Controller
{
    public function index(Request $request, string $anacod): JsonResponse
    {
        $empleado = Empleado::where('anacod', $anacod)->first();
        if (! $empleado) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        $client = app(PresupuestosApiClient::class);
        if (! $client->isConfigured()) {
            return response()->json([
                'anacod' => $anacod,
                'ananam' => $empleado->ananam,
                'user_id' => null,
                'cc_cuentas' => [],
                'warning' => 'API Red no configurada',
            ]);
        }

        $userId = $this->resolveUserId($anacod, $client);
        if (! $userId) {
            return response()->json([
                'anacod' => $anacod,
                'ananam' => $empleado->ananam,
                'user_id' => null,
                'cc_cuentas' => [],
                'warning' => 'Empleado no encontrado en Red',
            ]);
        }

        try {
            $rows = $client->getUserCcCuentas($userId);
            $aprobadores = $rows->where('is_aprobador', true)->values();

            $ccs = $client->listCentrosCosto();
            $cuentas = $client->listCuentas();

            $cc_cuentas = $aprobadores->map(function ($row) use ($ccs, $cuentas) {
                $cc = $ccs->firstWhere('id', $row['centro_costo_id']);
                $cuenta = $cuentas->firstWhere('id', $row['cuenta_id']);
                return [
                    'cc_id' => $row['centro_costo_id'],
                    'cc_codigo' => $cc['codigo'] ?? '',
                    'cc_nombre' => $cc['nombre'] ?? '',
                    'cuenta_id' => $row['cuenta_id'],
                    'cuenta_codigo' => $cuenta['codigo'] ?? '',
                    'cuenta_nombre' => $cuenta['nombre'] ?? '',
                    'remote_cc_cuenta_id' => $row['id'],
                    'is_currently_active' => $row['is_currently_active'] ?? false,
                    'vigente_desde' => $row['vigente_desde'] ?? null,
                    'vigente_hasta' => $row['vigente_hasta'] ?? null,
                ];
            })->all();

            return response()->json([
                'anacod' => $anacod,
                'ananam' => $empleado->ananam,
                'user_id' => $userId,
                'cc_cuentas' => $cc_cuentas,
                'warning' => null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('AprobadorAsignacion: no se pudo consultar Red', [
                'anacod' => $anacod,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'anacod' => $anacod,
                'ananam' => $empleado->ananam,
                'user_id' => null,
                'cc_cuentas' => [],
                'warning' => 'No se pudo consultar Red: ' . $e->getMessage(),
            ], 503);
        }
    }

    public function show(Request $request, string $anacod): JsonResponse
    {
        return $this->index($request, $anacod);
    }

    public function store(Request $request, string $anacod): JsonResponse
    {
        $empleado = Empleado::where('anacod', $anacod)->first();
        if (! $empleado) {
            return response()->json(['ok' => false, 'message' => 'Empleado no encontrado'], 404);
        }

        $validated = $request->validate([
            'temp_user_id' => 'required|integer',
            'temp_user_email' => 'nullable|email|max:255',
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'es_permanente' => 'sometimes|boolean',
            'cc_cuentas' => 'required|array|min:1',
            'cc_cuentas.*.cc_id' => 'required|integer',
            'cc_cuentas.*.cuenta_id' => 'required|integer',
            'origen' => 'nullable|string|in:manual_admin,manual_baja',
        ]);

        $client = app(PresupuestosApiClient::class);
        if (! $client->isConfigured()) {
            return response()->json([
                'ok' => false,
                'message' => 'La integración con Presupuestos no está configurada.',
            ], 422);
        }

        $tempUserId = (int) $validated['temp_user_id'];
        $origenAsign = $validated['origen'] ?? 'manual_admin';
        $fechaDesde = $validated['fecha_desde'];
        $fechaHastaIso = ! empty($validated['fecha_hasta'])
            ? \Carbon\Carbon::parse($validated['fecha_hasta'])->endOfDay()->toIso8601String()
            : null;
        $fechaDesdeIso = \Carbon\Carbon::parse($fechaDesde)->startOfDay()->toIso8601String();

        $row = EmpleadoAprobadorTemporal::create([
            'anacod_origen' => $anacod,
            'temp_user_id' => $tempUserId,
            'temp_user_email' => $validated['temp_user_email'] ?? null,
            'accion_personal_id' => null,
            'fecha_desde' => $fechaDesde,
            'fecha_hasta' => $validated['fecha_hasta'] ?? null,
            'pausar_original' => false,
            'cc_cuentas' => $validated['cc_cuentas'],
            'sync_status' => 'pending',
            'origen_asignacion' => $origenAsign,
            'created_by' => Auth::id(),
        ]);

        $asignaciones = [];
        $conflictos = [];
        $errores = [];
        $extensiones = [];

        foreach ($validated['cc_cuentas'] as $cc) {
            $ccId = (int) $cc['cc_id'];
            $cuentaId = (int) $cc['cuenta_id'];

            try {
                $existing = $client->getUserCcCuentas($tempUserId)
                    ->first(fn ($r) => $r['centro_costo_id'] === $ccId && $r['cuenta_id'] === $cuentaId);

                if ($existing && $existing['is_aprobador'] && empty($existing['vigente_hasta'])) {
                    $conflictos[] = [
                        'cc_id' => $ccId,
                        'cuenta_id' => $cuentaId,
                        'razon' => 'temp_ya_es_aprobador_permanente',
                    ];
                    continue;
                }

                if ($existing && $existing['is_aprobador'] && ! empty($existing['vigente_hasta'])) {
                    $existenteHasta = \Carbon\Carbon::parse($existing['vigente_hasta']);
                    if ($fechaHastaIso && $existenteHasta->lt(\Carbon\Carbon::parse($fechaHastaIso))) {
                        $result = $client->upsertUserCcCuenta(
                            userId: $tempUserId,
                            centroCostoId: $ccId,
                            cuentaId: $cuentaId,
                            attrs: [
                                'is_aprobador' => true,
                                'vigente_desde' => $fechaDesdeIso,
                                'vigente_hasta' => $fechaHastaIso,
                            ]
                        );
                        $asignaciones[] = ['cc_id' => $ccId, 'cuenta_id' => $cuentaId, 'remote_id' => $result['id'] ?? null, 'accion' => 'extendido'];
                        $extensiones[] = ['cc_id' => $ccId, 'cuenta_id' => $cuentaId];
                        continue;
                    }
                    $conflictos[] = ['cc_id' => $ccId, 'cuenta_id' => $cuentaId, 'razon' => 'temp_ya_cubre_esta_fecha'];
                    continue;
                }

                $result = $client->upsertUserCcCuenta(
                    userId: $tempUserId,
                    centroCostoId: $ccId,
                    cuentaId: $cuentaId,
                    attrs: [
                        'is_aprobador' => true,
                        'vigente_desde' => $fechaDesdeIso,
                        'vigente_hasta' => $fechaHastaIso,
                    ]
                );
                $asignaciones[] = ['cc_id' => $ccId, 'cuenta_id' => $cuentaId, 'remote_id' => $result['id'] ?? null, 'accion' => 'creado'];
            } catch (\Throwable $e) {
                $errores[] = "cc={$ccId}/cuenta={$cuentaId}: " . $e->getMessage();
                Log::warning('AprobadorAsignacion: upsert falló', [
                    'anacod' => $anacod,
                    'cc_id' => $ccId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $apiResponse = [
            'asignaciones' => $asignaciones,
            'conflictos' => $conflictos,
            'extensiones' => $extensiones,
        ];

        if (count($asignaciones) === 0 && count($errores) === 0) {
            $row->update([
                'sync_status' => 'error',
                'last_error' => 'Todas las cc/cuentas fueron omitidas por conflictos.',
                'api_response' => $apiResponse,
            ]);
            return response()->json([
                'ok' => false,
                'message' => 'El aprobador temporal ya cubre todas las cc/cuentas.',
                'conflictos' => $conflictos,
                'aprobador_temporal_id' => $row->id,
            ], 422);
        }

        if (count($errores) > 0) {
            $row->update([
                'sync_status' => 'error',
                'last_error' => implode('; ', $errores),
                'api_response' => array_merge($apiResponse, ['errores' => $errores]),
            ]);
            return response()->json([
                'ok' => false,
                'message' => 'Algunos upserts fallaron.',
                'errores' => $errores,
                'asignaciones' => $asignaciones,
                'conflictos' => $conflictos,
                'extensiones' => $extensiones,
                'aprobador_temporal_id' => $row->id,
            ], 422);
        }

        $row->update([
            'sync_status' => 'ok',
            'api_response' => $apiResponse,
            'last_error' => null,
        ]);

        Log::info('AprobadorAsignacion: manual asignacion exitosa', [
            'anacod_origen' => $anacod,
            'temp_user_id' => $tempUserId,
            'origen_asignacion' => $origenAsign,
            'count' => count($asignaciones),
        ]);

        return response()->json([
            'ok' => true,
            'aprobador_temporal_id' => $row->id,
            'asignaciones' => $asignaciones,
            'conflictos' => $conflictos,
            'extensiones' => $extensiones,
        ]);
    }

    public function copyFrom(Request $request, string $anacod): JsonResponse
    {
        $validated = $request->validate([
            'from_anacod' => 'required|string|max:50',
            'temp_user_id' => 'required|integer',
            'temp_user_email' => 'nullable|email|max:255',
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $empleadoDestino = Empleado::where('anacod', $anacod)->first();
        $empleadoOrigen = Empleado::where('anacod', $validated['from_anacod'])->first();
        if (! $empleadoDestino || ! $empleadoOrigen) {
            return response()->json(['ok' => false, 'message' => 'Empleado origen o destino no encontrado'], 404);
        }

        $client = app(PresupuestosApiClient::class);
        if (! $client->isConfigured()) {
            return response()->json(['ok' => false, 'message' => 'API Red no configurada'], 422);
        }

        $userIdOrigen = $this->resolveUserId($validated['from_anacod'], $client);
        if (! $userIdOrigen) {
            return response()->json(['ok' => false, 'message' => 'Empleado origen no existe en Red'], 422);
        }

        try {
            $rows = $client->getUserCcCuentas($userIdOrigen);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => 'Error al consultar Red: ' . $e->getMessage()], 503);
        }

        $aprobadores = $rows->where('is_aprobador', true);
        if ($aprobadores->isEmpty()) {
            return response()->json(['ok' => false, 'message' => 'El empleado origen no es aprobador de ninguna cc/cuenta'], 422);
        }

        $ccs = $client->listCentrosCosto();
        $cuentas = $client->listCuentas();

        $fechaDesdeIso = \Carbon\Carbon::parse($validated['fecha_desde'])->startOfDay()->toIso8601String();
        $fechaHastaIso = ! empty($validated['fecha_hasta'])
            ? \Carbon\Carbon::parse($validated['fecha_hasta'])->endOfDay()->toIso8601String()
            : null;

        $ccCuentasPayload = [];
        foreach ($aprobadores as $row) {
            $cc = $ccs->firstWhere('id', $row['centro_costo_id']);
            $cuenta = $cuentas->firstWhere('id', $row['cuenta_id']);
            $ccCuentasPayload[] = [
                'cc_id' => $row['centro_costo_id'],
                'cuenta_id' => $row['cuenta_id'],
                'cc_codigo' => $cc['codigo'] ?? '',
                'cc_nombre' => $cc['nombre'] ?? '',
                'cuenta_codigo' => $cuenta['codigo'] ?? '',
                'cuenta_nombre' => $cuenta['nombre'] ?? '',
                'remote_cc_cuenta_id' => $row['id'],
            ];
        }

        $row = EmpleadoAprobadorTemporal::create([
            'anacod_origen' => $anacod,
            'temp_user_id' => (int) $validated['temp_user_id'],
            'temp_user_email' => $validated['temp_user_email'] ?? null,
            'accion_personal_id' => null,
            'fecha_desde' => $validated['fecha_desde'],
            'fecha_hasta' => $validated['fecha_hasta'] ?? null,
            'pausar_original' => false,
            'cc_cuentas' => $ccCuentasPayload,
            'sync_status' => 'pending',
            'origen_asignacion' => 'manual_admin',
            'created_by' => Auth::id(),
        ]);

        $asignaciones = [];
        $conflictos = [];
        $errores = [];

        foreach ($ccCuentasPayload as $cc) {
            try {
                $result = $client->upsertUserCcCuenta(
                    userId: (int) $validated['temp_user_id'],
                    centroCostoId: $cc['cc_id'],
                    cuentaId: $cc['cuenta_id'],
                    attrs: [
                        'is_aprobador' => true,
                        'vigente_desde' => $fechaDesdeIso,
                        'vigente_hasta' => $fechaHastaIso,
                    ]
                );
                $asignaciones[] = ['cc_id' => $cc['cc_id'], 'cuenta_id' => $cc['cuenta_id'], 'remote_id' => $result['id'] ?? null];
            } catch (\Throwable $e) {
                $errores[] = "cc={$cc['cc_id']}/cuenta={$cc['cuenta_id']}: " . $e->getMessage();
            }
        }

        $row->update([
            'sync_status' => count($errores) > 0 ? 'error' : 'ok',
            'api_response' => ['asignaciones' => $asignaciones, 'errores' => $errores, 'conflictos' => $conflictos],
            'last_error' => count($errores) > 0 ? implode('; ', $errores) : null,
        ]);

        return response()->json([
            'ok' => count($errores) === 0,
            'aprobador_temporal_id' => $row->id,
            'asignaciones' => $asignaciones,
            'conflictos' => $conflictos,
            'errores' => $errores,
            'from_anacod' => $validated['from_anacod'],
            'to_anacod' => $anacod,
        ], count($errores) === 0 ? 200 : 422);
    }

    protected function resolveUserId(string $anacod, PresupuestosApiClient $client): ?int
    {
        try {
            $presupuesto = \App\Models\EmpleadoPresupuesto::where('anacod', $anacod)->first();
            if ($presupuesto?->presupuestos_user_id) {
                return (int) $presupuesto->presupuestos_user_id;
            }
            $empleado = Empleado::where('anacod', $anacod)->first();
            if ($empleado?->anamai) {
                $remote = $client->findUserByEmail($empleado->anamai);
                return isset($remote['id']) ? (int) $remote['id'] : null;
            }
        } catch (\Throwable $e) {
            Log::warning('AprobadorAsignacion: no se pudo resolver user_id', [
                'anacod' => $anacod,
                'error' => $e->getMessage(),
            ]);
        }
        return null;
    }
}