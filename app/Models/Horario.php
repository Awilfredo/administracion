<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $connection = 'san';
    protected $table = 'aplicaciones.pro_horarios';
    use HasFactory;

    public function dias()
    {
        return $this->hasMany(HorarioDia::class);
    }
}
