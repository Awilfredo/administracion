<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmpleadoAccionTipo extends Model
{
    use HasFactory;

    protected $table = 'empleado_accion_tipos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'requiere_adjunto',
        'activo',
        'afecta_asistencia',
    ];

    protected $casts = [
        'requiere_adjunto' => 'boolean',
        'activo' => 'boolean',
        'afecta_asistencia' => 'boolean',
    ];

    public function acciones(): HasMany
    {
        return $this->hasMany(EmpleadoAccion::class, 'tipo_id');
    }
}