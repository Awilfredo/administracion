<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmpleadoAprobadorTemporal extends Model
{
    use HasFactory;

    protected $table = 'empleado_aprobadores_temporales';

    protected $fillable = [
        'anacod_origen',
        'temp_user_id',
        'temp_user_email',
        'accion_personal_id',
        'fecha_desde',
        'fecha_hasta',
        'pausar_original',
        'cc_cuentas',
        'sync_status',
        'last_error',
        'api_response',
        'created_by',
    ];

    protected $casts = [
        'temp_user_id' => 'integer',
        'accion_personal_id' => 'integer',
        'fecha_desde' => 'date',
        'fecha_hasta' => 'date',
        'pausar_original' => 'boolean',
        'cc_cuentas' => 'array',
        'api_response' => 'array',
        'created_by' => 'integer',
    ];

    protected $appends = ['is_ok', 'is_error', 'is_skipped', 'is_pending'];

    public function getIsOkAttribute(): bool
    {
        return $this->sync_status === 'ok';
    }

    public function getIsErrorAttribute(): bool
    {
        return $this->sync_status === 'error';
    }

    public function getIsSkippedAttribute(): bool
    {
        return $this->sync_status === 'skipped';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->sync_status === 'pending';
    }

    public function isOk(): bool
    {
        return $this->is_ok;
    }

    public function isError(): bool
    {
        return $this->is_error;
    }

    public function isSkipped(): bool
    {
        return $this->is_skipped;
    }

    public function isPending(): bool
    {
        return $this->is_pending;
    }
}
