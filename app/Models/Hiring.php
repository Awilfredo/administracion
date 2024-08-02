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
        $svRolesJefes = [
            "FIN" => "'LIDPA','FNGSV','CBGSV','FNGSV'",
            "SAC" => "'LIDPA','SCJSV','SCGSV'",
            "IT" => "'LIDPA','ITAAD'",
            "MKD" => "'VTGSV','MKGSV','RETSV','SUPVT'",
            "BOD" => "'BODSV'",
            "LEG" => "'LIDPA','RHSVG','PEUET','VTGSV'",
            "VTS" => "'LIDPA','VTGSV'",
            "RET" => "'LIDPA','RETSV'",
            "RRH" => "'LIDPA','RHSVG','RHSVJ'",
        ];
    }

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

                        DB::connection('san')->insert("INSERT INTO aplicaciones.archivos_empleados (anacod, nombre, tipo_mime, contenido, tamaño) VALUES (?, ?, ?, decode(?,'base64'), ?) ON CONFLICT (anacod, nombre) DO UPDATE SET tipo_mime = EXCLUDED.tipo_mime, contenido = EXCLUDED.contenido, tamaño = EXCLUDED.tamaño, fecha_trx = NOW()", [
                            $anacod,
                            $nombreArchivo,
                            $tipoMime,
                            $contenidoEscapado,
                            $tamaño
                        ]);


                        if (str_starts_with($nombreArchivo, 'imagen')) {
                            \Log::info("El nombre del archivo comienza con 'imagen'.");
                            // Guardar el archivo en el disco público
                            $path = $file->storeAs('uploads', $anacod . "_" . $nombreArchivo, 'public');
                        }

                        // URL pública del archivo
                        // $url = asset('storage/uploads/' . $nombreArchivo);
                        // \Log::info('Archivo guardado en: ' . $path);
                        // \Log::info('URL pública: ' . $url);
                    }
                }
            }
        }
    }

    public function persistirFormData($request)
    {
        $anacod = $request->input('anacod') ?? '';

        $jsonFormData = json_encode($request->all());
        DB::connection('san')->insert("INSERT INTO aplicaciones.datos_empleados (anacod, info) VALUES (?, ?) ON CONFLICT (anacod) DO UPDATE SET info = EXCLUDED.info, fecha_trx = NOW()", [
            $anacod,
            $jsonFormData
        ]);
    }

    public function newHiring($request)
    {
        // $this->crearUsuariosRedControl($request);
        $this->asignarRolesSan($request);
        $this->persistirArchivos($request);
        $this->persistirFormData($request);
    }

    use HasFactory;
}
