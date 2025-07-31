<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmpleadoArchivo extends Model
{
    protected $table = 'empleado_archivos';

    protected $fillable = [
        'empleado_id',
        'nombre',
        'ruta',
    ];

    public function empleado()
    {
        return $this->belongsTo(DatosEmpleado::class, 'empleado_id');
    }
}
