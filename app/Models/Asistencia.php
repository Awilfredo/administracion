<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Asistencia extends Model {
    use HasFactory;
    protected $connection = 'san';
    public $timestamps = false;
    protected $table = 'aplicaciones.pro_eventos_asistencia';
    protected $fillable = [ 'accion_personal' ];

    public static function dashboard() {
        $data = DB::connection( 'san' )->select( "WITH
            empleados AS (
                SELECT COUNT(*) AS empleados_activos
                FROM aplicaciones.pro_anacod
                WHERE anasta = 'A' AND anatip = 'U' AND anapai = 'SV'
            ),
            eventos AS (
                SELECT b.anacod, b.ananam,
                    COUNT(CASE WHEN a.evento = 'Tarde' AND a.accion_personal IS NULL THEN 1 END) AS veces_tarde,
                    COUNT(CASE WHEN a.evento = 'Ausencia' AND a.accion_personal IS NULL THEN 1 END) AS veces_ausente,
                    COUNT(CASE WHEN a.evento = 'Salida antes' AND a.accion_personal IS NULL THEN 1 END) AS salidas_antes
                FROM aplicaciones.pro_anacod b
                INNER JOIN aplicaciones.pro_eventos_asistencia a ON a.anacod = b.anacod
                WHERE EXTRACT(MONTH FROM DATE(a.fecha)) = EXTRACT(MONTH FROM CURRENT_DATE)
                GROUP BY b.anacod, b.ananam
            ),
            resumen_eventos AS (
                SELECT
                    COUNT(*) AS total_eventos,
                    SUM(veces_tarde) AS empleados_tarde,
                    SUM(veces_ausente) AS empleados_ausente,
                    SUM(salidas_antes) AS salidas_antes
                FROM eventos
                WHERE veces_tarde > 0 OR veces_ausente > 0
            ), registros_nfc AS (SELECT COUNT(*) AS registros_nfc FROM aplicaciones.log_accesos_sitios WHERE DATE(fecha_registro)=CURRENT_DATE)
            SELECT
                e.empleados_activos,
                COALESCE(r.empleados_tarde, 0) AS empleados_tarde,
                COALESCE(r.empleados_ausente, 0) AS empleados_ausente,
                COALESCE(n.registros_nfc, 0) AS registros_nfc,
                COALESCE(r.salidas_antes, 0) AS salidas_antes
            FROM empleados e
            LEFT JOIN resumen_eventos r ON true
            LEFT JOIN registros_nfc n ON true
            " 
        );
        return $data;
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
        AND b.anasta='A'
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

    public static function registrosNFC( $fecha ) {
        $registros = DB::connection( 'san' )->select( "SELECT u.uid, u.anacod, pa.ananam, pa.anajef, mac, fecha_registro as hora, evento FROM aplicaciones.log_accesos_sitios a left join aplicaciones.pro_anatags u ON u.uid=a.uid  left join aplicaciones.pro_anacod pa on pa.anacod = u.anacod where fecha_registro >= (DATE('$fecha') - INTERVAL '3 HOURS') AND fecha_registro <= (DATE('$fecha') + INTERVAL '1 day' + INTERVAL '3 hours') AND u.anacod IS NOT NULL order by u.anacod" );
        return $registros;
    }

    public static function registrosNFCRango( $fecha, $fecha_fin ) {
        $registros = DB::connection( 'san' )->select( "SELECT u.uid, u.anacod, pa.ananam, pa.anajef, a.mac, a.fecha_registro AS hora, a.evento 
            FROM aplicaciones.log_accesos_sitios a
            LEFT JOIN aplicaciones.pro_anatags u ON u.uid = a.uid  
            LEFT JOIN aplicaciones.pro_anacod pa ON pa.anacod = u.anacod 
            WHERE a.fecha_registro BETWEEN '$fecha' AND '$fecha_fin' 
            AND u.anacod IS NOT NULL 
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

    public static function marcasCompletasDia( $fecha ) {
                $marcas = DB::connection( 'san' )->select( "WITH calendario_dia AS (SELECT DATE '$fecha' AS fecha),
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
            FROM aplicaciones.pro_anacod AS u 
            LEFT JOIN aplicaciones.pro_horarios AS h
                ON CAST(u.horario_id AS INT) = CAST(h.id AS INT)
        JOIN
                aplicaciones.pro_horario_dias AS hd ON h.id = hd.horario_id

        JOIN
                aplicaciones.pro_marcaciones AS m ON m.anacod = u.anacod
        JOIN
                calendario_dia AS cd ON DATE_TRUNC('DAY', m.fecha) = cd.fecha
            WHERE
                hd.numero_dia = EXTRACT(DOW FROM DATE(m.fecha))
                AND u.anasta = 'A'
                AND DATE(m.fecha) = cd.fecha  -- Filtrar por el día específico usando cd.fecha
                --AND u.anacod = m.anacod
                --AND u.anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta = 'A' AND anatip = 'U')
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
            LEFT JOIN
                aplicaciones.pro_anatags u ON u.uid = a.uid
            WHERE
                a.evento = 'ENTRADA'
                AND DATE(a.fecha_registro) = (SELECT fecha FROM calendario_dia)  -- Filtrar por el día específico
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
            LEFT JOIN
                aplicaciones.pro_anatags u ON u.uid = a.uid
            WHERE
                a.evento = 'SALIDA'
                AND DATE(a.fecha_registro) = (SELECT fecha FROM calendario_dia)  -- Filtrar por el día específico
                --AND u.anacod IN (
                --   SELECT anacod
                --   FROM aplicaciones.pro_anacod
                --    WHERE anasta = 'A' AND anatip = 'U'
            -- )
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
        SELECT
                u.anacod,
                u.ananam,
                u.anajef,
                h.id AS horario_id,
                h.nombre AS horario,
                hd.numero_dia AS dia,
                h.dia_libre1,
                h.dia_libre2,
                hd.numero_dia,
                hd.entrada,
                hd.salida_almuerzo,
                hd.entrada_almuerzo,
                hd.salida
            FROM aplicaciones.pro_anacod AS u 
            LEFT JOIN aplicaciones.pro_horarios AS h
                ON CAST(u.horario_id AS INT) = CAST(h.id AS INT)
        JOIN
                aplicaciones.pro_horario_dias AS hd ON h.id = hd.horario_id
                where u.anasta = 'A' AND u.anapai='SV' 
        )

        SELECT a.*, b.fecha, b.nfc_entrada, b.nfc_salida, b.huella_1, b.huella_2, b.huella_3, b.huella_4, b.huella_5, b.huella_6  
        FROM info_empleados a
        LEFT JOIN datos b  ON b.anacod = a.anacod
        WHERE EXTRACT(DOW FROM date'$fecha') = a.dia ORDER BY a.anacod
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

    public static function nfcStore( $uid, $anacod ) {
        return DB::connection( 'san' )->insert( "INSERT INTO aplicaciones.pro_anatags (anacod, uid) 
        VALUES ('$anacod', '$uid') ON CONFLICT (uid) DO UPDATE SET anacod = EXCLUDED.anacod" );
    }

    public static function deleteTag( $uid ) {
        return DB::connection( 'san' )->delete( 'DELETE FROM aplicaciones.pro_anatags WHERE uid = ?', [ $uid ] );

    }
}
