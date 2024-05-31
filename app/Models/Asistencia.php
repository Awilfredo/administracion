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

    public static function eventosToday(){
        $asistencias = DB::connection('san')->select("SELECT * FROM aplicaciones.pro_eventos_asistencia WHERE DATE(fecha) = CURRENT_DATE");
        return $asistencias;
    }

    public static function tarde()
    {
        $resumen = DB::connection('san')->select("SELECT anacod, ananam, COUNT(*) AS veces FROM aplicaciones.pro_eventos_asistencia WHERE evento= 'Tarde' AND DATE(fecha) BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') GROUP BY anacod, ananam");

        return $resumen;
    }

    public static function ausencia()
    {
        $resumen = DB::connection('san')->select("SELECT anacod, ananam, COUNT(*) AS veces FROM aplicaciones.pro_eventos_asistencia WHERE evento= 'Ausencia' AND fecha BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE AND accion_personal IS null AND anacod IN (SELECT anacod FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U') GROUP BY anacod, ananam");

        return $resumen;
    }

    public static function registrosNFC($fecha){
        $registros = DB::connection('san')->select("SELECT u.uid, anacod, mac,fecha_registro as hora, evento FROM aplicaciones.log_accesos_sitios a 
        left join aplicaciones.pro_anatags u ON u.uid=a.uid
        where DATE(fecha_registro) = '$fecha' ORDER BY anacod , fecha_registro");
        return $registros;
    }


}
