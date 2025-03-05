<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class UsuarioRedControl extends Model
{
    protected $connection = 'redControl';
    public $timestamps = false;
    public $id = false;
    protected $table = 'Agenda.usuario';
    protected $hidden = ['contrasenia'];
    protected $fillable = [
        'codigoInterno',
        'idusuario',
        'idAuxiliar',
        'cliente',
        'email',
        'nombre',
        'sexo',
        'jefeInmediato',
        'permisos',
        'contrasenia',
        'estado',
        'telefono',
        'trxdat',
        'avatar',
        'empresa',
        'pais',
        'imei',
        'marca',
        'modelo',
        'tracking_key',
        'actualizacion',
        'anexo',
        'plan',
        'direccion',
        'lat',
        'lng',
        'categoria',
        'resumen'
    ];

    use HasFactory;
}
