<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    protected $connection = 'san';
    public $timestamps = false;
    public $id = false;
    protected $table = 'aplicaciones.pro_anacod';
    protected $fillable = [
        'anacod', 'ananam', 'anapas', 'anamai', 'anasta', 'anaprf', 'anapai', 'anatel', 'anarad', 'anajef', 'anarea', 'folcod', 'anaext', 'anatip', 'anaimg', 'anapos', 'anasuc', 'anames', 'anadia', 'telreg', 'teltip', 'segundo_jefe', 'fecha_ingreso', 'fecha_baja', 'lider_area', 'folcodreal', 'horario_id'
    ];
    use HasFactory;
}
