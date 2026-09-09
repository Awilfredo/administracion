<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProAnatag extends Model
{
    protected $table = 'aplicaciones.pro_anatags';
    protected $connection = 'san';
    public $timestamps = false;
    protected $primaryKey = 'uid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'anacod',
        'uid',
    ];

    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'anacod', 'anacod');
    }

    public function marcaciones()
    {
        return $this->hasMany(LogAccesoSitio::class, 'uid', 'uid');
    }
}
