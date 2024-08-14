<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $connection = 'san';
    protected $table = 'aplicaciones.pro_horarios';
    public $timestamps = false;
    protected $fillable = ['nombre', 'dia_libre1', 'dia_libre2'];
    use HasFactory;

    public function dias()
    {
        return $this->hasMany(HorarioDia::class)->orderBy('numero_dia', 'asc');
    }
}
