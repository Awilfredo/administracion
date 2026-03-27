<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PttEquipo extends Model
{
    protected $table = 'ptt_equipos';

    protected $fillable = [
        'anacod',
        'licencia',
        'anexo',
        'numero_telefono',
        'modelo_equipo',
        'imei',
        'imei2',
        'sim',
        'sim2',
        'tipo_sim',
        'descripcion_empresa',
        'plan_operador',
        'comentarios',
    ];

    protected $casts = [
        'anexo' => 'integer',
    ];

    public function empleado()
    {
        return $this->belongsTo(DatosEmpleado::class, 'anacod');
    }

}