<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionArchivo;
use App\Models\EmpleadoAccionTipo;
use App\Models\EmpleadoAprobadorTemporal;
use App\Models\EmpleadoPresupuesto;
use App\Services\AccionPersonalSync;
use App\Services\PresupuestosApiClient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmpleadoAccionController extends Controller
{
    protected function ensureEmpleadoExists(string $anacod): void
    {
        $exists = DB::connection('san')
            ->table('aplicaciones.pro_anacod')
            ->where('anacod', $anacod)
            ->exists();

        if (! $exists) {
            abort(404);
        }
    }

    protected function validatePayload(Request $request, bool $requireAnacod): array
    {
        $rules = [
            'tipo_id' => 'required|integer|exists:empleado_accion_tipos,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i|after:hora_inicio',
            'motivo' => 'required|string|max:1000',
            'observaciones' => 'nullable|string|max:1000',
            'archivos.*' => 'nullable|file|max:10240',
        ];
        if ($requireAnacod) {
            $rules['anacod'] = 'required|string|max:50';
        }

        $merged = $request->all();
        foreach (['hora_inicio', 'hora_fin'] as $k) {
            if (! empty($merged[$k]) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $merged[$k])) {
                $merged[$k] = substr($merged[$k], 0, 5);
            }
        }
        $request->merge($merged);

        $data = $request->validate($rules);

        foreach (['hora_inicio', 'hora_fin'] as $k) {
            if (! empty($data[$k]) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $data[$k])) {
                $data[$k] = substr($data[$k], 0, 5);
            }
        }

        if (! empty($data['hora_inicio']) || ! empty($data['hora_fin'])) {
            $inicio = $data['fecha_inicio'] ?? null;
            $fin = $data['fecha_fin'] ?? $data['fecha_inicio'] ?? null;
            if ($fin && $inicio && $fin !== $inicio) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'hora_inicio' => 'Las horas solo aplican a permisos de un solo día (fecha_inicio debe coincidir con fecha_fin).',
                ]);
            }
        }

        return $data;
    }

    protected function persist(Request $request, array $data, string $anacod, ?EmpleadoAccion $existing = null): EmpleadoAccion
    {
        if ($existing) {
            $originals = $existing->getOriginal();
            $oldAnacod = $originals['anacod'] ?? $anacod;
            $oldFechaInicio = $originals['fecha_inicio'] ?? null;
            $oldFechaFin = $originals['fecha_fin'] ?? null;
            $oldHoraInicio = $originals['hora_inicio'] ?? null;
            $oldHoraFin = $originals['hora_fin'] ?? null;
            $oldTipoId = $originals['tipo_id'] ?? null;
            $oldTipoNombre = $oldTipoId ? EmpleadoAccionTipo::where('id', $oldTipoId)->value('nombre') : null;

            $data['updated_by'] = Auth::id();
            $existing->update($data);
            $accion = $existing->fresh()->load('tipo');

            $oldAccion = (clone $existing)->forceFill([
                'anacod' => $oldAnacod,
                'fecha_inicio' => $oldFechaInicio,
                'fecha_fin' => $oldFechaFin,
                'hora_inicio' => $oldHoraInicio,
                'hora_fin' => $oldHoraFin,
            ]);
            AccionPersonalSync::limpiar($oldAccion);
            AccionPersonalSync::llenar($accion);
        } else {
            $data['anacod'] = $anacod;
            $data['estado'] = 'aprobado';
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();
            $accion = EmpleadoAccion::create($data);
            $accion->load('tipo');

            AccionPersonalSync::llenar($accion);
        }
        $this->storeArchivos($request, $accion);
        return $accion;
    }

    private function getTipoNombre(int $tipoId): ?string
    {
        return EmpleadoAccionTipo::where('id', $tipoId)->value('nombre');
    }

    public function index(Request $request, string $anacod): Response
    {
        $this->ensureEmpleadoExists($anacod);

        $filters = $request->validate([
            'tipo_id' => 'nullable|integer|exists:empleado_accion_tipos,id',
            'estado' => 'nullable|in:aprobado,cancelado',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $query = EmpleadoAccion::with('tipo')
            ->where('anacod', $anacod)
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id');

        $this->applyFilters($query, $filters);
        $acciones = $query->paginate(15)->withQueryString();
        $empleado = Empleado::where('anacod', $anacod)->first();

        return Inertia::render('Empleados/Acciones/Index', [
            'anacod' => $anacod,
            'empleado' => $empleado,
            'acciones' => $acciones,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
            'filters' => $filters,
        ]);
    }

    public function export(Request $request, string $anacod): StreamedResponse
    {
        $this->ensureEmpleadoExists($anacod);

        $filters = $request->validate([
            'tipo_id' => 'nullable|integer|exists:empleado_accion_tipos,id',
            'estado' => 'nullable|in:aprobado,cancelado',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $query = EmpleadoAccion::with('tipo')
            ->where('anacod', $anacod);
        $this->applyFilters($query, $filters);
        $query->orderByDesc('fecha_inicio')->orderByDesc('id');

        $filename = 'acciones_' . $anacod . '_' . now()->format('Ymd_His') . '.xls';
        $empleado = Empleado::where('anacod', $anacod)->first();

        return $this->streamXlsx($query, $filename, $empleado?->ananam ?? $anacod);
    }

    public function globalExport(Request $request): StreamedResponse
    {
        $filters = $request->validate([
            'anacod' => 'nullable|string|max:50',
            'tipo_id' => 'nullable|integer|exists:empleado_accion_tipos,id',
            'estado' => 'nullable|in:aprobado,cancelado',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $query = EmpleadoAccion::with('tipo');
        if (! empty($filters['anacod'])) {
            $this->ensureEmpleadoExists($filters['anacod']);
            $query->where('anacod', $filters['anacod']);
        }
        $this->applyFilters($query, $filters);
        $query->orderByDesc('fecha_inicio')->orderByDesc('id');

        $filename = 'acciones_global_' . now()->format('Ymd_His') . '.xls';

        return $this->streamXlsx($query, $filename, 'Todas');
    }

    protected function streamXlsx($query, string $filename, string $titulo): StreamedResponse
    {
        return response()->streamDownload(function () use ($query, $titulo) {
            $headers = [
                'ID', 'Empleado', 'Nombre', 'Tipo', 'Fecha Inicio', 'Fecha Fin',
                'Hora Inicio', 'Hora Fin', 'Estado', 'Motivo', 'Observaciones',
                'Origen', 'SharePoint ID', 'País', 'Creado',
            ];

            $output = "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\"\n";
            $output .= "      xmlns:x=\"urn:schemas-microsoft-com:office:excel\"\n";
            $output .= "      xmlns=\"http://www.w3.org/TR/REC-html40\">\n";
            $output .= "<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"></head>\n";
            $output .= "<body>\n";
            $output .= "<table border=\"1\" cellpadding=\"3\" cellspacing=\"0\" style=\"border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt\">\n";

            $output .= "<tr><td colspan=\"" . count($headers) . "\" style=\"font-weight:bold;font-size:14pt;background-color:#1F4E78;color:#FFFFFF;padding:8px\">Reporte de acciones de personal: " . htmlspecialchars($titulo) . "</td></tr>\n";
            $output .= "<tr><td colspan=\"" . count($headers) . "\" style=\"font-style:italic;background-color:#D9E1F2;padding:4px\">Generado: " . now()->format('Y-m-d H:i:s') . "</td></tr>\n";
            $output .= "<tr><td colspan=\"" . count($headers) . "\" style=\"background-color:#FFFFFF\">&nbsp;</td></tr>\n";

            $output .= "<tr style=\"background-color:#4472C4;color:#FFFFFF;font-weight:bold\">\n";
            foreach ($headers as $h) {
                $output .= "<th style=\"padding:6px;text-align:left;border:1px solid #000\">" . htmlspecialchars($h) . "</th>\n";
            }
            $output .= "</tr>\n";

            $query->chunk(500, function ($acciones) use (&$output) {
                    foreach ($acciones as $a) {
                        $empleadoNombre = $a->anacod;
                        try {
                            $empleadoNombre = Empleado::where('anacod', $a->anacod)->value('ananam') ?? $a->anacod;
                        } catch (\Throwable $e) {
                        }
                        $row = [
                            $a->id,
                            $a->anacod,
                            $empleadoNombre,
                            $a->tipo?->nombre ?? '—',
                            $a->fecha_inicio instanceof Carbon ? $a->fecha_inicio->format('Y-m-d') : $a->fecha_inicio,
                            $a->fecha_fin instanceof Carbon ? $a->fecha_fin->format('Y-m-d') : ($a->fecha_fin ?? ''),
                            $a->hora_inicio ? substr($a->hora_inicio, 0, 5) : '',
                            $a->hora_fin ? substr($a->hora_fin, 0, 5) : '',
                            $a->estado,
                            $a->motivo ?? '',
                            $a->observaciones ?? '',
                            $a->origen ?? 'manual',
                            $a->sharepoint_id ?? '',
                            $a->pais ?? '',
                            $a->created_at instanceof Carbon ? $a->created_at->format('Y-m-d H:i:s') : $a->created_at,
                        ];
                        $output .= "<tr>\n";
                        foreach ($row as $cell) {
                            $cellStr = is_null($cell) ? '' : (string) $cell;
                            $cellStr = nl2br(htmlspecialchars($cellStr));
                            $output .= "<td style=\"padding:4px;border:1px solid #D0D0D0;mso-number-format:'\\@'\">" . $cellStr . "</td>\n";
                        }
                        $output .= "</tr>\n";
                    }
                });

            $output .= "</table>\n</body>\n</html>";

            echo $output;
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    public function create(string $anacod): Response
    {
        $this->ensureEmpleadoExists($anacod);
        $empleado = Empleado::where('anacod', $anacod)->first();
        return Inertia::render('Empleados/Acciones/Create', [
            'anacod' => $anacod,
            'empleado' => $empleado,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request, string $anacod): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        $data = $this->validatePayload($request, false);
        $this->persist($request, $data, $anacod);

        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción registrada correctamente.');
    }

    public function edit(string $anacod, EmpleadoAccion $accion): Response
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $accion->load('archivos');
        $empleado = Empleado::where('anacod', $anacod)->first();
        return Inertia::render('Empleados/Acciones/Edit', [
            'anacod' => $anacod,
            'empleado' => $empleado,
            'accion' => $accion,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function update(Request $request, string $anacod, EmpleadoAccion $accion): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $data = $this->validatePayload($request, false);
        $this->persist($request, $data, $anacod, $accion);

        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción actualizada.');
    }

    public function destroy(string $anacod, EmpleadoAccion $accion): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $this->destroyAccion($accion);
        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción eliminada.');
    }

    public function cancel(Request $request, string $anacod, EmpleadoAccion $accion): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $this->cancelAccion($request, $accion);
        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción cancelada.');
    }

    public function downloadArchivo(string $anacod, EmpleadoAccion $accion, EmpleadoAccionArchivo $archivo)
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod || $archivo->empleado_accion_id !== $accion->id) {
            abort(404);
        }
        return Storage::disk('public')->download($archivo->path, $archivo->nombre_original);
    }

    public function destroyArchivo(string $anacod, EmpleadoAccion $accion, EmpleadoAccionArchivo $archivo): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod || $archivo->empleado_accion_id !== $accion->id) {
            abort(404);
        }
        Storage::disk('public')->delete($archivo->path);
        $archivo->delete();
        return back()->with('success', 'Archivo eliminado.');
    }

    public function globalIndex(Request $request): Response
    {
        $filters = $request->validate([
            'anacod' => 'nullable|string|max:50',
            'tipo_id' => 'nullable|integer|exists:empleado_accion_tipos,id',
            'estado' => 'nullable|in:aprobado,cancelado',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $query = EmpleadoAccion::with('tipo')
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id');

        if (! empty($filters['anacod'])) {
            $this->ensureEmpleadoExists($filters['anacod']);
            $query->where('anacod', $filters['anacod']);
        }
        $this->applyFilters($query, $filters);

        $acciones = $query->paginate(20)->withQueryString();

        $anacods = collect($acciones->items())->pluck('anacod')->unique()->all();
        $empleados = Empleado::whereIn('anacod', $anacods)->get()->keyBy('anacod');
        $acciones->setCollection(
            collect($acciones->items())->map(function ($a) use ($empleados) {
                $a->empleado = $empleados->get($a->anacod);
                return $a;
            })
        );

        return Inertia::render('Empleados/Acciones/GlobalIndex', [
            'acciones' => $acciones,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
            'filters' => $filters,
        ]);
    }

    public function globalCreate(): Response
    {
        $empleadosActivos = $this->empleadosActivos();
        return Inertia::render('Empleados/Acciones/GlobalCreate', [
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
            'empleadosActivos' => $empleadosActivos,
        ]);
    }

    public function globalStore(Request $request): RedirectResponse
    {
        $data = $this->validatePayload($request, true);
        $this->ensureEmpleadoExists($data['anacod']);
        $this->persist($request, $data, $data['anacod']);

        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción registrada correctamente.');
    }

    public function globalEdit(EmpleadoAccion $accion): Response
    {
        $accion->load('archivos');
        $empleado = Empleado::where('anacod', $accion->anacod)->first();
        return Inertia::render('Empleados/Acciones/GlobalEdit', [
            'accion' => $accion,
            'empleado' => $empleado,
            'empleadosActivos' => $this->empleadosActivos(),
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function globalUpdate(Request $request, EmpleadoAccion $accion): RedirectResponse
    {
        $data = $this->validatePayload($request, true);
        $this->ensureEmpleadoExists($data['anacod']);
        if ($data['anacod'] !== $accion->anacod) {
            abort(400, 'No se puede reasignar el empleado de una acción existente.');
        }
        $this->persist($request, $data, $data['anacod'], $accion);

        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción actualizada.');
    }

    public function globalDestroy(EmpleadoAccion $accion): RedirectResponse
    {
        $this->destroyAccion($accion);
        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción eliminada.');
    }

    public function globalCancel(Request $request, EmpleadoAccion $accion): RedirectResponse
    {
        $this->cancelAccion($request, $accion);
        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción cancelada.');
    }

    protected function applyFilters($query, array $filters): void
    {
        if (! empty($filters['tipo_id'])) {
            $query->where('tipo_id', $filters['tipo_id']);
        }
        if (! empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }
        if (! empty($filters['fecha_desde'])) {
            $query->where('fecha_inicio', '>=', $filters['fecha_desde']);
        }
        if (! empty($filters['fecha_hasta'])) {
            $query->where('fecha_inicio', '<=', $filters['fecha_hasta']);
        }
    }

    protected function empleadosActivos(): array
    {
        return DB::connection('san')
            ->table('aplicaciones.pro_anacod')
            ->select('anacod', 'ananam', 'anamai')
            ->where('anasta', 'A')
            ->where('anatip', 'U')
            ->orderBy('anacod')
            ->get()
            ->map(fn ($e) => [
                'anacod' => (string) $e->anacod,
                'ananam' => (string) $e->ananam,
                'anamai' => (string) ($e->anamai ?? ''),
            ])
            ->all();
    }

    protected function destroyAccion(EmpleadoAccion $accion): void
    {
        $accion->load('tipo');
        AccionPersonalSync::limpiar($accion);
        foreach ($accion->archivos()->get() as $archivo) {
            Storage::disk('public')->delete($archivo->path);
        }
        $accion->delete();
    }

    protected function cancelAccion(Request $request, EmpleadoAccion $accion): void
    {
        $accion->load('tipo');
        AccionPersonalSync::limpiar($accion);
        $data = $request->validate([
            'observaciones' => 'nullable|string|max:1000',
        ]);
        $accion->update([
            'estado' => 'cancelado',
            'observaciones' => $data['observaciones'] ?? $accion->observaciones,
            'updated_by' => Auth::id(),
        ]);
    }

    protected function storeArchivos(Request $request, EmpleadoAccion $accion): void
    {
        if (! $request->hasFile('archivos')) {
            return;
        }
        foreach ($request->file('archivos') as $file) {
            if (! $file || ! $file->isValid()) {
                continue;
            }
            $path = $file->store(
                "acciones/{$accion->anacod}/{$accion->id}",
                'public'
            );
            EmpleadoAccionArchivo::create([
                'empleado_accion_id' => $accion->id,
                'path' => $path,
                'nombre_original' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'tamano' => $file->getSize(),
                'uploaded_by' => Auth::id(),
            ]);
        }
    }

    public function checkAprobador(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'anacod' => 'required|string|max:50',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $anacod = $payload['anacod'];
        $this->ensureEmpleadoExists($anacod);

        $client = app(PresupuestosApiClient::class);
        if (! $client->isConfigured()) {
            return response()->json([
                'is_aprobador' => false,
                'user_id' => null,
                'cc_cuentas' => [],
                'warning' => 'La integración con Presupuestos no está configurada.',
            ]);
        }

        $userId = EmpleadoPresupuesto::where('anacod', $anacod)->value('presupuestos_user_id');
        $userId = $userId ? (int) $userId : null;

        if (! $userId) {
            $empleado = Empleado::where('anacod', $anacod)->first();
            $email = $empleado?->anamai;
            if ($email) {
                try {
                    $remote = $client->findUserByEmail((string) $email);
                    $userId = isset($remote['id']) ? (int) $remote['id'] : null;
                } catch (\Throwable $e) {
                    Log::warning('AprobadorTemp: fallo en findUserByEmail', [
                        'anacod' => $anacod,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        if (! $userId) {
            return response()->json([
                'is_aprobador' => false,
                'user_id' => null,
                'cc_cuentas' => [],
                'warning' => 'Empleado no existe en Presupuestos.',
            ]);
        }

        try {
            $ccCuentasRaw = $client->getUserCcCuentas($userId);
        } catch (\Throwable $e) {
            Log::warning('AprobadorTemp: fallo en getUserCcCuentas', [
                'anacod' => $anacod,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'is_aprobador' => false,
                'user_id' => $userId,
                'cc_cuentas' => [],
                'warning' => 'No se pudieron consultar las cc/cuentas: ' . $e->getMessage(),
            ]);
        }

        $aprobadores = $ccCuentasRaw
            ->where('is_aprobador', true)
            ->where('is_currently_active', true)
            ->values();

        $ccs = $client->listCentrosCosto();
        $cuentas = $client->listCuentas();

        $aprobadoresEnriquecidos = $aprobadores->map(function ($row) use ($ccs, $cuentas) {
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
                'vigente_hasta_actual' => $row['vigente_hasta'],
            ];
        })->all();

        return response()->json([
            'is_aprobador' => count($aprobadoresEnriquecidos) > 0,
            'user_id' => $userId,
            'cc_cuentas' => $aprobadoresEnriquecidos,
            'warning' => null,
        ]);
    }

    public function asignarAprobadorTemporal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'anacod' => 'required|string|max:50',
            'temp_user_id' => 'required|integer',
            'temp_user_email' => 'nullable|email|max:255',
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'pausar_original' => 'sometimes|boolean',
            'cc_cuentas' => 'required|array|min:1',
            'cc_cuentas.*.cc_id' => 'required|integer',
            'cc_cuentas.*.cuenta_id' => 'required|integer',
            'cc_cuentas.*.remote_cc_cuenta_id' => 'nullable|integer',
        ]);

        $anacod = $validated['anacod'];
        $tempUserId = (int) $validated['temp_user_id'];
        $this->ensureEmpleadoExists($anacod);

        $client = app(PresupuestosApiClient::class);
        if (! $client->isConfigured()) {
            return response()->json([
                'ok' => false,
                'message' => 'La integración con Presupuestos no está configurada.',
            ], 422);
        }

        $existing = collect();
        try {
            $existing = $client->getUserCcCuentas($tempUserId);
        } catch (\Throwable $e) {
            Log::warning('AprobadorTemp: no se pudo consultar cc/cuentas del temp', [
                'temp_user_id' => $tempUserId,
                'error' => $e->getMessage(),
            ]);
        }

        $row = EmpleadoAprobadorTemporal::create([
            'anacod_origen' => $anacod,
            'temp_user_id' => $tempUserId,
            'temp_user_email' => $validated['temp_user_email'] ?? null,
            'accion_personal_id' => $request->integer('accion_personal_id') ?: null,
            'fecha_desde' => $validated['fecha_desde'],
            'fecha_hasta' => $validated['fecha_hasta'] ?? null,
            'pausar_original' => (bool) ($validated['pausar_original'] ?? false),
            'cc_cuentas' => $validated['cc_cuentas'],
            'sync_status' => 'pending',
            'created_by' => Auth::id(),
        ]);

        $asignaciones = [];
        $conflictos = [];
        $extensiones = [];
        $errores = [];
        $fechaDesdeIso = Carbon::parse($validated['fecha_desde'])->startOfDay()->toIso8601String();
        $fechaHastaIso = !empty($validated['fecha_hasta'])
            ? Carbon::parse($validated['fecha_hasta'])->endOfDay()->toIso8601String()
            : null;
        $fechaHastaCarbon = $fechaHastaIso ? Carbon::parse($fechaHastaIso) : null;
        $esPermanente = $fechaHastaIso === null;

        foreach ($validated['cc_cuentas'] as $cc) {
            $ccId = (int) $cc['cc_id'];
            $cuentaId = (int) $cc['cuenta_id'];

            $existe = $existing->first(fn ($r) =>
                (int) $r['centro_costo_id'] === $ccId
                && (int) $r['cuenta_id'] === $cuentaId
            );

            if ($existe && $existe['is_aprobador'] && empty($existe['vigente_hasta'])) {
                $conflictos[] = [
                    'cc_id' => $ccId,
                    'cuenta_id' => $cuentaId,
                    'razon' => 'temp_ya_es_aprobador_permanente',
                    'detalle' => 'El aprobador temporal ya es aprobador permanente de esta cc/cuenta. No se modifica.',
                ];
                Log::info('AprobadorTemp: descartado por permanente', [
                    'temp_user_id' => $tempUserId,
                    'cc_id' => $ccId,
                    'cuenta_id' => $cuentaId,
                ]);
                continue;
            }

            if ($existe && $existe['is_aprobador'] && !empty($existe['vigente_hasta'])) {
                $existenteHastaCarbon = Carbon::parse($existe['vigente_hasta']);
                $existenteDesde = !empty($existe['vigente_desde']) ? Carbon::parse($existe['vigente_desde']) : null;

                if (!$esPermanente && $existenteHastaCarbon->lt($fechaHastaCarbon)) {
                    try {
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
                        $asignaciones[] = [
                            'cc_id' => $ccId,
                            'cuenta_id' => $cuentaId,
                            'remote_id' => isset($result['id']) ? (int) $result['id'] : null,
                            'accion' => 'extendido',
                        ];
                        $extensiones[] = [
                            'cc_id' => $ccId,
                            'cuenta_id' => $cuentaId,
                            'ventana_anterior' => ($existenteDesde?->toDateString() ?? '?') . ' → ' . $existenteHastaCarbon->toDateString(),
                            'ventana_nueva' => $validated['fecha_desde'] . ' → ' . $validated['fecha_hasta'],
                        ];
                    } catch (\Throwable $e) {
                        $errores[] = "cc={$ccId}/cuenta={$cuentaId}: " . $e->getMessage();
                        Log::warning('AprobadorTemp: upsert extendido falló', [
                            'anacod' => $anacod,
                            'cc_id' => $ccId,
                            'cuenta_id' => $cuentaId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                    continue;
                }

                $conflictos[] = [
                    'cc_id' => $ccId,
                    'cuenta_id' => $cuentaId,
                    'razon' => 'temp_ya_cubre_esta_fecha',
                    'detalle' => "Ya cubre hasta {$existe['vigente_hasta']}, no se acorta.",
                ];
                continue;
            }

            try {
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
                $asignaciones[] = [
                    'cc_id' => $ccId,
                    'cuenta_id' => $cuentaId,
                    'remote_id' => isset($result['id']) ? (int) $result['id'] : null,
                    'accion' => 'creado',
                ];
            } catch (\Throwable $e) {
                $errores[] = "cc={$ccId}/cuenta={$cuentaId}: " . $e->getMessage();
                Log::warning('AprobadorTemp: upsert falló', [
                    'anacod' => $anacod,
                    'cc_id' => $ccId,
                    'cuenta_id' => $cuentaId,
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
                'last_error' => 'Todas las cc/cuentas fueron omitidas por conflictos con el aprobador temporal.',
                'api_response' => $apiResponse,
            ]);
            return response()->json([
                'ok' => false,
                'message' => 'El aprobador temporal ya cubre todas las cc/cuentas. Nada que asignar.',
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

        return response()->json([
            'ok' => true,
            'aprobador_temporal_id' => $row->id,
            'asignaciones' => $asignaciones,
            'conflictos' => $conflictos,
            'extensiones' => $extensiones,
        ]);
    }

    public function skipAprobadorTemporal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'anacod' => 'required|string|max:50',
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
            'cc_cuentas' => 'sometimes|array',
        ]);

        $anacod = $validated['anacod'];
        $this->ensureEmpleadoExists($anacod);

        $row = EmpleadoAprobadorTemporal::create([
            'anacod_origen' => $anacod,
            'temp_user_id' => 0,
            'temp_user_email' => 'skipped',
            'accion_personal_id' => $request->integer('accion_personal_id') ?: null,
            'fecha_desde' => $validated['fecha_desde'],
            'fecha_hasta' => $validated['fecha_hasta'],
            'pausar_original' => false,
            'cc_cuentas' => $validated['cc_cuentas'] ?? [],
            'sync_status' => 'skipped',
            'last_error' => 'El operador omitió la asignación de aprobador temporal.',
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'ok' => true,
            'skipped' => true,
            'aprobador_temporal_id' => $row->id,
        ]);
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $search = (string) $request->input('search', '');

        $client = app(PresupuestosApiClient::class);
        if (! $client->isConfigured()) {
            return response()->json([
                'data' => [],
                'meta' => null,
                'warning' => 'La integración con Presupuestos no está configurada.',
            ]);
        }

        try {
            $result = $client->listUsers($search, 'activos', 50);
        } catch (\Throwable $e) {
            Log::warning('AprobadorTemp: fallo en listUsers', [
                'search' => $search,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'data' => [],
                'meta' => null,
                'warning' => 'No se pudo consultar la lista de usuarios: ' . $e->getMessage(),
            ]);
        }

        $usuarios = collect($result['data'] ?? [])->map(fn ($u) => [
            'id' => (int) ($u['id'] ?? 0),
            'name' => (string) ($u['name'] ?? ''),
            'email' => (string) ($u['email'] ?? ''),
            'code' => $u['code'] ?? null,
        ])->filter(fn ($u) => $u['id'] > 0)->values()->all();

        return response()->json([
            'data' => $usuarios,
            'meta' => $result['meta'] ?? null,
            'warning' => null,
        ]);
    }
}
