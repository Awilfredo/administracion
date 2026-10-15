<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpleadoAccionArchivo extends Model
{
    use HasFactory;

    protected $table = 'empleado_accion_archivos';

    protected $fillable = [
        'empleado_accion_id',
        'path',
        'nombre_original',
        'mime_type',
        'tamano',
        'uploaded_by',
    ];

    protected $casts = [
        'tamano' => 'integer',
    ];

    public function accion(): BelongsTo
    {
        return $this->belongsTo(EmpleadoAccion::class, 'empleado_accion_id');
    }
}
