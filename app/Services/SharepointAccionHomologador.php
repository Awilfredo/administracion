<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionTipo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SharepointAccionHomologador
{
    private const TIPOS_NO_AFECTAN_ASISTENCIA = [
        'Bono',
        'Renuncia',
        'Renuncia Voluntaria',
        'Capacitación',
        'Capacitacion',
        'Cambio de domicilio',
        'Actualización de datos',
        'Actualizacion de datos',
        'Cambio de cuenta',
        'Solicitud de equipo',
        'Otro',
    ];

    public function homologar(array $sp, bool $dryRun = false): array
    {
        $spId = $sp['Id'] ?? null;

        if (! $spId) {
            return [
                'accion' => 'skipped',
                'motivo' => 'sin ID de SharePoint',
                'sharepoint_id' => null,
            ];
        }

        $aprobador = isset($sp['aprobador']) ? trim((string) $sp['aprobador']) : null;
        if (empty($aprobador)) {
            return [
                'accion' => 'skipped',
                'motivo' => 'aprobador=null (no aprobado)',
                'sharepoint_id' => $spId,
            ];
        }

        $email = isset($sp['solicitante']) ? trim((string) $sp['solicitante']) : null;
        $anacod = $email
            ? Empleado::where('anamai', $email)->value('anacod')
            : null;

        if (! $anacod) {
            Log::warning('SharePoint sync: email sin match local', [
                'sharepoint_id' => $spId,
                'email' => $email,
            ]);
            return [
                'accion' => 'skipped',
                'motivo' => "email '{$email}' sin match en empleados.anamai",
                'sharepoint_id' => $spId,
            ];
        }

        $title = trim((string) ($sp['Title'] ?? ''));
        $tipoId = $this->resolverTipo($title);

        if (! $tipoId) {
            Log::warning('SharePoint sync: no se pudo resolver tipo', [
                'sharepoint_id' => $spId,
                'title' => $title,
            ]);
            return [
                'accion' => 'skipped',
                'motivo' => "title='{$title}' sin tipo",
                'sharepoint_id' => $spId,
            ];
        }

        $fechaInicio = ! empty($sp['Inicio_vacaciones'])
            ? Carbon::parse($sp['Inicio_vacaciones'])->toDateString()
            : Carbon::parse($sp['fecha_efectiva'])->toDateString();

        $fechaFin = ! empty($sp['Fin_vacaciones'])
            ? Carbon::parse($sp['Fin_vacaciones'])->toDateString()
            : null;

        $tipoNombre = EmpleadoAccionTipo::where('id', $tipoId)->value('nombre');

        $data = [
            'anacod' => $anacod,
            'tipo_id' => $tipoId,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'motivo' => $sp['justificacion'] ?? '',
            'estado' => 'aprobado',
            'observaciones' => $this->buildObservaciones($sp, $aprobador, $sp['fecha_solicitud'] ?? null),
            'sharepoint_id' => $spId,
            'sharepoint_guid' => $sp['GUID'] ?? null,
            'origen' => 'sharepoint',
            'pais' => $this->mapPais($sp['pais'] ?? null),
        ];

        $resumen = "{$anacod} ({$tipoNombre}) {$fechaInicio} → " . ($fechaFin ?? 'mismo día');

        if ($dryRun) {
            return [
                'accion' => 'would_import',
                'motivo' => $resumen,
                'sharepoint_id' => $spId,
            ];
        }

        $existing = EmpleadoAccion::where('sharepoint_id', $spId)->first();
        $isUpdate = $existing !== null;

        EmpleadoAccion::updateOrCreate(
            ['sharepoint_id' => $spId],
            $data
        );

        return [
            'accion' => $isUpdate ? 'updated' : 'imported',
            'motivo' => $resumen,
            'sharepoint_id' => $spId,
        ];
    }

    protected function resolverTipo(string $title): ?int
    {
        if ($title === '') {
            return null;
        }

        $tipo = EmpleadoAccionTipo::whereRaw('LOWER(nombre) = ?', [mb_strtolower($title)])->first();
        if ($tipo) {
            return $tipo->id;
        }

        $afectaAsistencia = ! in_array($title, self::TIPOS_NO_AFECTAN_ASISTENCIA, true);

        try {
            $tipo = EmpleadoAccionTipo::firstOrCreate(
                ['nombre' => $title],
                [
                    'descripcion' => 'Tipo importado automáticamente desde SharePoint.',
                    'requiere_adjunto' => false,
                    'activo' => true,
                    'afecta_asistencia' => $afectaAsistencia,
                ]
            );
            Log::info('SharePoint sync: tipo creado automáticamente', [
                'nombre' => $title,
                'tipo_id' => $tipo->id,
                'afecta_asistencia' => $afectaAsistencia,
            ]);
            return $tipo->id;
        } catch (\Throwable $e) {
            Log::error('SharePoint sync: no se pudo crear tipo', [
                'title' => $title,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function buildObservaciones(array $sp, ?string $aprobador, ?string $fechaSolicitud): string
    {
        $partes = [];
        if (! empty($aprobador)) {
            $partes[] = 'Aprobado por: ' . $aprobador;
        }
        if (! empty($sp['comentario_jefe'])) {
            $partes[] = 'Jefe: ' . $sp['comentario_jefe'];
        }
        if (! empty($sp['comentario_rrhh'])) {
            $partes[] = 'RRHH: ' . $sp['comentario_rrhh'];
        }
        if (! empty($sp['jefe_inmediato'])) {
            $partes[] = 'Jefe inmediato: ' . $sp['jefe_inmediato'];
        }
        if (! empty($fechaSolicitud)) {
            try {
                $partes[] = 'Solicitado: ' . Carbon::parse($fechaSolicitud)->toDateTimeString();
            } catch (\Throwable $e) {
                // Si falla el parse, omitir silenciosamente
            }
        }
        return implode(' | ', $partes);
    }

    private function mapPais(?string $pais): ?string
    {
        return match ($pais) {
            'El Salvador' => 'SV',
            'Guatemala' => 'GT',
            default => null,
        };
    }
}