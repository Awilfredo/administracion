<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioDia extends Model
{
    protected $connection = 'san';
    protected $table = 'aplicaciones.pro_horario_dias';
    protected $fillable = ['horario_id', 'numero_dia', 'entrada', 'salida_almuerzo', 'entrada_almuerzo', 'salida'];
    public $timestamps=false;
    use HasFactory;

    public function horario()
    {
        return $this->belongsTo(Horario::class);
    }
}
