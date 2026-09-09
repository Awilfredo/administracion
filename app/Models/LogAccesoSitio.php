<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogAccesoSitio extends Model
{
    protected $table = 'aplicaciones.log_accesos_sitios';
    protected $connection = 'san';
    public $timestamps = false;

    protected $fillable = [
        'uid',
        'mac',
        'evento',
        'fecha_registro',
        'anacod',
        'logs',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'logs' => 'array',
    ];

    public function proAnatag()
    {
        return $this->belongsTo(ProAnatag::class, 'uid', 'uid');
    }
}
