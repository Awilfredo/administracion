<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProMarcacion extends Model
{
    protected $table = 'aplicaciones.pro_marcaciones';
    protected $connection = 'san';
    public $timestamps = false;

    protected $fillable = [
        'anacod',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'anacod', 'anacod');
    }
}
