<?php

namespace App\Console\Commands;

use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionTipo;
use App\Services\AccionPersonalSync;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SincronizarAccionesAsistenciaCommand extends Command
{
    protected $signature = 'acciones:sincronizar-asistencia
                            {--fecha= : Fecha objetivo (YYYY-MM-DD). Por defecto hoy.}
                            {--empleado= : Filtrar por anacod específico.}
                            {--dry-run : Solo mostrar lo que haría, sin escribir.}';

    protected $description = 'Sincroniza el campo accion_personal en pro_eventos_asistencia con las acciones de personal vigentes.';

    public function handle(): int
    {
        $fecha = $this->option('fecha')
            ? Carbon::parse($this->option('fecha'))->toDateString()
            : Carbon::today()->toDateString();
        $empleadoFilter = $this->option('empleado');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Sincronizando acciones de personal para {$fecha}" . ($empleadoFilter ? " (empleado: {$empleadoFilter})" : '') . ($dryRun ? ' [DRY-RUN]' : ''));

        $query = EmpleadoAccion::with('tipo')
            ->where('estado', 'aprobado')
            ->where('fecha_inicio', '<=', $fecha)
            ->where(function ($q) use ($fecha) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $fecha);
            });
        if ($empleadoFilter) {
            $query->where('anacod', $empleadoFilter);
        }
        $acciones = $query->get();

        $accionesLeidas = $acciones->count();
        $eventosActualizados = 0;
        $eventosSinMatch = 0;

        if ($accionesLeidas === 0) {
            $this->warn("Sin acciones aprobadas que cubran {$fecha}.");
            return self::SUCCESS;
        }

        foreach ($acciones as $accion) {
            $tipoNombre = $accion->tipo?->nombre ?? 'Otro';
            $afectaAsistencia = AccionPersonalSync::debeSincronizar($accion);
            $this->line(" - {$accion->anacod}: {$tipoNombre} ({$accion->fecha_inicio} → " . ($accion->fecha_fin ?? $accion->fecha_inicio) . ")" . ($afectaAsistencia ? '' : ' [no afecta asistencia, skip]'));

            if (! $afectaAsistencia) {
                continue;
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
                    $h = (int) date('H', strtotime($r->fecha));
                    $m = (int) date('i', strtotime($r->fecha));
                    $ts = $h * 60 + $m;
                    [$hi, $mi] = explode(':', substr($accion->hora_inicio, 0, 5));
                    [$hf, $mf] = explode(':', substr($accion->hora_fin, 0, 5));
                    $tsInicio = ((int) $hi) * 60 + ((int) $mi);
                    $tsFin = ((int) $hf) * 60 + ((int) $mf);
                    return $ts >= $tsInicio && $ts <= $tsFin;
                });
            }

            $ids = $candidatos->pluck('id')->all();
            $totalRows = count($rows);
            $eventosSinMatch += $totalRows === 0 ? 0 : max(0, $totalRows - count($ids));

            if (empty($ids)) {
                $this->line("   sin eventos coincidentes");
                continue;
            }

            if ($dryRun) {
                $this->line("   [dry-run] actualizaría " . count($ids) . " evento(s) → {$tipoNombre}");
                $eventosActualizados += count($ids);
                continue;
            }

            $count = DB::connection('san')
                ->table('aplicaciones.pro_eventos_asistencia')
                ->whereIn('id', $ids)
                ->update(['accion_personal' => $tipoNombre]);

            $eventosActualizados += $count;
            $this->line("   actualizados {$count} evento(s) → {$tipoNombre}");
        }

        $this->newLine();
        $this->info("Resumen: {$accionesLeidas} acción(es) leída(s), {$eventosActualizados} evento(s) actualizado(s), {$eventosSinMatch} sin coincidencia.");

        return self::SUCCESS;
    }
}
