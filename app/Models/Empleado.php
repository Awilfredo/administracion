<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Empleado extends Model
{
    protected $connection = 'san';
    public $timestamps = false;
    public $id = false;
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

    public static function jefes()
    {
        $jefes = DB::connection('san')->select("SELECT DISTINCT anajef FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'");
        return $jefes;
    }

    public static function areas()
    {
        $areas = DB::connection('san')->select("SELECT DISTINCT anarea FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'");
        return $areas;
    }

    public static function posiciones()
    {
        $posiciones = DB::connection('san')->select("SELECT DISTINCT anapos FROM aplicaciones.pro_anacod WHERE anasta='A' AND anatip='U'");
        return $posiciones;
    }
    public static function store($request)
    {
        $fechaCarbon = Carbon::createFromFormat('Y-m-d', $request->fecha_nacimiento);
        $dia = $fechaCarbon->day;
        $mes = $fechaCarbon->month;
        DB::connection('san')->insert("INSERT INTO aplicaciones.pro_anacod (anacod,ananam,anapas,anamai,anasta,anaprf,anapai,anatel,anarad,anajef,anarea,folcod,anaext,anatip,anaimg,anapos,anasuc,anames,anadia,telreg,teltip,segundo_jefe,fecha_ingreso,fecha_baja,id_turno,lider_area,folcodreal, horario_id) 
VALUES('$request->anacod','$request->ananam', '$request->anapas', '$request->anamai', 'A', 1, '$request->anapai', '$request->anatel', '', '$request->anajef', '$request->anarea',$request->folcod, '$request->anaext', 'U', 'vpalma.png', '$request->anapos', '2', $mes, $dia, '503', 'SIMIENS', 'JJIMENEZ', '$request->fecha_ingreso', null, '002', '$request->anajef', null, $request->horario_id)");
    }

    public static function crearUsuariosRedControl($request)
    {
        
    }

    public static function newHiring($request)
    {

    }

    use HasFactory;
}
