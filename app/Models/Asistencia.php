<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Asistencia extends Model
{
    use HasFactory;
    protected $connection = 'san';
    public $timestamps = false;
    protected $table = 'aplicaciones.pro_eventos_asistencia';
    protected $fillable = ['accion_personal'];

    public static function dashboard(?int $mes = null, ?int $anio = null, ?int $cumpleMes = null, ?int $cumpleAnio = null): array
    {
        $mes = $mes ?? (int) Carbon::now()->format('m');
        $anio = $anio ?? (int) Carbon::now()->format('Y');
        $cumpleMes = $cumpleMes ?? $mes;
        $cumpleAnio = $cumpleAnio ?? $anio;

        return Cache::remember(
            "dashboard.full.$anio.$mes.c$cumpleAnio.$cumpleMes",
            60,
            fn () => self::buildFullDashboard($mes, $anio, $cumpleMes, $cumpleAnio)
        );
    }

    private static function buildFullDashboard(int $mes, int $anio, int $cumpleMes, int $cumpleAnio): array
    {
        $mesActual = self::dashboardMesCompleto($mes, $anio);
        if ($mes === 1) {
            $mesAnterior = self::dashboardMesCompleto(12, $anio - 1);
        } else {
            $mesAnterior = self::dashboardMesCompleto($mes - 1, $anio);
        }

        return [
            'actualizado_en' => now()->toISOString(),
            'hoy'             => self::seccionHoy(),
            'mes'             => array_merge($mesActual, ['mes' => sprintf('%04d-%02d', $anio, $mes)]),
            'comparativa'     => self::comparativaDiferencias($mesActual, $mesAnterior),
            'tendencia'       => self::seccionTendencia6Meses(),
            'top'             => self::seccionTopListas(),
            'extra'           => [
                'por_area'           => self::seccionPorArea(),
                'antiguedad'         => self::seccionAntiguedad(),
                'por_dia_semana'     => self::seccionPorDiaSemana(),
                'sin_marcaciones_nfc_3d'    => self::seccionSinMarcacionesNFC3Dias(),
                'sin_marcaciones_huella_3d' => self::seccionSinMarcacionesHuella3Dias(),
                'por_pais'           => self::seccionPorPais(),
                'freelance'          => self::seccionFreelance(),
                'por_jefe'           => self::seccionPorJefe(),
                'por_hora'           => self::seccionPorHora(),
                'tasa_justificacion' => self::seccionTasaJustificacion6Meses(),
                'crecimiento'        => self::seccionCrecimientoEmpleados(),
                'ultimas_altas'      => self::seccionUltimasAltas(),
                'ultimas_bajas'      => self::seccionUltimasBajas(),
                'cumpleanos_mes'     => self::seccionCumpleanos($cumpleMes, $cumpleAnio),
                'top_posiciones'     => self::seccionTopPosiciones(),
                'por_horario'        => self::seccionPorHorario(),
                'tasa_puntualidad'   => self::seccionTasaPuntualidadPorDOW($mes, $anio),
                'periodo_prueba'     => self::seccionEnPeriodoPrueba(),
                'periodo_prueba_list' => self::seccionEmpleadosPeriodoPrueba(),
                'top_pendientes'     => self::seccionTopPendientesJustificar(),
                'antiguedad_por_area'=> self::seccionAntiguedadPorArea(),
                'huerfanos_nfc'      => self::seccionHuerfanosNFC(),
                'prox_jubilarse'     => self::seccionProximosJubilarse(),
                'top_antiguedad'     => self::seccionTopAntiguedad(),
                'cumpleanos_hoy'     => self::seccionCumpleanosHoy(),
                'prox_cumpleanos'    => self::seccionProximosCumpleanos(),
            ],
        ];
    }

    public static function seccionHoy(): array
    {
        $r = DB::connection('san')->selectOne(
            "SELECT
                (SELECT COUNT(*) FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') AS empleados_activos,
                 (SELECT COUNT(*) FROM aplicaciones.log_accesos_sitios a
                  INNER JOIN aplicaciones.pro_anatags t ON t.uid = a.uid
                  INNER JOIN aplicaciones.pro_anacod u ON u.anacod = t.anacod
                  WHERE DATE(a.fecha_registro) = CURRENT_DATE AND u.anapai = 'SV') AS registros_nfc,
                (SELECT COUNT(*) FROM aplicaciones.pro_eventos_asistencia a
                 INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
                 WHERE DATE(a.fecha) = CURRENT_DATE AND b.anapai = 'SV') AS eventos_hoy,
                (SELECT COUNT(*) FROM aplicaciones.pro_eventos_asistencia a
                 INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
                 WHERE DATE(a.fecha) = CURRENT_DATE AND a.accion_personal IS NOT NULL AND b.anapai = 'SV') AS eventos_hoy_justificados,
                (SELECT COUNT(*) FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U' AND anapai='SV' AND anacod NOT IN (SELECT anacod FROM aplicaciones.pro_anatags WHERE anacod IS NOT NULL)) AS sin_nfc
            "
        );
        $total = (int) ($r->eventos_hoy ?? 0);
        $justificados = (int) ($r->eventos_hoy_justificados ?? 0);
        return [
            'fecha'            => Carbon::today()->toDateString(),
            'empleados_activos' => (int) ($r->empleados_activos ?? 0),
            'registros_nfc'    => (int) ($r->registros_nfc ?? 0),
            'eventos'          => [
                'total'        => $total,
                'justificados' => $justificados,
                'pendientes'   => $total - $justificados,
            ],
            'sin_nfc' => (int) ($r->sin_nfc ?? 0),
        ];
    }

    public static function dashboardMesCompleto(int $mes, int $anio): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                COUNT(DISTINCT CASE WHEN a.evento = 'Tarde'        AND a.accion_personal IS NULL THEN b.anacod END) AS tarde,
                COUNT(DISTINCT CASE WHEN a.evento = 'Ausencia'     AND a.accion_personal IS NULL THEN b.anacod END) AS ausente,
                COUNT(DISTINCT CASE WHEN a.evento = 'Salida antes' AND a.accion_personal IS NULL THEN b.anacod END) AS salidas,
                COUNT(CASE WHEN a.accion_personal IS NULL THEN 1 END) AS pendientes,
                COUNT(CASE WHEN a.accion_personal IS NOT NULL THEN 1 END) AS justificados
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = ?
              AND EXTRACT(YEAR  FROM DATE(a.fecha)) = ?
              AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'",
            [$mes, $anio]
        );
        $r = $rows[0] ?? null;
        return [
            'tarde'        => (int) ($r->tarde        ?? 0),
            'ausente'      => (int) ($r->ausente      ?? 0),
            'salidas'      => (int) ($r->salidas      ?? 0),
            'pendientes'   => (int) ($r->pendientes   ?? 0),
            'justificados' => (int) ($r->justificados ?? 0),
        ];
    }

    public static function comparativaDiferencias(array $actual, array $anterior): array
    {
        return [
            'tarde'      => $actual['tarde']      - $anterior['tarde'],
            'ausente'    => $actual['ausente']    - $anterior['ausente'],
            'salidas'    => $actual['salidas']    - $anterior['salidas'],
            'pendientes' => $actual['pendientes'] - $anterior['pendientes'],
        ];
    }

    public static function seccionTendencia6Meses(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                EXTRACT(YEAR  FROM DATE(a.fecha))::int AS anio,
                EXTRACT(MONTH FROM DATE(a.fecha))::int AS mes,
                COUNT(DISTINCT CASE WHEN a.evento = 'Tarde'        AND a.accion_personal IS NULL THEN a.anacod END) AS tarde,
                COUNT(DISTINCT CASE WHEN a.evento = 'Ausencia'     AND a.accion_personal IS NULL THEN a.anacod END) AS ausente,
                COUNT(DISTINCT CASE WHEN a.evento = 'Salida antes' AND a.accion_personal IS NULL THEN a.anacod END) AS salidas
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
              AND a.fecha >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '5 months')
            GROUP BY anio, mes
            ORDER BY anio, mes"
        );
        $labels = [];
        $tarde = [];
        $ausente = [];
        $salidas = [];
        foreach ($rows as $r) {
            $labels[]  = sprintf('%04d-%02d', $r->anio, $r->mes);
            $tarde[]   = (int) $r->tarde;
            $ausente[] = (int) $r->ausente;
            $salidas[] = (int) $r->salidas;
        }
        return ['labels' => $labels, 'tarde' => $tarde, 'ausente' => $ausente, 'salidas' => $salidas];
    }

    public static function seccionTopListas(): array
    {
        $tarde = DB::connection('san')->select(
            "SELECT a.anacod, b.ananam, COUNT(*) AS veces
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE a.evento = 'Tarde'
              AND a.accion_personal IS NULL
              AND DATE(a.fecha) BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
              AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
            GROUP BY a.anacod, b.ananam
            ORDER BY veces DESC
            LIMIT 5"
        );
        $ausente = DB::connection('san')->select(
            "SELECT a.anacod, b.ananam, COUNT(*) AS veces
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE a.evento = 'Ausencia'
              AND a.accion_personal IS NULL
              AND DATE(a.fecha) BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
              AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
            GROUP BY a.anacod, b.ananam
            ORDER BY veces DESC
            LIMIT 5"
        );

        return [
            'tarde' => array_map(fn($r) => [
                'anacod' => $r->anacod,
                'ananam' => $r->ananam,
                'veces'  => (int) $r->veces,
            ], $tarde),
            'ausente' => array_map(fn($r) => [
                'anacod' => $r->anacod,
                'ananam' => $r->ananam,
                'veces'  => (int) $r->veces,
            ], $ausente),
        ];
    }

    public static function seccionPorArea(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                b.anarea AS area,
                COUNT(DISTINCT CASE WHEN b.anasta='A' THEN b.anacod END) AS empleados,
                COUNT(DISTINCT CASE WHEN a.evento = 'Tarde'        AND a.accion_personal IS NULL AND EXTRACT(MONTH FROM DATE(a.fecha))=EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM DATE(a.fecha))=EXTRACT(YEAR FROM CURRENT_DATE) THEN b.anacod END) AS tarde_mes,
                COUNT(DISTINCT CASE WHEN a.evento = 'Ausencia'     AND a.accion_personal IS NULL AND EXTRACT(MONTH FROM DATE(a.fecha))=EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM DATE(a.fecha))=EXTRACT(YEAR FROM CURRENT_DATE) THEN b.anacod END) AS ausente_mes,
                COUNT(DISTINCT CASE WHEN a.evento = 'Salida antes' AND a.accion_personal IS NULL AND EXTRACT(MONTH FROM DATE(a.fecha))=EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM DATE(a.fecha))=EXTRACT(YEAR FROM CURRENT_DATE) THEN b.anacod END) AS salidas_mes
            FROM aplicaciones.pro_anacod b
            LEFT JOIN aplicaciones.pro_eventos_asistencia a ON a.anacod = b.anacod
            WHERE b.anatip='U'
            GROUP BY b.anarea
            HAVING COUNT(DISTINCT CASE WHEN b.anasta='A' THEN b.anacod END) > 0
            ORDER BY empleados DESC
            LIMIT 10"
        );
        return array_map(fn($r) => [
            'area'        => $r->area ?? '(sin área)',
            'empleados'   => (int) $r->empleados,
            'tarde_mes'   => (int) $r->tarde_mes,
            'ausente_mes' => (int) $r->ausente_mes,
            'salidas_mes' => (int) $r->salidas_mes,
        ], $rows);
    }

    public static function seccionAntiguedad(): array
    {
        $row = DB::connection('san')->selectOne(
            "SELECT
                COUNT(*) FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL) AS con_ingreso,
                AVG(EXTRACT(YEAR  FROM AGE(CURRENT_DATE, fecha_ingreso)))
                    FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL) AS anios_promedio,
                AVG(EXTRACT(MONTH FROM AGE(CURRENT_DATE, fecha_ingreso)))
                    FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL) AS meses_promedio,
                COUNT(*) FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL AND AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '1 year') AS menores_1_anio,
                COUNT(*) FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL AND AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '1 year' AND AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '5 years') AS entre_1_y_5,
                COUNT(*) FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL AND AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '5 years' AND AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '10 years') AS entre_5_y_10,
                COUNT(*) FILTER (WHERE anasta='A' AND fecha_ingreso IS NOT NULL AND AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '10 years') AS mayores_10
            FROM aplicaciones.pro_anacod
            WHERE anatip='U'"
        );
        return [
            'con_ingreso'    => (int) ($row->con_ingreso ?? 0),
            'anios_promedio' => round((float) ($row->anios_promedio ?? 0), 1),
            'meses_promedio' => (int) ($row->meses_promedio ?? 0),
            'distribucion'   => [
                '< 1 año'         => (int) ($row->menores_1_anio ?? 0),
                '1 a 5 años'      => (int) ($row->entre_1_y_5 ?? 0),
                '5 a 10 años'     => (int) ($row->entre_5_y_10 ?? 0),
                '> 10 años'       => (int) ($row->mayores_10 ?? 0),
            ],
        ];
    }

    public static function seccionPorDiaSemana(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                EXTRACT(ISODOW FROM DATE(a.fecha))::int AS dow,
                COUNT(*) AS total_eventos,
                COUNT(*) FILTER (WHERE a.evento='Tarde'        AND a.accion_personal IS NULL) AS tarde,
                COUNT(*) FILTER (WHERE a.evento='Ausencia'     AND a.accion_personal IS NULL) AS ausente,
                COUNT(*) FILTER (WHERE a.evento='Salida antes' AND a.accion_personal IS NULL) AS salidas
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE a.accion_personal IS NULL
              AND b.anasta='A' AND b.anatip='U' AND b.anapai='SV'
              AND a.fecha >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '5 months')
            GROUP BY dow
            ORDER BY dow"
        );
        $labels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
        $data = array_fill(0, 7, ['tarde'=>0,'ausente'=>0,'salidas'=>0,'total'=>0]);
        foreach ($rows as $r) {
            $idx = ((int) $r->dow) - 1;
            if ($idx >= 0 && $idx < 7) {
                $data[$idx] = [
                    'tarde'   => (int) $r->tarde,
                    'ausente' => (int) $r->ausente,
                    'salidas' => (int) $r->salidas,
                    'total'   => (int) $r->total_eventos,
                ];
            }
        }
        return ['labels' => $labels, 'data' => $data];
    }

    public static function seccionSinMarcacionesNFC3Dias(): array
    {
        // Para cada empleado, su última marca NFC entre todos sus uids.
        // Usamos SQL crudo porque el LEFT JOIN con tres tablas + GROUP BY + HAVING + MAX es más expresivo así que con Eloquent Query Builder.
        $rows = DB::connection('san')->select(
            "SELECT u.anacod, u.ananam, u.anarea,
                MAX(l.fecha_registro) AS ultima_marca
            FROM aplicaciones.pro_anacod u
            LEFT JOIN aplicaciones.pro_anatags t ON t.anacod = u.anacod
            LEFT JOIN aplicaciones.log_accesos_sitios l ON l.uid = t.uid
            WHERE u.anasta='A' AND u.anatip='U' AND u.anapai='SV'
            GROUP BY u.anacod, u.ananam, u.anarea
            HAVING MAX(l.fecha_registro) IS NULL
                OR MAX(l.fecha_registro) < CURRENT_DATE - INTERVAL '3 days'
            ORDER BY ultima_marca ASC NULLS FIRST
            LIMIT 10"
        );
        return array_map(fn($r) => [
            'anacod'        => $r->anacod,
            'ananam'        => $r->ananam,
            'anarea'        => $r->anarea,
            'ultima_marca'  => $r->ultima_marca,
        ], $rows);
    }

    public static function seccionSinMarcacionesHuella3Dias(): array
    {
        // Para cada empleado, su última marca de huella (pro_marcaciones).
        $rows = DB::connection('san')->select(
            "SELECT u.anacod, u.ananam, u.anarea,
                MAX(m.fecha) AS ultima_marca
            FROM aplicaciones.pro_anacod u
            LEFT JOIN aplicaciones.pro_marcaciones m ON m.anacod = u.anacod
            WHERE u.anasta='A' AND u.anatip='U' AND u.anapai='SV'
            GROUP BY u.anacod, u.ananam, u.anarea
            HAVING MAX(m.fecha) IS NULL
                OR MAX(m.fecha) < CURRENT_DATE - INTERVAL '3 days'
            ORDER BY ultima_marca ASC NULLS FIRST
            LIMIT 10"
        );
        return array_map(fn($r) => [
            'anacod'        => $r->anacod,
            'ananam'        => $r->ananam,
            'anarea'        => $r->anarea,
            'ultima_marca'  => $r->ultima_marca,
        ], $rows);
    }

    public static function seccionPorPais(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                anapai AS pais,
                COUNT(*) FILTER (WHERE anasta='A') AS activos,
                COUNT(*) AS total
            FROM aplicaciones.pro_anacod
            WHERE anatip='U'
            GROUP BY anapai
            ORDER BY activos DESC"
        );
        return array_map(fn($r) => [
            'pais'    => $r->pais ?? '(sin país)',
            'activos' => (int) $r->activos,
            'total'   => (int) $r->total,
        ], $rows);
    }

    public static function seccionFreelance(): array
    {
        $row = DB::connection('san')->selectOne(
            "SELECT
                COUNT(*) FILTER (WHERE anasta='A' AND freelance=true) AS activos,
                COUNT(*) FILTER (WHERE freelance=true) AS total
            FROM aplicaciones.pro_anacod
            WHERE anatip='U'"
        );
        return [
            'activos' => (int) ($row->activos ?? 0),
            'total'   => (int) ($row->total ?? 0),
        ];
    }

    public static function seccionPorJefe(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anajef, COUNT(*) AS reportes
            FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U' AND anajef IS NOT NULL AND anajef <> ''
            GROUP BY anajef
            ORDER BY reportes DESC
            LIMIT 5"
        );
        return array_map(fn($r) => [
            'anajef'  => $r->anajef,
            'reportes'=> (int) $r->reportes,
        ], $rows);
    }

    public static function seccionPorHora(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                EXTRACT(HOUR FROM DATE(a.fecha))::int AS hora,
                COUNT(*) AS total
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE a.accion_personal IS NULL
              AND b.anasta='A' AND b.anatip='U' AND b.anapai='SV'
              AND a.fecha >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY hora
            ORDER BY hora"
        );
        $data = array_fill(0, 24, 0);
        foreach ($rows as $r) {
            $h = (int) $r->hora;
            if ($h >= 0 && $h < 24) $data[$h] = (int) $r->total;
        }
        return $data;
    }

    public static function seccionTasaJustificacion6Meses(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                EXTRACT(YEAR  FROM DATE(a.fecha))::int AS anio,
                EXTRACT(MONTH FROM DATE(a.fecha))::int AS mes,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE a.accion_personal IS NOT NULL) AS justificados,
                CASE WHEN COUNT(*) = 0 THEN 0
                     ELSE ROUND(100.0 * COUNT(*) FILTER (WHERE a.accion_personal IS NOT NULL) / COUNT(*), 1)
                END AS tasa_pct
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE b.anasta='A' AND b.anatip='U' AND b.anapai='SV'
              AND a.fecha >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '5 months')
            GROUP BY anio, mes
            ORDER BY anio, mes"
        );
        $labels = [];
        $tasa = [];
        foreach ($rows as $r) {
            $labels[] = sprintf('%04d-%02d', $r->anio, $r->mes);
            $tasa[]   = (float) $r->tasa_pct;
        }
        return ['labels' => $labels, 'tasa' => $tasa];
    }

    public static function seccionCrecimientoEmpleados(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT
                EXTRACT(YEAR  FROM fecha_ingreso)::int AS anio,
                EXTRACT(MONTH FROM fecha_ingreso)::int AS mes,
                COUNT(*) AS altas
            FROM aplicaciones.pro_anacod
            WHERE anatip='U' AND fecha_ingreso IS NOT NULL
              AND fecha_ingreso >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '5 months')
              AND fecha_ingreso <= CURRENT_DATE
            GROUP BY anio, mes
            ORDER BY anio, mes"
        );
        $bajasRows = DB::connection('san')->select(
            "SELECT
                EXTRACT(YEAR  FROM fecha_baja)::int AS anio,
                EXTRACT(MONTH FROM fecha_baja)::int AS mes,
                COUNT(*) AS bajas
            FROM aplicaciones.pro_anacod
            WHERE anatip='U' AND fecha_baja IS NOT NULL
              AND fecha_baja >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '5 months')
              AND fecha_baja <= CURRENT_DATE
            GROUP BY anio, mes
            ORDER BY anio, mes"
        );
        $byKey = [];
        foreach ($rows as $r) {
            $k = sprintf('%04d-%02d', $r->anio, $r->mes);
            $byKey[$k] = ['altas' => (int) $r->altas, 'bajas' => 0];
        }
        foreach ($bajasRows as $r) {
            $k = sprintf('%04d-%02d', $r->anio, $r->mes);
            if (!isset($byKey[$k])) $byKey[$k] = ['altas' => 0, 'bajas' => 0];
            $byKey[$k]['bajas'] = (int) $r->bajas;
        }
        ksort($byKey);
        $labels = array_keys($byKey);
        $altas = [];
        $bajas = [];
        foreach ($byKey as $v) {
            $altas[] = $v['altas'];
            $bajas[] = $v['bajas'];
        }
        return ['labels' => $labels, 'altas' => $altas, 'bajas' => $bajas];
    }

    public static function seccionCumpleanos(int $mes, int $anio): array
    {
        try {
            $rows = DB::connection('san')->select(
                "SELECT anacod, ananam, anames, anadia, anaimg, anapos, anarea
                FROM aplicaciones.pro_anacod
                WHERE anasta='A' AND anatip='U'
                  AND anames = ?
                ORDER BY anadia ASC",
                [$mes]
            );
            $items = [];
            foreach ($rows as $r) {
                $items[] = [
                    'anacod' => $r->anacod,
                    'ananam' => $r->ananam,
                    'anapos' => $r->anapos,
                    'anarea' => $r->anarea,
                    'anaimg' => $r->anaimg,
                    'mes'    => (int) $r->anames,
                    'dia'    => (int) $r->anadia,
                ];
            }
            return [
                'mes'   => sprintf('%04d-%02d', $anio, $mes),
                'items' => $items,
            ];
        } catch (\Throwable $e) {
            return ['mes' => sprintf('%04d-%02d', $anio, $mes), 'items' => []];
        }
    }

    public static function seccionTopPosiciones(int $limit = 5): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anapos, COUNT(*) AS empleados
            FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U' AND anapos IS NOT NULL AND anapos <> ''
            GROUP BY anapos
            ORDER BY empleados DESC
            LIMIT ?",
            [$limit]
        );
        return array_map(fn($r) => [
            'anapos'    => $r->anapos,
            'empleados' => (int) $r->empleados,
        ], $rows);
    }

    public static function seccionPorHorario(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT COALESCE(h.nombre, 'Sin horario') AS horario, COUNT(*) AS empleados
            FROM aplicaciones.pro_anacod u
            LEFT JOIN aplicaciones.pro_horarios h ON h.id::int = u.horario_id::int
            WHERE u.anasta='A' AND u.anatip='U'
            GROUP BY h.nombre
            ORDER BY empleados DESC
            LIMIT 10"
        );
        return array_map(fn($r) => [
            'horario'   => $r->horario,
            'empleados' => (int) $r->empleados,
        ], $rows);
    }

    public static function seccionTasaPuntualidadPorDOW(int $mes, int $anio): array
    {
        $rows = DB::connection('san')->select(
            "WITH ev AS (
                SELECT EXTRACT(ISODOW FROM DATE(a.fecha))::int AS dow,
                       COUNT(*) FILTER (WHERE a.accion_personal IS NULL) AS total,
                       COUNT(*) FILTER (WHERE a.evento = 'Tarde' AND a.accion_personal IS NULL) AS tarde,
                       COUNT(*) FILTER (WHERE a.accion_personal IS NOT NULL) AS justificados
                FROM aplicaciones.pro_eventos_asistencia a
                INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
                WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = ?
                  AND EXTRACT(YEAR  FROM DATE(a.fecha)) = ?
                  AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
                GROUP BY dow
            )
            SELECT dow, total, tarde, justificados,
                CASE WHEN total = 0 THEN 0
                     ELSE ROUND(100.0 * (total - tarde) / total, 1)
                END AS puntual_pct
            FROM ev
            ORDER BY dow",
            [$mes, $anio]
        );
        $data = array_fill(0, 7, ['total' => 0, 'tarde' => 0, 'justificados' => 0, 'puntual_pct' => 0]);
        foreach ($rows as $r) {
            $idx = ((int) $r->dow) - 1;
            if ($idx >= 0 && $idx < 7) {
                $data[$idx] = [
                    'total'       => (int) $r->total,
                    'tarde'       => (int) $r->tarde,
                    'justificados'=> (int) $r->justificados,
                    'puntual_pct' => (float) $r->puntual_pct,
                ];
            }
        }
        ksort($data);
        return $data;
    }

    public static function seccionEnPeriodoPrueba(): int
    {
        $r = DB::connection('san')->selectOne(
            "SELECT COUNT(*) AS c FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U' AND fecha_ingreso >= CURRENT_DATE - INTERVAL '3 months'
              AND fecha_ingreso <= CURRENT_DATE"
        );
        return (int) ($r->c ?? 0);
    }

    public static function seccionEmpleadosPeriodoPrueba(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anacod, ananam, anarea, fecha_ingreso, anapai
            FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U'
              AND fecha_ingreso >= CURRENT_DATE - INTERVAL '3 months'
              AND fecha_ingreso <= CURRENT_DATE
            ORDER BY fecha_ingreso DESC"
        );
        return array_map(fn($r) => [
            'anacod'        => $r->anacod,
            'ananam'        => $r->ananam,
            'anarea'        => $r->anarea,
            'anapai'        => $r->anapai,
            'fecha_ingreso' => (string) $r->fecha_ingreso,
        ], $rows);
    }

    public static function seccionTopPendientesJustificar(int $limit = 5): array
    {
        $rows = DB::connection('san')->select(
            "SELECT a.anacod, b.ananam, b.anarea, COUNT(*) AS pendientes
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
            WHERE a.accion_personal IS NULL
              AND a.fecha BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
              AND b.anasta='A' AND b.anatip='U' AND b.anapai = 'SV'
            GROUP BY a.anacod, b.ananam, b.anarea
            ORDER BY pendientes DESC
            LIMIT ?",
            [$limit]
        );
        return array_map(fn($r) => [
            'anacod'    => $r->anacod,
            'ananam'    => $r->ananam,
            'anarea'    => $r->anarea,
            'pendientes'=> (int) $r->pendientes,
        ], $rows);
    }

    public static function seccionAntiguedadPorArea(): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anarea,
                COUNT(*) FILTER (WHERE AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '1 year') AS m1,
                COUNT(*) FILTER (WHERE AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '1 year'  AND AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '3 years') AS m13,
                COUNT(*) FILTER (WHERE AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '3 years' AND AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '5 years') AS m35,
                COUNT(*) FILTER (WHERE AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '5 years' AND AGE(CURRENT_DATE, fecha_ingreso) < INTERVAL '10 years') AS m510,
                COUNT(*) FILTER (WHERE AGE(CURRENT_DATE, fecha_ingreso) >= INTERVAL '10 years') AS m10,
                COUNT(*) AS total
            FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U' AND anarea IS NOT NULL AND anarea <> ''
            GROUP BY anarea
            ORDER BY total DESC
            LIMIT 10"
        );
        return array_map(fn($r) => [
            'anarea' => $r->anarea,
            'buckets'=> [
                '<1a'    => (int) $r->m1,
                '1-3a'   => (int) $r->m13,
                '3-5a'   => (int) $r->m35,
                '5-10a'  => (int) $r->m510,
                '>10a'   => (int) $r->m10,
            ],
            'total'  => (int) $r->total,
        ], $rows);
    }

    public static function seccionHuerfanosNFC(): array
    {
        try {
            // Parte 1: empleados SIN tag NFC vinculado
            $sinTag = DB::connection('san')->select(
                "SELECT u.anacod, u.ananam, u.anarea, NULL::text AS ultima_marca
                FROM aplicaciones.pro_anacod u
                LEFT JOIN aplicaciones.pro_anatags t ON t.anacod = u.anacod
                WHERE u.anasta='A' AND u.anatip='U' AND u.anapai='SV'
                  AND t.uid IS NULL"
            );

            // Parte 2: empleados con tag pero sin marcación reciente (últimos 30 días)
            $conTagSinMarca = DB::connection('san')->select(
                "SELECT u.anacod, u.ananam, u.anarea, MAX(l.fecha_registro) AS ultima_marca
                FROM aplicaciones.pro_anacod u
                INNER JOIN aplicaciones.pro_anatags t ON t.anacod = u.anacod
                LEFT JOIN aplicaciones.log_accesos_sitios l ON l.uid = t.uid
                WHERE u.anasta='A' AND u.anatip='U' AND u.anapai='SV'
                GROUP BY u.anacod, u.ananam, u.anarea
                HAVING MAX(l.fecha_registro) IS NULL
                    OR MAX(l.fecha_registro) < CURRENT_DATE - INTERVAL '30 days'
                ORDER BY MAX(l.fecha_registro) ASC NULLS FIRST
                LIMIT 10"
            );

            // Combinar y deduplicar por anacod
            $seen = [];
            $items = [];
            foreach ($sinTag as $r) {
                if (isset($seen[$r->anacod])) continue;
                $seen[$r->anacod] = true;
                $items[] = [
                    'anacod'        => $r->anacod,
                    'ananam'        => $r->ananam,
                    'anarea'        => $r->anarea,
                    'ultima_marca'  => $r->ultima_marca,
                ];
            }
            foreach ($conTagSinMarca as $r) {
                if (isset($seen[$r->anacod])) continue;
                $seen[$r->anacod] = true;
                $items[] = [
                    'anacod'        => $r->anacod,
                    'ananam'        => $r->ananam,
                    'anarea'        => $r->anarea,
                    'ultima_marca'  => $r->ultima_marca,
                ];
            }

            // Ordenar: NULLs (sin tag) primero, luego por fecha ascendente
            usort($items, function ($a, $b) {
                $aNull = $a['ultima_marca'] === null;
                $bNull = $b['ultima_marca'] === null;
                if ($aNull !== $bNull) return $aNull ? -1 : 1;
                return strcmp((string)($a['ultima_marca'] ?? ''), (string)($b['ultima_marca'] ?? ''));
            });

            return array_slice($items, 0, 10);
        } catch (\Throwable $e) {
            return [];
        }
    }

    public static function seccionProximosJubilarse(int $limiteEdad = 60): array
    {
        try {
            $rows = \App\Models\DatosEmpleado::query()
                ->whereNotNull('fecha_nacimiento')
                ->whereRaw("EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) >= ?", [$limiteEdad])
                ->orderBy('fecha_nacimiento')
                ->limit(10)
                ->get(['anacod', 'fecha_nacimiento']);

            $items = [];
            $anacods = $rows->pluck('anacod')->all();
            if (!empty($anacods)) {
                $empleados = DB::connection('san')
                    ->select(
                        "SELECT anacod, ananam, anarea
                        FROM aplicaciones.pro_anacod
                        WHERE anacod = ANY(?) AND anasta='A' AND anatip='U'",
                        ['{'.implode(',', $anacods).'}']
                    );
                $map = collect($empleados)->keyBy('anacod');

                foreach ($rows as $r) {
                    $e = $map[$r->anacod] ?? null;
                    if (!$e) continue;
                    $edad = Carbon::parse($r->fecha_nacimiento)->age;
                    $items[] = [
                        'anacod' => $r->anacod,
                        'ananam' => $e->ananam,
                        'anarea' => $e->anarea,
                        'edad'   => $edad,
                        'fecha'  => (string) $r->fecha_nacimiento,
                    ];
                }
            }
            return $items;
        } catch (\Throwable $e) {
            return [];
        }
    }

    public static function seccionTopAntiguedad(int $limit = 10): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anacod, ananam, anarea, anapai, fecha_ingreso,
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_ingreso))::int AS anios
            FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U' AND fecha_ingreso IS NOT NULL
            ORDER BY fecha_ingreso ASC
            LIMIT ?",
            [$limit]
        );
        return array_map(fn($r) => [
            'anacod'        => $r->anacod,
            'ananam'        => $r->ananam,
            'anarea'        => $r->anarea,
            'anapai'        => $r->anapai,
            'anios'         => (int) $r->anios,
            'fecha_ingreso' => (string) $r->fecha_ingreso,
        ], $rows);
    }

    public static function seccionCumpleanosHoy(): array
    {
        try {
            $hoy = Carbon::today();
            $mes = (int) $hoy->format('m');
            $dia = (int) $hoy->format('d');
            $rows = DB::connection('san')->select(
                "SELECT anacod, ananam, anames, anadia, anaimg, anapos, anarea
                FROM aplicaciones.pro_anacod
                WHERE anasta='A' AND anatip='U'
                  AND anames = ? AND anadia = ?",
                [$mes, $dia]
            );
            $items = [];
            foreach ($rows as $r) {
                $items[] = [
                    'anacod' => $r->anacod,
                    'ananam' => $r->ananam,
                    'anapos' => $r->anapos,
                    'anarea' => $r->anarea,
                    'anaimg' => $r->anaimg,
                    'fecha'  => $hoy->toDateString(),
                ];
            }
            return $items;
        } catch (\Throwable $e) {
            return [];
        }
    }

    public static function seccionUltimasAltas(int $limit = 8): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anacod, ananam, anasta, fecha_ingreso, anapos, anarea, anapai
            FROM aplicaciones.pro_anacod
            WHERE anatip='U'
              AND fecha_ingreso IS NOT NULL
              AND fecha_ingreso <= CURRENT_DATE
            ORDER BY fecha_ingreso DESC, anacod
            LIMIT ?",
            [$limit]
        );
        return array_map(fn($r) => [
            'anacod'        => $r->anacod,
            'ananam'        => $r->ananam,
            'anasta'        => $r->anasta,
            'fecha_ingreso' => (string) $r->fecha_ingreso,
            'anapos'        => $r->anapos,
            'anarea'        => $r->anarea,
            'anapai'        => $r->anapai,
        ], $rows);
    }

    public static function seccionUltimasBajas(int $limit = 8): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anacod, ananam, anasta, fecha_baja, anapos, anarea, anapai
            FROM aplicaciones.pro_anacod
            WHERE anatip='U'
              AND anasta='I'
              AND fecha_baja IS NOT NULL
              AND fecha_baja <= CURRENT_DATE
            ORDER BY fecha_baja DESC, anacod
            LIMIT ?",
            [$limit]
        );
        return array_map(fn($r) => [
            'anacod'     => $r->anacod,
            'ananam'     => $r->ananam,
            'anasta'     => $r->anasta,
            'fecha_baja' => (string) $r->fecha_baja,
            'anapos'     => $r->anapos,
            'anarea'     => $r->anarea,
            'anapai'     => $r->anapai,
        ], $rows);
    }

    public static function seccionProximosCumpleanos(int $dias = 7): array
    {
        try {
            $hoy = Carbon::today();
            $items = [];
            // Buscar en los próximos N días, considerando que el mes puede cambiar.
            for ($i = 0; $i < $dias; $i++) {
                $fecha = $hoy->copy()->addDays($i);
                $mes = (int) $fecha->format('m');
                $dia = (int) $fecha->format('d');
                $rows = DB::connection('san')->select(
                    "SELECT anacod, ananam, anames, anadia, anaimg, anapos, anarea
                    FROM aplicaciones.pro_anacod
                    WHERE anasta='A' AND anatip='U'
                      AND anames = ? AND anadia = ?",
                    [$mes, $dia]
                );
                foreach ($rows as $r) {
                    $items[] = [
                        'anacod' => $r->anacod,
                        'ananam' => $r->ananam,
                        'anapos' => $r->anapos,
                        'anarea' => $r->anarea,
                        'anaimg' => $r->anaimg,
                        'fecha'  => $fecha->toDateString(),
                        'mes'    => $mes,
                        'dia'    => $dia,
                    ];
                }
            }
            // Quitar duplicados (por si dos empleados tienen el mismo anacod en distintas fechas, improbable).
            $seen = [];
            $unique = [];
            foreach ($items as $it) {
                $key = $it['anacod'].'|'.$it['fecha'];
                if (isset($seen[$key])) continue;
                $seen[$key] = true;
                $unique[] = $it;
            }
            return $unique;
        } catch (\Throwable $e) {
            return [];
        }
    }


    public static function eventosToday() {
        $asistencias = DB::connection( 'san' )->select( 'SELECT * FROM aplicaciones.pro_eventos_asistencia WHERE DATE(fecha) = CURRENT_DATE' );
        return $asistencias;
    }


    public static function tarde() {
        $resumen = DB::connection( 'san' )->select( "SELECT anacod, ananam, COUNT(*) AS veces FROM aplicaciones.pro_eventos_asistencia WHERE evento= 'Tarde' AND DATE(fecha) BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') GROUP BY anacod, ananam ORDER BY veces DESC" );

        return $resumen;
    }


    public static function resumenUsuario( $anacod, $evento ) {
        $resumen = DB::connection( 'san' )->select( "SELECT anacod, ananam, fecha, evento FROM aplicaciones.pro_eventos_asistencia WHERE evento= '$evento' AND DATE(fecha) BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod = '$anacod' ORDER BY fecha ASC" );
        return $resumen;
    }


    public static function resumenAsistenciaContador( $month, $year ) {
        $resumenContador = DB::connection( 'san' )->select( "WITH resumen_eventos AS (
        SELECT a.anacod, b.ananam, b.anajef,
        COUNT(CASE WHEN a.evento = 'Tarde' AND a.accion_personal IS NULL THEN 1 END) AS veces_tarde,
        COUNT(CASE WHEN a.evento = 'Ausencia' AND a.accion_personal IS NULL THEN 1 END) AS veces_ausente,
        COUNT(CASE WHEN a.evento = 'Sin nfc' AND a.accion_personal IS NULL THEN 1 END) AS veces_sin_nfc,
        COUNT(CASE WHEN a.evento = 'Salida antes' AND a.accion_personal IS NULL THEN 1 END) AS veces_salidas_antes
        FROM aplicaciones.pro_eventos_asistencia a
        INNER JOIN aplicaciones.pro_anacod b ON a.anacod = b.anacod
        WHERE EXTRACT(MONTH FROM DATE(fecha)) = $month
        AND EXTRACT(YEAR FROM DATE(fecha)) = $year
        AND b.anasta='A' AND b.anatip = 'U'
        GROUP BY a.anacod, b.ananam, b.anajef)
        SELECT * FROM resumen_eventos WHERE veces_tarde > 0 OR veces_ausente > 0 OR veces_sin_nfc > 0 OR veces_salidas_antes > 0" );
        return $resumenContador;
    }


    public static function resumenMes( $anio, $mes ) {
        $resumenContador = DB::connection( 'san' )->select( "SELECT a.anacod, b.ananam,
        COUNT(CASE WHEN a.evento = 'Tarde' THEN 1 END) AS veces_tarde,
        COUNT(CASE WHEN a.evento='Ausencia' THEN 1 END) AS veces_ausente
        FROM aplicaciones.pro_anacod b
        INNER JOIN aplicaciones.pro_eventos_asistencia a ON  b.anacod = a.anacod
        WHERE EXTRACT(MONTH FROM DATE(fecha))=$mes AND  EXTRACT(YEAR FROM DATE(fecha))=$anio AND b.anatip='U' AND b.anasta='U'
        GROUP BY a.anacod, b.ananam" );
        return $resumenContador;
    }


    public static function ausencia() {
        $resumen = DB::connection( 'san' )->select( "SELECT anacod, ananam, COUNT(*) AS veces FROM aplicaciones.pro_eventos_asistencia WHERE evento= 'Ausencia' AND fecha BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') GROUP BY anacod, ananam ORDER BY veces DESC" );

        return $resumen;
    }


    public static function tasaPuntualidadMes( $mes, $anio ) {
        $result = DB::connection( 'san' )->selectOne( "
            WITH dias_laborales AS (
                SELECT COUNT(*)::int AS total
                FROM generate_series(
                    DATE '$anio-$mes-01',
                    (DATE '$anio-$mes-01' + INTERVAL '1 MONTH - 1 day')::DATE,
                    '1 day'::interval
                ) AS fecha
                WHERE EXTRACT(DOW FROM fecha) BETWEEN 1 AND 5
            ),
            eventos_mes AS (
                SELECT COUNT(*)::int AS total
                FROM aplicaciones.pro_eventos_asistencia a
                INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
                WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = $mes
                  AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
                  AND a.accion_personal IS NULL
                  AND a.evento IN ('Tarde', 'Ausencia', 'Sin nfc', 'Salida antes')
                  AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
            ),
            empleados AS (
                SELECT COUNT(*)::int AS total
                FROM aplicaciones.pro_anacod
                WHERE anasta = 'A' AND anatip = 'U' AND anapai = 'SV'
            )
            SELECT
                (1.0 - (e.total::numeric / NULLIF(d.total * em.total, 0))) * 100 AS tasa
            FROM dias_laborales d, eventos_mes e, empleados em
        " );
        return $result ? (float) $result->tasa : 0.0;
    }


    public static function tasaPuntualidadAnio( $anio ) {
        $result = DB::connection( 'san' )->selectOne( "
            WITH dias_laborales AS (
                SELECT COUNT(*)::int AS total
                FROM generate_series(
                    DATE '$anio-01-01',
                    DATE '$anio-12-31',
                    '1 day'::interval
                ) AS fecha
                WHERE EXTRACT(DOW FROM fecha) BETWEEN 1 AND 5
            ),
            puntos_equipo AS (
                SELECT COALESCE(SUM(
                    CASE
                        WHEN a.evento = 'Ausencia' AND (a.accion_personal IS NULL OR a.accion_personal = '')
                            THEN 10
                        WHEN a.evento = 'Tarde' THEN 3
                        WHEN a.evento = 'Salida antes' THEN 3
                        ELSE 0
                    END
                ), 0)::int AS puntos,
                COUNT(*) FILTER (WHERE b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV')::int AS empleados_check
                FROM aplicaciones.pro_eventos_asistencia a
                INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
                WHERE EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
            ),
            empleados AS (
                SELECT COUNT(*)::int AS total
                FROM aplicaciones.pro_anacod
                WHERE anasta = 'A' AND anatip = 'U' AND anapai = 'SV'
            )
            SELECT
                (1.0 - (p.puntos::numeric / NULLIF(d.total * 10 * em.total, 0))) * 100 AS tasa
            FROM dias_laborales d, puntos_equipo p, empleados em
        " );
        return $result ? (float) $result->tasa : 0.0;
    }


    public static function tasaPuntualidadUsuariosAnio( $anio, $limit = 10 ) {
        return DB::connection( 'san' )->select( "
            WITH dias_laborales AS (
                SELECT COUNT(*)::int AS total
                FROM generate_series(
                    DATE '$anio-01-01',
                    DATE '$anio-12-31',
                    '1 day'::interval
                ) AS fecha
                WHERE EXTRACT(DOW FROM fecha) BETWEEN 1 AND 5
            ),
            puntos_usuario AS (
                SELECT u.anacod,
                    COALESCE(SUM(
                        CASE
                            WHEN a.evento = 'Ausencia' AND (a.accion_personal IS NULL OR a.accion_personal = '')
                                 AND NOT EXISTS (
                                     SELECT 1 FROM aplicaciones.pro_eventos_asistencia b
                                     WHERE b.anacod = a.anacod
                                       AND DATE(b.fecha) = DATE(a.fecha)
                                       AND b.evento = 'Tarde'
                                 )
                                THEN 10
                            WHEN a.evento = 'Tarde' THEN 3
                            WHEN a.evento = 'Salida antes' THEN 3
                            ELSE 0
                        END
                    ), 0)::int AS puntos,
                    COUNT(CASE WHEN a.evento = 'Tarde' AND (a.accion_personal IS NULL OR a.accion_personal = '') THEN 1 END)::int AS tardes,
                    COUNT(CASE WHEN a.evento = 'Salida antes' AND (a.accion_personal IS NULL OR a.accion_personal = '') THEN 1 END)::int AS salidas_antes,
                    COUNT(CASE WHEN a.evento = 'Ausencia' AND (a.accion_personal IS NULL OR a.accion_personal = '')
                                AND NOT EXISTS (
                                    SELECT 1 FROM aplicaciones.pro_eventos_asistencia b
                                    WHERE b.anacod = a.anacod
                                      AND DATE(b.fecha) = DATE(a.fecha)
                                      AND b.evento = 'Tarde'
                                )
                           THEN 1 END)::int AS ausencias,
                    COUNT(CASE WHEN a.evento = 'Sin nfc' AND (a.accion_personal IS NULL OR a.accion_personal = '') THEN 1 END)::int AS sin_nfc
                FROM aplicaciones.pro_anacod u
                LEFT JOIN aplicaciones.pro_eventos_asistencia a
                    ON a.anacod = u.anacod
                    AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
                WHERE u.anasta = 'A' AND u.anatip = 'U' AND u.anapai = 'SV'
                  AND u.fecha_ingreso IS NOT NULL
                  AND u.fecha_ingreso < DATE '$anio-01-01'
                GROUP BY u.anacod
            )
            SELECT b.anacod, b.ananam, b.anajef,
                e.puntos, e.tardes, e.salidas_antes, e.ausencias, e.sin_nfc,
                ROUND((1.0 - (e.puntos::numeric / NULLIF(d.total * 10, 0))) * 100, 1) AS tasa
            FROM puntos_usuario e
            INNER JOIN aplicaciones.pro_anacod b ON b.anacod = e.anacod
            CROSS JOIN dias_laborales d
            ORDER BY e.puntos ASC, e.ausencias ASC, e.tardes ASC, b.ananam ASC
            LIMIT $limit
        " );
    }


    public static function totalEventosMes( $mes, $anio ) {
        $result = DB::connection( 'san' )->selectOne( "
            SELECT COUNT(*)::int AS total
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
            WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = $mes
              AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
              AND a.accion_personal IS NULL
              AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
        " );
        return $result ? (int) $result->total : 0;
    }


    public static function empleadosSinIncidencias( $mes, $anio ) {
        $result = DB::connection( 'san' )->selectOne( "
            SELECT COUNT(*)::int AS total
            FROM aplicaciones.pro_anacod b
            WHERE b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
              AND b.anacod NOT IN (
                  SELECT DISTINCT a.anacod
                  FROM aplicaciones.pro_eventos_asistencia a
                  INNER JOIN aplicaciones.pro_anacod b2 ON b2.anacod = a.anacod
                  WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = $mes
                    AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
                    AND a.accion_personal IS NULL
                    AND b2.anapai = 'SV'
              )
        " );
        return $result ? (int) $result->total : 0;
    }


    public static function tendenciaMensual( $mes, $anio, $cantidad = 6 ) {
        return DB::connection( 'san' )->select( "
            WITH meses AS (
                SELECT
                    EXTRACT(MONTH FROM a.fecha)::int AS mes,
                    EXTRACT(YEAR FROM a.fecha)::int AS anio,
                    a.evento,
                    COUNT(*)::int AS total
                FROM aplicaciones.pro_eventos_asistencia a
                INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
                WHERE a.accion_personal IS NULL
                  AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
                  AND a.fecha >= (
                      DATE '$anio-$mes-01' - INTERVAL '$cantidad months'
                  )
                  AND a.fecha < (DATE '$anio-$mes-01' + INTERVAL '1 month')
                GROUP BY 1, 2, 3
            )
            SELECT anio, mes,
                SUM(CASE WHEN evento = 'Tarde' THEN total ELSE 0 END) AS tardes,
                SUM(CASE WHEN evento = 'Ausencia' THEN total ELSE 0 END) AS ausencias,
                SUM(CASE WHEN evento = 'Sin nfc' THEN total ELSE 0 END) AS sin_nfc,
                SUM(CASE WHEN evento = 'Salida antes' THEN total ELSE 0 END) AS salidas_antes,
                SUM(total) AS total
            FROM meses
            GROUP BY anio, mes
            ORDER BY anio, mes
        " );
    }


    public static function eventosPorJefe( $mes, $anio ) {
        return DB::connection( 'san' )->select( "
            SELECT
                COALESCE(NULLIF(b.anajef, ''), 'Sin jefe') AS jefe,
                COUNT(*)::int AS total,
                SUM(CASE WHEN a.evento = 'Tarde' THEN 1 ELSE 0 END)::int AS tardes,
                SUM(CASE WHEN a.evento = 'Ausencia' THEN 1 ELSE 0 END)::int AS ausencias,
                SUM(CASE WHEN a.evento = 'Sin nfc' THEN 1 ELSE 0 END)::int AS sin_nfc,
                SUM(CASE WHEN a.evento = 'Salida antes' THEN 1 ELSE 0 END)::int AS salidas_antes
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
            WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = $mes
              AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
              AND a.accion_personal IS NULL
              AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
            GROUP BY b.anajef
            ORDER BY total DESC
        " );
    }


    public static function topImpuntuales( $mes, $anio, $limit = 5 ) {
        return DB::connection( 'san' )->select( "
            SELECT a.anacod, b.ananam, b.anajef,
                COUNT(*)::int AS total_eventos,
                SUM(CASE WHEN a.evento = 'Tarde' THEN 1 ELSE 0 END)::int AS tardes,
                SUM(CASE WHEN a.evento = 'Ausencia' THEN 1 ELSE 0 END)::int AS ausencias,
                SUM(CASE WHEN a.evento = 'Sin nfc' THEN 1 ELSE 0 END)::int AS sin_nfc,
                SUM(CASE WHEN a.evento = 'Salida antes' THEN 1 ELSE 0 END)::int AS salidas_antes
            FROM aplicaciones.pro_eventos_asistencia a
            INNER JOIN aplicaciones.pro_anacod b ON b.anacod = a.anacod
            WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = $mes
              AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
              AND a.accion_personal IS NULL
              AND b.anasta = 'A' AND b.anatip = 'U' AND b.anapai = 'SV'
            GROUP BY a.anacod, b.ananam, b.anajef
            HAVING COUNT(*) > 0
            ORDER BY total_eventos DESC
            LIMIT $limit
        " );
    }


    public static function topPontuales( $mes, $anio, $limit = 5 ) {
        return DB::connection( 'san' )->select( "
            WITH dias_laborales_mes AS (
                SELECT COUNT(*)::int AS total
                FROM generate_series(
                    DATE '$anio-$mes-01',
                    (DATE '$anio-$mes-01' + INTERVAL '1 MONTH - 1 day')::DATE,
                    '1 day'::interval
                ) AS fecha
                WHERE EXTRACT(DOW FROM fecha) BETWEEN 1 AND 5
            ),
            puntos_usuario AS (
                SELECT u.anacod,
                    COALESCE(SUM(
                        CASE
                            WHEN a.evento = 'Ausencia' AND (a.accion_personal IS NULL OR a.accion_personal = '')
                                 AND NOT EXISTS (
                                     SELECT 1 FROM aplicaciones.pro_eventos_asistencia b
                                     WHERE b.anacod = a.anacod
                                       AND DATE(b.fecha) = DATE(a.fecha)
                                       AND b.evento = 'Tarde'
                                 )
                                THEN 10
                            WHEN a.evento = 'Tarde' THEN 3
                            WHEN a.evento = 'Salida antes' THEN 3
                            ELSE 0
                        END
                    ), 0)::int AS puntos,
                    COUNT(CASE WHEN a.evento = 'Tarde' AND (a.accion_personal IS NULL OR a.accion_personal = '') THEN 1 END)::int AS tardes,
                    COUNT(CASE WHEN a.evento = 'Salida antes' AND (a.accion_personal IS NULL OR a.accion_personal = '') THEN 1 END)::int AS salidas_antes,
                    COUNT(CASE WHEN a.evento = 'Ausencia' AND (a.accion_personal IS NULL OR a.accion_personal = '')
                                AND NOT EXISTS (
                                    SELECT 1 FROM aplicaciones.pro_eventos_asistencia b
                                    WHERE b.anacod = a.anacod
                                      AND DATE(b.fecha) = DATE(a.fecha)
                                      AND b.evento = 'Tarde'
                                )
                           THEN 1 END)::int AS ausencias,
                    COUNT(CASE WHEN a.evento = 'Sin nfc' AND (a.accion_personal IS NULL OR a.accion_personal = '') THEN 1 END)::int AS sin_nfc
                FROM aplicaciones.pro_anacod u
                LEFT JOIN aplicaciones.pro_eventos_asistencia a
                    ON a.anacod = u.anacod
                    AND EXTRACT(MONTH FROM DATE(a.fecha)) = $mes
                    AND EXTRACT(YEAR FROM DATE(a.fecha)) = $anio
                WHERE u.anasta = 'A' AND u.anatip = 'U' AND u.anapai = 'SV'
                GROUP BY u.anacod
            )
            SELECT b.anacod, b.ananam, b.anajef,
                e.puntos, e.tardes, e.salidas_antes, e.ausencias, e.sin_nfc,
                ROUND((1.0 - (e.puntos::numeric / NULLIF(d.total * 10, 0))) * 100, 1) AS tasa
            FROM puntos_usuario e
            INNER JOIN aplicaciones.pro_anacod b ON b.anacod = e.anacod
            CROSS JOIN dias_laborales_mes d
            ORDER BY e.puntos ASC, e.ausencias ASC, e.tardes ASC, b.ananam ASC
            LIMIT $limit
        " );
    }


    public static function registrosNFC( $fecha, $usuario = '' ) {
        $registros = DB::connection( 'san' )->select( "SELECT u.uid, u.anacod, pa.ananam, pa.anajef, mac, fecha_registro as hora, evento FROM aplicaciones.log_accesos_sitios a left join aplicaciones.pro_anatags u ON u.uid=a.uid  left join aplicaciones.pro_anacod pa on pa.anacod = u.anacod where fecha_registro >= (DATE('$fecha') - INTERVAL '3 HOURS') AND fecha_registro <= (DATE('$fecha') + INTERVAL '1 day' + INTERVAL '3 hours') AND u.anacod IS NOT NULL AND ('$usuario' = '' OR u.anacod = '$usuario') order by u.anacod" );
        return $registros;
    }


    public static function registrosNFCRango( $fecha, $fecha_fin, $usuario = '' ) {
        $registros = DB::connection( 'san' )->select( "SELECT u.uid, u.anacod, pa.ananam, pa.anajef, a.mac, a.fecha_registro AS hora, a.evento
            FROM aplicaciones.log_accesos_sitios a
            LEFT JOIN aplicaciones.pro_anatags u ON u.uid = a.uid
            LEFT JOIN aplicaciones.pro_anacod pa ON pa.anacod = u.anacod
            WHERE a.fecha_registro BETWEEN '$fecha' AND '$fecha_fin'
            AND u.anacod IS NOT NULL
            AND ('$usuario' = '' OR u.anacod = '$usuario')
            ORDER BY u.anacod, hora;"
        );

        return $registros;
    }


    public static function horasNFCMes( $anio, $mes ) {

        $registros = DB::connection( 'san' )->select( "WITH calendario_mes AS (
            SELECT
                generate_series(
                    DATE_TRUNC('MONTH', DATE '$anio-$mes-01')::DATE,  -- Primer día del mes deseado
                    DATE_TRUNC('MONTH', DATE '$anio-$mes-01')::DATE + INTERVAL '1 MONTH - 1 day',  -- Último día del mes deseado
                    INTERVAL '1 day'
                ) AS fecha
            ),
            marcas_numeradas AS (
            SELECT
                u.anacod,
                u.ananam,
                h.id AS horario_id,
                h.nombre AS horario,
                hd.numero_dia AS dia,
                h.dia_libre1,
                h.dia_libre2,
                hd.entrada,
                hd.salida_almuerzo,
                hd.entrada_almuerzo,
                hd.salida,
                cm.fecha AS fecha_dia,
                m.fecha AS fecha_marcacion,
                ROW_NUMBER() OVER (PARTITION BY u.anacod, cm.fecha ORDER BY m.fecha) AS numero_marca
            FROM
                aplicaciones.pro_horarios AS h
            JOIN
                aplicaciones.pro_horario_dias AS hd ON h.id = hd.horario_id
            JOIN
                aplicaciones.pro_anacod AS u ON u.horario_id::INT = h.id::INT
            LEFT JOIN
                aplicaciones.pro_marcaciones AS m ON m.anacod = u.anacod
            JOIN
                calendario_mes AS cm ON DATE_TRUNC('DAY', m.fecha) = cm.fecha
            WHERE
                hd.numero_dia = EXTRACT(DOW FROM m.fecha)
                AND u.anasta = 'A'
                AND DATE_TRUNC('MONTH', m.fecha) = DATE '$anio-$mes-01'
            ),

            marcas_sin_nfc AS (
                SELECT
                    huella.anacod,
                    huella.ananam,
                    huella.horario_id,
                    huella.horario,
                    huella.dia,
                    huella.dia_libre1,
                    huella.dia_libre2,
                    huella.entrada,
                    huella.salida_almuerzo,
                    huella.entrada_almuerzo,
                    huella.salida,
                    huella.fecha_dia AS fecha,
                    MAX(CASE WHEN numero_marca = 1 THEN fecha_marcacion ELSE NULL END) AS huella_1,
                    MAX(CASE WHEN numero_marca = 2 THEN fecha_marcacion ELSE NULL END) AS huella_2,
                    MAX(CASE WHEN numero_marca = 3 THEN fecha_marcacion ELSE NULL END) AS huella_3,
                    MAX(CASE WHEN numero_marca = 4 THEN fecha_marcacion ELSE NULL END) AS huella_4,
                    MAX(CASE WHEN numero_marca = 5 THEN fecha_marcacion ELSE NULL END) AS huella_5,
                    MAX(CASE WHEN numero_marca = 6 THEN fecha_marcacion ELSE NULL END) AS huella_6
                FROM
                    marcas_numeradas huella
                GROUP BY
                    huella.anacod, huella.ananam, huella.horario_id, huella.horario,
                    huella.dia, huella.dia_libre1, huella.dia_libre2, huella.entrada,
                    huella.salida_almuerzo, huella.entrada_almuerzo, huella.salida, huella.fecha_dia
                ORDER BY
                    huella.anacod, huella.fecha_dia
            ),
            EventosOrdenados AS (
                SELECT
                    u.uid,
                    u.anacod,
                    a.mac,
                    a.fecha_registro AS hora,
                    a.evento,
                    LAG(a.fecha_registro) OVER (PARTITION BY u.uid, u.anacod ORDER BY a.fecha_registro) AS hora_anterior,
                    LEAD(a.fecha_registro) OVER (PARTITION BY u.uid, u.anacod ORDER BY a.fecha_registro) AS hora_siguiente,
                    LAG(a.evento) OVER (PARTITION BY u.uid, u.anacod ORDER BY a.fecha_registro) AS evento_anterior,
                    LEAD(a.evento) OVER (PARTITION BY u.uid, u.anacod ORDER BY a.fecha_registro) AS evento_siguiente
                FROM aplicaciones.log_accesos_sitios a
                LEFT JOIN aplicaciones.pro_anatags u ON u.uid = a.uid
                WHERE EXTRACT(YEAR FROM a.fecha_registro) = $anio
                AND EXTRACT(MONTH FROM a.fecha_registro) = $mes
                AND u.anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta = 'A' AND anatip='U')
            ),
            datos AS(
            SELECT uid, anacod,mac, hora,
                evento,
                EXTRACT(HOUR FROM hora) * 3600 +
                EXTRACT(MINUTE FROM hora) * 60 +
                EXTRACT(SECOND FROM hora) AS segundos,
            ROW_NUMBER() OVER (ORDER BY anacod, hora) AS row_num
            FROM EventosOrdenados
            WHERE (evento = 'ENTRADA' AND evento_siguiente = 'SALIDA' AND DATE(hora) = DATE(hora_siguiente))
            OR (evento = 'SALIDA' AND evento_anterior = 'ENTRADA' AND DATE(hora)= DATE(hora_anterior))
            ORDER BY anacod, hora),
            paired_rows AS (
            SELECT
                    n1.anacod AS anacod,
                    n1.evento AS evento1,
                    n1.hora AS hora1,
                    n2.evento AS evento2,
                    n2.hora AS hora2,
                    n1.segundos AS segundos1,
                    n2.segundos AS segundos2
                FROM datos n1
                JOIN datos n2 ON n1.row_num = n2.row_num - 1
            ),
            resultados AS(select anacod, hora1 AS hora_entrada, hora2 AS hora_salida,segundos1, segundos2, segundos2 - segundos1 AS segundos from paired_rows where evento1='ENTRADA'),
            anacod AS (SELECT * FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'),
            tiempo_nfc as (
            SELECT r.anacod, a.ananam as nombre, DATE(r.hora_entrada) AS fecha, SUM(r.segundos) FROM resultados r
            INNER JOIN anacod a ON a.anacod = r.anacod
            GROUP BY fecha, r.anacod, a.ananam ORDER BY r.anacod, fecha),
            no_sum_huella AS (
            SELECT a.anacod, a.ananam AS nombre, a.horario_id, a.horario, a.dia,
                a.dia_libre1, a.dia_libre2, a.entrada, a.salida_almuerzo, a.entrada_almuerzo,
                a.salida,  DATE(a.fecha) AS fecha,
                    COALESCE(
                        (SELECT huella FROM unnest(ARRAY[a.huella_1, a.huella_2, a.huella_3, a.huella_4, a.huella_5, a.huella_6]) huella
                        WHERE huella IS NOT NULL
                        ORDER BY huella ASC
                        LIMIT 1),
                        '1900-01-01 00:00:00'::timestamp
                    ) AS primera_huella,
                COALESCE(
                        (SELECT huella FROM unnest(ARRAY[a.huella_1, a.huella_2, a.huella_3, a.huella_4, a.huella_5, a.huella_6]) huella
                        WHERE huella IS NOT NULL
                        ORDER BY huella DESC
                        LIMIT 1),
                        '1900-01-01 00:00:00'::timestamp
                    ) AS ultima_huella,
                COALESCE(t.sum, 0) AS sum, DATE(a.fecha)

            FROM marcas_sin_nfc a
            LEFT JOIN tiempo_nfc t ON a.anacod= t.anacod AND a.fecha = t.fecha

            ORDER BY
                a.anacod, a.fecha)
            SELECT
                anacod,
                nombre,
                horario_id,
                horario,
                dia,
                dia_libre1,
                dia_libre2,
                entrada,
                salida_almuerzo,
                entrada_almuerzo,
                salida,
                fecha,
                sum,
                fecha,
                EXTRACT(EPOCH FROM (entrada_almuerzo - DATE_TRUNC('day', entrada_almuerzo))) AS entrada_almuerzo_t,
                EXTRACT(EPOCH FROM (primera_huella - DATE_TRUNC('day', primera_huella))) AS primera_huella_t,
                EXTRACT(EPOCH FROM (ultima_huella - DATE_TRUNC('day', ultima_huella))) AS ultimahuella_t,
                EXTRACT(EPOCH FROM (ultima_huella - DATE_TRUNC('day', ultima_huella))) -
                EXTRACT(EPOCH FROM (primera_huella - DATE_TRUNC('day', primera_huella))) -
                    CASE
                    WHEN EXTRACT(EPOCH FROM (ultima_huella - DATE_TRUNC('day', ultima_huella))) > EXTRACT(EPOCH FROM (entrada_almuerzo - DATE_TRUNC('day', entrada_almuerzo))) AND EXTRACT(EPOCH FROM (primera_huella - DATE_TRUNC('day', ultima_huella))) < EXTRACT(EPOCH FROM (entrada_almuerzo - DATE_TRUNC('day', entrada_almuerzo)))THEN 3600  -- 3600 segundos = 1 hora
                    ELSE 0
                END  AS sum_huella

            FROM no_sum_huella ORDER BY  anacod, fecha;
            " );

        return $registros;
    }


    public static function marcas( $fecha ) {
        $marcas = DB::connection( 'san' )->select( "WITH marcaciones_numeradas AS (SELECT
                        u.anacod,
                        u.ananam,
                        h.id as horario_id,
                        h.nombre as horario,
                        hd.numero_dia as dia,
                        h.dia_libre1,
                        h.dia_libre2,
                        hd.numero_dia,
                        hd.entrada,
                        hd.salida_almuerzo,
                        hd.entrada_almuerzo,
                        hd.salida,
                        m.fecha,
                        ROW_NUMBER() OVER (PARTITION BY u.anacod ORDER BY m.fecha) AS numero_marca
                    FROM
                        aplicaciones.pro_horarios AS h
                    LEFT JOIN
                        aplicaciones.pro_horario_dias AS hd ON h.id = hd.horario_id
                    LEFT JOIN
                        aplicaciones.pro_anacod AS u ON CAST(u.horario_id AS INT) = h.id
                    LEFT JOIN
                        aplicaciones.pro_marcaciones AS m ON m.anacod = u.anacod
                    WHERE
                        hd.numero_dia = EXTRACT(DOW FROM DATE(m.fecha))
                        AND u.anasta ='A'
                        AND DATE(m.fecha) = '$fecha'
                        AND u.anacod = m.anacod
                )
                SELECT
                    anacod, ananam, horario_id, horario, dia,dia_libre1,dia_libre2,entrada,salida_almuerzo,entrada_almuerzo,salida,
                    MAX(CASE WHEN numero_marca = 1 THEN fecha ELSE NULL END) AS marca_1,
                    MAX(CASE WHEN numero_marca = 2 THEN fecha ELSE NULL END) AS marca_2,
                    MAX(CASE WHEN numero_marca = 3 THEN fecha ELSE NULL END) AS marca_3,
                    MAX(CASE WHEN numero_marca = 4 THEN fecha ELSE NULL END) AS marca_4,
                    MAX(CASE WHEN numero_marca = 5 THEN fecha ELSE NULL END) AS marca_5,
                    MAX(CASE WHEN numero_marca = 6 THEN fecha ELSE NULL END) AS marca_6,
                    MAX(CASE WHEN numero_marca = 7 THEN fecha ELSE NULL END) AS marca_7
                FROM
                    marcaciones_numeradas
                GROUP BY
                    anacod, ananam, horario_id, horario, dia,dia_libre1,dia_libre2,entrada,salida_almuerzo,entrada_almuerzo,salida
                ORDER BY
                    anacod " );

                return $marcas;
            }


    public static function marcasCompletasDia( $fecha, $fechaFin = null, $usuario = '' ) {
        $esRango = $fechaFin && $fechaFin !== $fecha;

        if ( $esRango ) {
            $calendario = "calendario_dia AS (
                SELECT generate_series(DATE '$fecha', DATE '$fechaFin', '1 day')::DATE AS fecha
            )";
            $filtroFecha = "DATE_TRUNC('DAY', m.fecha) = cd.fecha";
            $filtroNfcEntrada = "DATE_TRUNC('DAY', a.fecha_registro) IN (SELECT fecha FROM calendario_dia)";
            $filtroNfcSalida = "DATE_TRUNC('DAY', a.fecha_registro) IN (SELECT fecha FROM calendario_dia)";
            $joinDatos = "b.anacod = a.anacod AND DATE(b.fecha) IN (SELECT fecha FROM calendario_dia)";
        } else {
            $calendario = "calendario_dia AS (SELECT DATE '$fecha' AS fecha)";
            $filtroFecha = "DATE(m.fecha) = cd.fecha";
            $filtroNfcEntrada = "DATE(a.fecha_registro) = (SELECT fecha FROM calendario_dia)";
            $filtroNfcSalida = "DATE(a.fecha_registro) = (SELECT fecha FROM calendario_dia)";
            $joinDatos = "b.anacod = a.anacod AND DATE(b.fecha) = (SELECT fecha FROM calendario_dia)";
        }

        $marcas = DB::connection( 'san' )->select( "WITH $calendario,
        marcas_numeradas AS (
            SELECT
                u.anacod,
                u.ananam,
                h.id AS horario_id,
                h.nombre AS horario,
                hd.numero_dia AS dia,
                h.dia_libre1,
                h.dia_libre2,
                hd.numero_dia,
                hd.entrada,
                hd.salida_almuerzo,
                hd.entrada_almuerzo,
                hd.salida,
                cd.fecha AS fecha_dia,
                m.fecha AS fecha_marcacion,
                ROW_NUMBER() OVER (PARTITION BY u.anacod, cd.fecha ORDER BY m.fecha) AS numero_marca
            FROM
                aplicaciones.pro_horarios AS h
            JOIN
                aplicaciones.pro_horario_dias AS hd ON h.id = hd.horario_id
            JOIN
                aplicaciones.pro_anacod AS u ON u.horario_id::INT = h.id::INT
            LEFT JOIN
                aplicaciones.pro_marcaciones AS m ON m.anacod = u.anacod
            JOIN
                calendario_dia AS cd ON $filtroFecha
            WHERE
                hd.numero_dia = EXTRACT(DOW FROM cd.fecha)
                AND u.anasta = 'A'
                AND u.anatip = 'U'
        ),

        primeras_entradas AS (
            SELECT
                u.uid,
                u.anacod,
                a.mac,
                DATE(a.fecha_registro) AS fecha,
                MIN(a.fecha_registro) AS hora_entrada
            FROM
                aplicaciones.log_accesos_sitios a
            JOIN
                aplicaciones.pro_anatags u ON u.uid = a.uid
            WHERE
                a.evento = 'ENTRADA'
                AND $filtroNfcEntrada
            GROUP BY
                u.uid, u.anacod, a.mac, DATE(a.fecha_registro)
        ),

        ultimas_salidas AS (
            SELECT
                u.uid,
                u.anacod,
                a.mac,
                DATE(a.fecha_registro) AS fecha,
                MAX(a.fecha_registro) AS hora_salida
            FROM
                aplicaciones.log_accesos_sitios a
            JOIN
                aplicaciones.pro_anatags u ON u.uid = a.uid
            WHERE
                a.evento = 'SALIDA'
                AND $filtroNfcSalida
            GROUP BY
                u.uid, u.anacod, a.mac, DATE(a.fecha_registro)
        ),

        marcas_nfc AS (
            SELECT
                pe.uid,
                pe.anacod,
                pe.mac,
                pe.fecha,
                pe.hora_entrada,
                us.hora_salida
            FROM
                primeras_entradas pe
            LEFT JOIN
                ultimas_salidas us ON pe.anacod = us.anacod AND pe.fecha = us.fecha
        ),

        marcas_sin_nfc AS (
            SELECT
                huella.anacod,
                huella.ananam,
                huella.horario_id,
                huella.horario,
                huella.dia,
                huella.dia_libre1,
                huella.dia_libre2,
                huella.entrada,
                huella.salida_almuerzo,
                huella.entrada_almuerzo,
                huella.salida,
                huella.fecha_dia AS fecha,
                MAX(CASE WHEN numero_marca = 1 THEN fecha_marcacion ELSE NULL END) AS huella_1,
                MAX(CASE WHEN numero_marca = 2 THEN fecha_marcacion ELSE NULL END) AS huella_2,
                MAX(CASE WHEN numero_marca = 3 THEN fecha_marcacion ELSE NULL END) AS huella_3,
                MAX(CASE WHEN numero_marca = 4 THEN fecha_marcacion ELSE NULL END) AS huella_4,
                MAX(CASE WHEN numero_marca = 5 THEN fecha_marcacion ELSE NULL END) AS huella_5,
                MAX(CASE WHEN numero_marca = 6 THEN fecha_marcacion ELSE NULL END) AS huella_6
            FROM
                marcas_numeradas huella
            GROUP BY
                huella.anacod, huella.ananam, huella.horario_id, huella.horario, huella.dia,
                huella.dia_libre1, huella.dia_libre2, huella.entrada, huella.salida_almuerzo,
                huella.entrada_almuerzo, huella.salida, huella.fecha_dia
            ORDER BY
                huella.anacod, huella.fecha_dia
        ),
        datos as (
        SELECT
            a.anacod,
            a.ananam,
            a.horario_id,
            a.horario,
            a.dia,
            a.dia_libre1,
            a.dia_libre2,
            a.entrada,
            a.salida_almuerzo,
            a.entrada_almuerzo,
            a.salida,
            DATE(a.fecha) AS fecha,
            TO_CHAR(b.hora_entrada, 'HH24:MI') AS nfc_entrada,
            TO_CHAR(b.hora_salida, 'HH24:MI') AS nfc_salida,
            TO_CHAR(a.huella_1, 'HH24:MI') AS huella_1,
            TO_CHAR(a.huella_2, 'HH24:MI') AS huella_2,
            TO_CHAR(a.huella_3, 'HH24:MI') AS huella_3,
            TO_CHAR(a.huella_4, 'HH24:MI') AS huella_4,
            TO_CHAR(a.huella_5, 'HH24:MI') AS huella_5,
            TO_CHAR(a.huella_6, 'HH24:MI') AS huella_6
        FROM
            marcas_sin_nfc a
        LEFT JOIN
            marcas_nfc b
        ON
            a.anacod = b.anacod
            AND DATE(a.fecha) = DATE(b.fecha)

        ORDER BY
            a.anacod, a.fecha),
        info_empleados as (
        SELECT DISTINCT
                u.anacod,
                u.ananam,
                u.anajef,
                h.id AS horario_id,
                h.nombre AS horario
            FROM aplicaciones.pro_anacod AS u
            LEFT JOIN aplicaciones.pro_horarios AS h
                ON CAST(u.horario_id AS INT) = CAST(h.id AS INT)
                where u.anasta = 'A' AND u.anapai='SV' AND u.anatip = 'U'
        )

        SELECT a.*, b.fecha, b.nfc_entrada, b.nfc_salida, b.huella_1, b.huella_2, b.huella_3, b.huella_4, b.huella_5, b.huella_6
        FROM info_empleados a
        LEFT JOIN datos b  ON $joinDatos
        WHERE ('$usuario' = '' OR a.anacod = '$usuario')
        ORDER BY a.anacod, b.fecha
        " );

        return $marcas;
    }


    public static function marcasCompletasMes( $fecha ) {
        $marcas = DB::connection( 'san' )->select( "WITH calendario_mes AS (
        SELECT
        generate_series(
            DATE_TRUNC('MONTH', DATE '$fecha')::DATE,  -- Primer día del mes deseado
            DATE_TRUNC('MONTH', DATE '$fecha')::DATE + INTERVAL '1 MONTH - 1 day',  -- Último día del mes deseado
            INTERVAL '1 day'
                ) AS fecha
        ),
        marcas_numeradas AS (
            SELECT
                u.anacod,
                u.ananam,
                h.id AS horario_id,
                h.nombre AS horario,
                hd.numero_dia AS dia,
                h.dia_libre1,
                h.dia_libre2,
                hd.entrada,
                hd.salida_almuerzo,
                hd.entrada_almuerzo,
                hd.salida,
                cm.fecha AS fecha_dia,
                m.fecha AS fecha_marcacion,
                ROW_NUMBER() OVER (PARTITION BY u.anacod, cm.fecha ORDER BY m.fecha) AS numero_marca
            FROM
                aplicaciones.pro_horarios AS h
            JOIN
                aplicaciones.pro_horario_dias AS hd ON h.id = hd.horario_id
            JOIN
                aplicaciones.pro_anacod AS u ON u.horario_id::INT = h.id::INT
            LEFT JOIN
                aplicaciones.pro_marcaciones AS m ON m.anacod = u.anacod
            JOIN
                calendario_mes AS cm ON DATE_TRUNC('DAY', m.fecha) = cm.fecha
            WHERE
                hd.numero_dia = EXTRACT(DOW FROM m.fecha)
                AND u.anasta = 'A'
                AND DATE_TRUNC('MONTH', m.fecha) = DATE '$fecha'
        ),

        primeras_entradas AS (
            SELECT
                u.uid,
                u.anacod,
                a.mac,
                DATE(a.fecha_registro) AS fecha,
                MIN(a.fecha_registro) AS hora_entrada
            FROM
                aplicaciones.log_accesos_sitios a
            JOIN
                aplicaciones.pro_anatags u ON u.uid = a.uid
            WHERE
                a.evento = 'ENTRADA'
                AND DATE_TRUNC('MONTH', a.fecha_registro::DATE) = DATE '$fecha'
            GROUP BY
                u.uid, u.anacod, a.mac, DATE(a.fecha_registro)
        ),
        ultimas_salidas AS (
            SELECT
                u.uid,
                u.anacod,
                a.mac,
                DATE(a.fecha_registro) AS fecha,
                MAX(a.fecha_registro) AS hora_salida
            FROM
                aplicaciones.log_accesos_sitios a
            JOIN
                aplicaciones.pro_anatags u ON u.uid = a.uid
            WHERE
                a.evento = 'SALIDA'
                AND DATE_TRUNC('MONTH', a.fecha_registro::DATE) = DATE '$fecha'
            GROUP BY
                u.uid, u.anacod, a.mac, DATE(a.fecha_registro)
        ),
        marcas_nfc AS (
            SELECT
                pe.uid,
                pe.anacod,
                pe.mac,
                pe.fecha,
                pe.hora_entrada,
                us.hora_salida
            FROM
                primeras_entradas pe
            LEFT JOIN
                ultimas_salidas us ON pe.anacod = us.anacod AND pe.fecha = us.fecha
        ),
        marcas_sin_nfc AS (
            SELECT
                huella.anacod,
                huella.ananam,
                huella.horario_id,
                huella.horario,
                huella.dia,
                huella.dia_libre1,
                huella.dia_libre2,
                huella.entrada,
                huella.salida_almuerzo,
                huella.entrada_almuerzo,
                huella.salida,
                huella.fecha_dia AS fecha,
                MAX(CASE WHEN numero_marca = 1 THEN fecha_marcacion ELSE NULL END) AS huella_1,
                MAX(CASE WHEN numero_marca = 2 THEN fecha_marcacion ELSE NULL END) AS huella_2,
                MAX(CASE WHEN numero_marca = 3 THEN fecha_marcacion ELSE NULL END) AS huella_3,
                MAX(CASE WHEN numero_marca = 4 THEN fecha_marcacion ELSE NULL END) AS huella_4,
                MAX(CASE WHEN numero_marca = 5 THEN fecha_marcacion ELSE NULL END) AS huella_5,
                MAX(CASE WHEN numero_marca = 6 THEN fecha_marcacion ELSE NULL END) AS huella_6
            FROM
                marcas_numeradas huella
            GROUP BY
                huella.anacod, huella.ananam, huella.horario_id, huella.horario,
                huella.dia, huella.dia_libre1, huella.dia_libre2, huella.entrada,
                huella.salida_almuerzo, huella.entrada_almuerzo, huella.salida, huella.fecha_dia
            ORDER BY
                huella.anacod, huella.fecha_dia
        )

        SELECT
            a.anacod,
            a.ananam,
            a.horario_id,
            a.horario,
            a.dia,
            a.dia_libre1,
            a.dia_libre2,
            a.entrada,
            a.salida_almuerzo,
            a.entrada_almuerzo,
            a.salida,
            DATE(a.fecha) AS fecha,
            TO_CHAR(b.hora_entrada, 'HH24:MI') AS nfc_entrada,
            TO_CHAR(b.hora_salida, 'HH24:MI') AS nfc_salida,
            TO_CHAR(a.huella_1, 'HH24:MI') AS huella_1,
            TO_CHAR(a.huella_2, 'HH24:MI') AS huella_2,
            TO_CHAR(a.huella_3, 'HH24:MI') AS huella_3,
            TO_CHAR(a.huella_4, 'HH24:MI') AS huella_4,
            TO_CHAR(a.huella_5, 'HH24:MI') AS huella_5,
            TO_CHAR(a.huella_6, 'HH24:MI') AS huella_6

        FROM
            marcas_sin_nfc a
        LEFT JOIN
            marcas_nfc b
        ON
            a.anacod = b.anacod
            AND DATE(a.fecha) = DATE(b.fecha)
        ORDER BY
            a.anacod, a.fecha;
        " );
        return $marcas;
    }


    public static function tags() {
        $tags = DB::connection( 'san' )->select( "SELECT t.uid, u.anacod, u.ananam from aplicaciones.pro_anacod u
                left join aplicaciones.pro_anatags t on t.anacod = u.anacod
                where anasta= 'A' and anapai ='SV' and anatip='U'
                union
                select uid, anacod, '' as ananam from aplicaciones.pro_anatags where anacod not in (select anacod from aplicaciones.pro_anacod)
                order by ananam asc
        " );
        return $tags;
    }


    public static function tagsConTag() {
        return DB::connection( 'san' )->select( "
            SELECT t.uid, u.anacod, u.ananam
            FROM aplicaciones.pro_anatags t
            INNER JOIN aplicaciones.pro_anacod u ON u.anacod = t.anacod
            WHERE u.anasta = 'A' AND u.anapai = 'SV' AND u.anatip = 'U'
            ORDER BY u.ananam ASC
        " );
    }


    public static function tagsSinTag() {
        return DB::connection( 'san' )->select( "
            SELECT u.anacod, u.ananam
            FROM aplicaciones.pro_anacod u
            WHERE u.anasta = 'A' AND u.anapai = 'SV' AND u.anatip = 'U'
              AND NOT EXISTS (
                  SELECT 1 FROM aplicaciones.pro_anatags t WHERE t.anacod = u.anacod
              )
            ORDER BY u.ananam ASC
        " );
    }


    public static function totalEmpleadosActivos() {
        $result = DB::connection( 'san' )->selectOne( "
            SELECT COUNT(*) AS total
            FROM aplicaciones.pro_anacod u
            WHERE u.anasta = 'A' AND u.anapai = 'SV' AND u.anatip = 'U'
        " );
        return $result ? (int) $result->total : 0;
    }


    public static function nfcStore( $uid, $anacod ) {
        return DB::connection( 'san' )->insert( "INSERT INTO aplicaciones.pro_anatags (anacod, uid) 
        VALUES ('$anacod', '$uid') ON CONFLICT (uid) DO UPDATE SET anacod = EXCLUDED.anacod" );
    }


    public static function deleteTag( $uid ) {
        return DB::connection( 'san' )->delete( 'DELETE FROM aplicaciones.pro_anatags WHERE uid = ?', [ $uid ] );

    }



}