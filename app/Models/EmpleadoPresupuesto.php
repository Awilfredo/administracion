<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmpleadoPresupuesto extends Model
{
    use HasFactory;

    protected $table = 'empleado_presupuestos';

    public $incrementing = false;

    protected $primaryKey = 'anacod';

    protected $keyType = 'string';

    protected $fillable = [
        'anacod',
        'presupuestos_user_id',
        'sync_status',
        'last_error',
        'last_password',
        'cc_cuentas',
        'last_synced_at',
    ];

    protected $casts = [
        'presupuestos_user_id' => 'integer',
        'last_synced_at' => 'datetime',
        'cc_cuentas' => 'array',
    ];

    protected $appends = ['has_email_conflict'];

    public function getIsOkAttribute(): bool
    {
        return $this->sync_status === 'ok';
    }

    public function getIsErrorAttribute(): bool
    {
        return $this->sync_status === 'error';
    }

    public function getHasEmailConflictAttribute(): bool
    {
        return $this->sync_status === 'error'
            && is_string($this->last_error)
            && str_contains(strtolower($this->last_error), 'email');
    }

    public function isOk(): bool
    {
        return $this->is_ok;
    }

    public function isError(): bool
    {
        return $this->is_error;
    }

    public function hasEmailConflict(): bool
    {
        return $this->has_email_conflict;
    }
}
