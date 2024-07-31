<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\UsuarioRedControl;

class Hiring extends Model
{

    public function crearUsuariosRedControl($request)
    {

        $cliente = '1';
        $email = $request->input('anamai') ?? '';
        $nombre = $request->input('nombres') ?? '' + $request->input('apellidos') ?? '';
        $jefeInmediato = $request->input('anajef') ?? 'RED INTELFON';
        $contrasenia = base64_encode($request->input('anapas'));
        $estado = 2;
        $telefono = $request->input('anatel_real') ?? $request->input('anatel');
        $trxdat = date('Y-m-d');
        $pais = $request->input('anapai') ?? 'SV';
        $imei = $request->input('imei_real') ?? $request->input('imei');
        $tracking_key = '1';
        $anexo = $request->input('folcod_real') ?? $request->input('folcod');
        $lat = 0;
        $lng = 0;

        $usuarioMensajeria = new UsuarioRedControl();
        $usuarioMensajeria->codigoInterno = hash('sha256', microtime(true));
        $usuarioMensajeria->idusuario = $request->input('usuario_mensajeria');
        $usuarioMensajeria->cliente = $cliente;
        $usuarioMensajeria->email = $email;
        $usuarioMensajeria->nombre = $nombre;
        $usuarioMensajeria->jefeInmediato = $jefeInmediato;
        $usuarioMensajeria->contrasenia = $contrasenia;
        $usuarioMensajeria->permisos = 5;
        $usuarioMensajeria->estado = $estado;
        $usuarioMensajeria->telefono = $telefono;
        $usuarioMensajeria->trxdat = $trxdat;
        $usuarioMensajeria->empresa = 26;
        $usuarioMensajeria->pais = $pais;
        $usuarioMensajeria->imei = $imei;
        $usuarioMensajeria->tracking_key = $tracking_key;
        $usuarioMensajeria->actualizacion = now();
        $usuarioMensajeria->anexo = $anexo;
        $usuarioMensajeria->lat = $lat;
        $usuarioMensajeria->lng = $lng;
        $usuarioMensajeria->save();

        $usuarioAgenda = new UsuarioRedControl();
        $usuarioAgenda->codigoInterno = hash('sha256', microtime(true));
        $usuarioAgenda->idusuario = $request->input('usuario_red_control');
        $usuarioAgenda->cliente = $cliente;
        $usuarioAgenda->email = $email;
        $usuarioAgenda->nombre = $nombre;
        $usuarioAgenda->jefeInmediato = $jefeInmediato;
        $usuarioAgenda->contrasenia = $contrasenia;
        $usuarioAgenda->permisos = 1;
        $usuarioAgenda->estado = $estado;
        $usuarioAgenda->telefono = $telefono;
        $usuarioAgenda->trxdat = $trxdat;
        $usuarioAgenda->empresa = 1;
        $usuarioAgenda->pais = $pais;
        $usuarioAgenda->imei = $imei;
        $usuarioAgenda->tracking_key = $tracking_key;
        $usuarioAgenda->actualizacion = now();
        $usuarioAgenda->anexo = $anexo;
        $usuarioAgenda->lat = $lat;
        $usuarioAgenda->lng = $lng;
        $usuarioAgenda->save();


        // \Log::info($jsonUsuarioAgenda);
        // dd($usuarioAgenda->toJson());
        // dd($usuarioMensajeria->toJson());
        // var_dump($usuarioAgenda->toJson());
    }

    public function asignarRolesSan($request)
    {

    }

    // public function persistirArchivos($request)
    // {
    //     $anacod = $request->input('anacod') ?? '';
    //     \Log::info('Anacod: ' . $anacod);

    //     // Obtener todos los archivos del request
    //     $files = $request->allFiles();

    //     foreach ($files as $key => $fileArray) {
    //         // Si $fileArray es un array de archivos
    //         if (is_array($fileArray)) {
    //             foreach ($fileArray as $file) {
    //                 // Asegúrate de que $file es una instancia de UploadedFile
    //                 if ($file instanceof \Illuminate\Http\UploadedFile) {

    //                     //  \Log::info('File properties: ' . print_r($file, true));

    //                     \Log::info('Nombre del archivo: ' . $file->getClientOriginalName());
    //                     \Log::info('Tipo de archivo: ' . $file->getMimeType());
    //                     \Log::info('Tamaño del archivo: ' . $file->getSize());
    //                 }
    //             }
    //         }
    //     }

    //     DB::connection('san')->insert("INSERT INTO aplicaciones.pro_anacod (anacod,ananam,anapas,anamai,anasta,anaprf,anapai,anatel,anarad,anajef,anarea,folcod,anaext,anatip,anaimg,anapos,anasuc,anames,anadia,telreg,teltip,segundo_jefe,fecha_ingreso,fecha_baja,id_turno,lider_area,folcodreal, horario_id) 
    //     VALUES('$request->anacod','$request->ananam', '$request->anapas', '$request->anamai', 'A', 1, '$request->anapai', '$request->anatel', '', '$request->anajef', '$request->anarea',$request->folcod, '$request->anaext', 'U', 'vpalma.png', '$request->anapos', '2', '', '', '503', 'SIMIENS', 'JJIMENEZ', '$request->fecha_ingreso', null, '002', '$request->anajef', null, $request->horario_id)");
    // }

    public function persistirArchivos($request)
    {
        $anacod = $request->input('anacod') ?? '';
        \Log::info('Anacod: ' . $anacod);

        $files = $request->allFiles();

        foreach ($files as $key => $fileArray) {
            if (is_array($fileArray)) {
                foreach ($fileArray as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile) {
                        $nombreArchivo = $file->getClientOriginalName();
                        $tipoMime = $file->getMimeType();
                        $tamaño = $file->getSize();
                        $contenido = file_get_contents($file->getRealPath());
                        $contenidoEscapado = base64_encode($contenido); // Encode to base64 to safely store the binary data

                        DB::connection('san')->insert("INSERT INTO aplicaciones.archivos_empleados (anacod, nombre, tipo_mime, contenido, tamaño) VALUES (?, ?, ?, decode(?,'base64'), ?)", [
                            $anacod,
                            $nombreArchivo,
                            $tipoMime,
                            $contenidoEscapado,
                            $tamaño
                        ]);
                    }
                }
            }
        }
    }


    public function newHiring($request)
    {
        // $this->crearUsuariosRedControl($request);
        // $this->asignarRolesSan($request);
        $this->persistirArchivos($request);
    }

    use HasFactory;
}
