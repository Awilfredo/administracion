<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioDia extends Model
{
    protected $connection = 'san';
    protected $table = 'aplicaciones.pro_horario_dias';
    use HasFactory;

    public function horario()
    {
        return $this->belongsTo(Horario::class);
    }
}
