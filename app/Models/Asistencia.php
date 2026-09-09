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

    public static function seccionTopAntiguedad(int $limit = 5): array
    {
        $rows = DB::connection('san')->select(
            "SELECT anacod, ananam, anarea, fecha_ingreso,
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_ingreso))::int AS anios
            FROM aplicaciones.pro_anacod
            WHERE anasta='A' AND anatip='U' AND fecha_ingreso IS NOT NULL AND anapai='SV'
            ORDER BY fecha_ingreso ASC
            LIMIT ?",
            [$limit]
        );
        return array_map(fn($r) => [
            'anacod'        => $r->anacod,
            'ananam'        => $r->ananam,
            'anarea'        => $r->anarea,
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
}
