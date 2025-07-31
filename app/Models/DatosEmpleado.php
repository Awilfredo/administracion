<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatosEmpleado extends Model
{
    protected $table = 'datos_empleados';
    protected $fillable = [
        'cc',
        'anacod',
        'genero',
        'padre',
        'madre',
        'dui',
        'nit',
        'isss',
        'tipo_afp',
        'afp',
        'tel_casa',
        'cel_personal',
        'direccion',
        'modelo_red_ptt',
        'imei',
        'imei2',
        'simcard',
        'tipo_sim',
        'observacion_equipo',
        'tarjeta_acceso',
        'dui_adjunto',
        'comentarios',
        'asegurado',
    ];

    public function hijos()
    {
        return $this->hasMany(EmpleadoHijo::class, 'empleado_id');
    }

    public function archivos()
    {
        return $this->hasMany(EmpleadoArchivo::class, 'empleado_id');
    }
}
