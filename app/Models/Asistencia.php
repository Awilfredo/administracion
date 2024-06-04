<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Asistencia extends Model
{
    use HasFactory;
    protected $connection = 'san';
    public $timestamps = false;
    protected $table = 'aplicaciones.pro_eventos_asistencia';
    protected $fillable = ['accion_personal'];

    public static function eventosToday()
    {
        $asistencias = DB::connection('san')->select("SELECT * FROM aplicaciones.pro_eventos_asistencia WHERE DATE(fecha) = CURRENT_DATE");
        return $asistencias;
    }

    public static function tarde()
    {
        $resumen = DB::connection('san')->select("SELECT anacod, ananam, COUNT(*) AS veces FROM aplicaciones.pro_eventos_asistencia WHERE evento= 'Tarde' AND DATE(fecha) BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') GROUP BY anacod, ananam ORDER BY veces DESC");

        return $resumen;
    }

    public static function ausencia()
    {
        $resumen = DB::connection('san')->select("SELECT anacod, ananam, COUNT(*) AS veces FROM aplicaciones.pro_eventos_asistencia WHERE evento= 'Ausencia' AND fecha BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') GROUP BY anacod, ananam ORDER BY veces DESC");

        return $resumen;
    }

    public static function registrosNFC($fecha)
    {
        $registros = DB::connection('san')->select("SELECT u.uid, anacod, mac,fecha_registro as hora, evento FROM aplicaciones.log_accesos_sitios a 
        left join aplicaciones.pro_anatags u ON u.uid=a.uid
        where DATE(fecha_registro) = '$fecha' ORDER BY anacod , fecha_registro");
        return $registros;
    }

    public static function marcas($fecha)
    {
        $marcas = DB::connection('san')->select("WITH marcaciones_numeradas AS (
            SELECT 
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
            anacod ");

        return $marcas;
    }
}
