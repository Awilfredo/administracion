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
        'anapas',
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
        $empleados = DB::connection( 'san' )->select( "select a.*, h.nombre as horario from aplicaciones.pro_anacod a left join aplicaciones.pro_horarios h on h.id = a.horario_id where anasta = 'A' and anatip = 'U' and anapai = 'SV';
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
    public static function store( $request ) {

        //'anatel' => 'required|string|max:255',
        //'folcod' => 'required|string|max:255',
        //'anaext' => 'required|string|max:255',
        $fechaCarbon = Carbon::createFromFormat( 'Y-m-d', $request->fecha_nacimiento );
        $dia = $fechaCarbon->day;
        $mes = $fechaCarbon->month;
        $ananam = $request->nombres . ' ' .  $request->apellidos;
        $folcod_real = $request->folcod_real ? $request->folcod_real : null;
        $folcod = $request->folcod ? $request->folcod  : null;
        $anatel = $request->anatel ? $request->anatel : null;
        $anaext = $request->anaext ? $request->anatel : null;
        DB::connection( 'san' )->insert( "INSERT INTO aplicaciones.pro_anacod (anacod,ananam,anapas,anamai,anasta,anaprf,anapai,anatel,anarad,anajef,anarea,folcod,anaext,anatip,anaimg,anapos,anasuc,anames,anadia,telreg,teltip,segundo_jefe,fecha_ingreso,fecha_baja,id_turno,lider_area,folcodreal, horario_id) 
        VALUES
        ('$request->anacod',
        '$ananam', 
        '$request->anapas', 
        '$request->anamai', 
        'A', 
        1, 
        '$request->anapai', 
        '$anatel', 
        '', 
        '$request->anajef', 
        '$request->anarea',
         $folcod, 
         '$anaext', 
         'U', 
         '$request->anaimg', 
         '$request->anapos', 
         '2', 
         $mes, 
         $dia, 
         '503', 
         'SIMIENS', 
         'JJIMENEZ', 
         '$request->fecha_ingreso', 
         null, 
         '002', 
         '$request->anajef', 
         null, 
         $request->horario_id)" );

    }

    use HasFactory;
}
