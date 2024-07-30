<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Hiring extends Model
{

    public function crearUsuariosRedControl($request)
    {
        $codigoInterno = '';
        $idusuario = '';
        $cliente = '';
        $email = $request->input('anamai') ?? ''; 
        $nombre = $request->input('nombres') ?? '' + $request->input('apellidos') ?? ''; 
        $jefeInmediato = $request->input('anajef') ?? ''; 
        $permisos = ''; 
        $contrasenia = base64_encode($request->input('anapas'));
        $estado = '2';
        $telefono = $request->input('anatel') ?? ''; 
        
    }

    public function newHiring($request)
    {
        $this->crearUsuariosRedControl($request);
    }

    use HasFactory;
}
