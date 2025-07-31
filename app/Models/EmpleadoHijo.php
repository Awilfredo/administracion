<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpleadoHijo extends Model
{
    //
    protected $table = 'empleado_hijos';

    protected $fillable = [
        'empleado_id',
        'nombre',
        'fecha_nacimiento',
        'genero',
    ];
    public function empleado()
    {
        return $this->belongsTo(DatosEmpleado::class, 'empleado_id');
    }
}
