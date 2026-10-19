<?php

namespace App\Services;

use App\Models\EmpleadoAccion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccionPersonalSync
{
    /**
     * Llena el campo accion_personal en san.pro_eventos_asistencia.
     * Solo aplica si el tipo tiene afecta_asistencia = true.
     */
    public static function llenar(EmpleadoAccion $accion): void
    {
        if (! self::debeSincronizar($accion)) {
            return;
        }

        $tipoNombre = $accion->tipo?->nombre;
        if (! $tipoNombre) {
            return;
        }

        $fechaInicio = $accion->fecha_inicio instanceof \Carbon\Carbon
            ? $accion->fecha_inicio->toDateString()
            : $accion->fecha_inicio;
        $fechaFin = $accion->fecha_fin instanceof \Carbon\Carbon
            ? $accion->fecha_fin->toDateString()
            : ($accion->fecha_fin ?? $fechaInicio);

        try {
            $query = DB::connection('san')
                ->table('aplicaciones.pro_eventos_asistencia')
                ->where('anacod', $accion->anacod)
                ->whereBetween(DB::raw('DATE(fecha)'), [$fechaInicio, $fechaFin])
                ->whereIn('evento', ['Tarde', 'Ausencia', 'Salida antes'])
                ->whereNull('accion_personal');

            self::aplicarFiltroHora($query, $accion->hora_inicio, $accion->hora_fin);

            $count = $query->update(['accion_personal' => $tipoNombre]);

            if ($count > 0) {
                Log::info('AccionPersonalSync: eventos actualizados', [
                    'anacod' => $accion->anacod,
                    'tipo' => $tipoNombre,
                    'count' => $count,
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('AccionPersonalSync: error al llenar eventos', [
                'anacod' => $accion->anacod,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Limpia el campo accion_personal cuando una acción se cancela o edita.
     */
    public static function limpiar(EmpleadoAccion $accion): void
    {
        if (! self::debeSincronizar($accion)) {
            return;
        }

        $fechaInicio = $accion->fecha_inicio instanceof \Carbon\Carbon
            ? $accion->fecha_inicio->toDateString()
            : $accion->fecha_inicio;
        $fechaFin = $accion->fecha_fin instanceof \Carbon\Carbon
            ? $accion->fecha_fin->toDateString()
            : ($accion->fecha_fin ?? $fechaInicio);

        try {
            $query = DB::connection('san')
                ->table('aplicaciones.pro_eventos_asistencia')
                ->where('anacod', $accion->anacod)
                ->whereBetween(DB::raw('DATE(fecha)'), [$fechaInicio, $fechaFin])
                ->whereIn('evento', ['Tarde', 'Ausencia', 'Salida antes']);

            self::aplicarFiltroHora($query, $accion->hora_inicio, $accion->hora_fin);

            $query->update(['accion_personal' => null]);
        } catch (\Throwable $e) {
            Log::warning('AccionPersonalSync: error al limpiar eventos', [
                'anacod' => $accion->anacod,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Sincroniza eventos para una fecha específica (usado por SincronizarAccionesAsistenciaCommand).
     */
    public static function sincronizarFecha(EmpleadoAccion $accion, string $fecha): int
    {
        if (! self::debeSincronizar($accion)) {
            return 0;
        }

        $tipoNombre = $accion->tipo?->nombre;
        if (! $tipoNombre) {
            return 0;
        }

        $rows = DB::connection('san')->select(
            "SELECT id, fecha, evento
             FROM aplicaciones.pro_eventos_asistencia
             WHERE anacod = ?
               AND DATE(fecha) = ?
               AND evento IN ('Tarde', 'Ausencia', 'Salida antes')
               AND accion_personal IS NULL",
            [$accion->anacod, $fecha]
        );

        $candidatos = collect($rows);

        if ($accion->hora_inicio && $accion->hora_fin) {
            $candidatos = $candidatos->filter(function ($r) use ($accion) {
                $ts = ((int) date('H', strtotime($r->fecha))) * 60
                    + (int) date('i', strtotime($r->fecha));
                [$hi, $mi] = explode(':', substr($accion->hora_inicio, 0, 5));
                [$hf, $mf] = explode(':', substr($accion->hora_fin, 0, 5));
                $tsIni = ((int) $hi) * 60 + ((int) $mi);
                $tsFin = ((int) $hf) * 60 + ((int) $mf);
                return $ts >= $tsIni && $ts <= $tsFin;
            });
        }

        $ids = $candidatos->pluck('id')->all();
        if (empty($ids)) {
            return 0;
        }

        return DB::connection('san')
            ->table('aplicaciones.pro_eventos_asistencia')
            ->whereIn('id', $ids)
            ->update(['accion_personal' => $tipoNombre]);
    }

    /**
     * Determina si una acción debe sincronizarse con asistencia.
     */
    public static function debeSincronizar(EmpleadoAccion $accion): bool
    {
        if (! $accion->tipo) {
            return false;
        }
        if (! ($accion->tipo->afecta_asistencia ?? true)) {
            return false;
        }
        return true;
    }

    protected static function aplicarFiltroHora($query, ?string $horaInicio, ?string $horaFin): void
    {
        if (! $horaInicio || ! $horaFin) {
            return;
        }
        [$hi, $mi] = explode(':', substr($horaInicio, 0, 5));
        [$hf, $mf] = explode(':', substr($horaFin, 0, 5));
        $tsIni = ((int) $hi) * 60 + (int) $mi;
        $tsFin = ((int) $hf) * 60 + (int) $mf;
        $query->whereRaw(
            '(EXTRACT(HOUR FROM fecha) * 60 + EXTRACT(MINUTE FROM fecha)) BETWEEN ? AND ?',
            [$tsIni, $tsFin]
        );
    }
}