<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Empleado extends Model {
    protected $connection = 'san';
    public $timestamps = false;
    public $id = false;
    protected $primaryKey = 'anacod';
    public $incrementing = false;
    protected $table = 'aplicaciones.pro_anacod';
    protected $fillable = [
        'anacod',
        'ananam',
        'anamai',
        'anasta',
        'anaprf',
        'anapai',
        'anatel',
        'anarad',
        'anajef',
        'anarea',
        'folcod',
        'anaext',
        'anatip',
        'anaimg',
        'anapos',
        'anasuc',
        'anames',
        'anadia',
        'telreg',
        'teltip',
        'segundo_jefe',
        'fecha_ingreso',
        'fecha_baja',
        'lider_area',
        'folcodreal',
        'horario_id'
    ];

    public static function empleados() {
        $empleados = DB::connection( 'san' )->select( "select a.*, h.nombre as horario from aplicaciones.pro_anacod a left join aplicaciones.pro_horarios h on h.id = a.horario_id where anatip = 'U' ;
        " );
        return $empleados;
    }

    public static function jefes() {
        $jefes = DB::connection( 'san' )->select( "SELECT DISTINCT anajef FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'" );
        return $jefes;
    }

    public static function areas() {
        $areas = DB::connection( 'san' )->select( "SELECT DISTINCT anarea FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'" );
        return $areas;
    }

    public static function posiciones() {
        $posiciones = DB::connection( 'san' )->select( "SELECT DISTINCT anapos FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'" );
        return $posiciones;
    }

    public static function asignarRolesSan( $request ) {
        $anacod = $request->input( 'anacod' ) ?? null;
        $isBoss = $request->input( 'isBoss' ) ?? false;
        $pais = $request->input( 'anapai' );
        $jefaturas = $request->input( 'jefaturas' ) ?? [];
        $anarea = $request[ 'anarea' ];
        if ( $anacod == null ) {
            return;
        }
        if ( $isBoss ) {
            $palabrasConComillas = array_map( function( $p ) {
                return "'" . $p . "'";
            }
            , $jefaturas );
            // Unir los elementos con comas y espacios
            $areas = implode( ', ', $palabrasConComillas );
            $consulta = "INSERT INTO aplicaciones.pro_usrrol (codana, codrol) SELECT '$anacod', codrol FROM aplicaciones.pro_areas_roles WHERE anarea IN ($areas) AND jefe = true AND anapai ='$pais' GROUP BY codrol";
        } else {
            $consulta = "INSERT INTO aplicaciones.pro_usrrol (codana, codrol) SELECT '$anacod', codrol FROM aplicaciones.pro_areas_roles WHERE anarea IN ('$anarea') AND jefe = false AND anapai ='$pais' GROUP BY codrol";
        }
        return DB::connection( 'san' )->insert( $consulta );
    }

    public static function asignarSuplementarios( $request ) {
        $anacod = $request->input( 'anacod' ) ?? null;
        $isBoss = $request->input( 'isBoss' ) ?? false;
        $jefaturas = $request->input( 'jefaturas' ) ?? [];
        $anarea = $request[ 'anarea' ];
        if ( $anacod == null ) {
            return;
        }
        if ( $isBoss ) {
            $palabrasConComillas = array_map( function( $p ) {
                return "'" . $p . "'";
            }
            , $jefaturas );
            // Unir los elementos con comas y espacios
            $areas = implode( ', ', $palabrasConComillas );
            $consulta = "INSERT INTO cliente.pro_supaut (supcod, anacod) SELECT suplementario_id, '$anacod' FROM cliente.pro_areas_suplementarios WHERE area IN ($areas) AND jefe= true GROUP BY suplementario_id;";
        } else {
            $consulta = "INSERT INTO cliente.pro_supaut (supcod, anacod) SELECT suplementario_id, '$anacod' FROM cliente.pro_areas_suplementarios WHERE area IN ('$anarea') AND jefe= false GROUP BY suplementario_id;";
        }
        return DB::connection( 'san' )->insert( $consulta );
    }

    public static function asignarReportes( $request ) {

        $anacod = $request->input( 'anacod' ) ?? null;
        $isBoss = $request->input( 'isBoss' ) ?? false;
        $jefaturas = $request->input( 'jefaturas' ) ?? [];
        $anarea = $request[ 'anarea' ];
        if ( $anacod == null ) {
            return;
        }
        if ( $isBoss ) {
            $palabrasConComillas = array_map( function( $p ) {
                return "'" . $p . "'";
            }
            , $jefaturas );
            // Unir los elementos con comas y espacios
            $areas = implode( ', ', $palabrasConComillas );
            $consulta = "INSERT INTO reportes.pro_repxru (repids, usrrol, stacod, usrtra, fectrx) SELECT reporte_id, '$anacod', 'A', 'AWCRUZ', CURRENT_TIMESTAMP FROM reportes.pro_areas_reportes WHERE area IN ($areas) AND jefe= true GROUP BY reporte_id";
        } else {
            $consulta = "INSERT INTO reportes.pro_repxru (repids, usrrol, stacod, usrtra, fectrx) SELECT reporte_id, '$anacod', 'A', 'AWCRUZ', CURRENT_TIMESTAMP FROM reportes.pro_areas_reportes WHERE area IN ('$anarea') AND jefe= false GROUP BY reporte_id";
        }
        return DB::connection( 'san' )->insert( $consulta );
    }

    public function getImei($folcod)
    {
        $result = DB::connection('san')->select("SELECT eqpser from cliente.pro_foleqp where folcod = $folcod and eqptip='E'");
        return collect($result)->first(); //si no hay retorna null
    }

    use HasFactory;
}