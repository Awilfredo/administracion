<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmpleadoAccion extends Model
{
    use HasFactory;

    protected $table = 'empleado_acciones';

    protected $fillable = [
        'sharepoint_id',
        'sharepoint_guid',
        'origen',
        'anacod',
        'tipo_id',
        'fecha_inicio',
        'fecha_fin',
        'hora_inicio',
        'hora_fin',
        'motivo',
        'estado',
        'observaciones',
        'pais',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'sharepoint_id' => 'integer',
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin' => 'date:Y-m-d',
        'hora_inicio' => 'string',
        'hora_fin' => 'string',
    ];

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(EmpleadoAccionTipo::class, 'tipo_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(EmpleadoAccionArchivo::class, 'empleado_accion_id');
    }
}
