<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\UsuarioRedControl;
use App\Models\MailService;
use Exception;

class Hiring extends Model {
    use HasFactory;

    

    public function crearUsuariosRedControl( $request ) {

        $isRedControl = $request->input( 'redcontrol' ) ?? false;
        $isMensajeria = $request->input( 'mensajeria' ) ?? false;
        $cliente = '1';
        $email = $request->input( 'anamai' ) ?? '';
        $nombre = $request->input( 'nombres' ) ?? '' + $request->input( 'apellidos' ) ?? '';
        $jefeInmediato = $request->input( 'anajef' ) ?? 'RED INTELFON';
        $contrasenia = base64_encode( $request->input( 'anapas' ) );
        $estado = 2;
        $telefono = $request->input( 'anatel_real' ) ?? $request->input( 'anatel' );
        $trxdat = date( 'Y-m-d' );
        $pais = $request->input( 'anapai' ) ?? 'SV';
        $imei = $request->input( 'imei_real' ) ?? $request->input( 'imei' );
        $tracking_key = '1';
        $anexo = $request->input( 'folcod_real' ) ?? $request->input( 'folcod' );
        $lat = 0;
        $lng = 0;

        if ( $isMensajeria ) {
            $usuarioMensajeria = new UsuarioRedControl();
            $usuarioMensajeria->codigoInterno = hash( 'sha256', microtime( true ) );
            $usuarioMensajeria->idusuario = $request->input( 'usuario_mensajeria' );
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
        }

        if ( $isRedControl ) {
            $usuarioAgenda = new UsuarioRedControl();
            $usuarioAgenda->codigoInterno = hash( 'sha256', microtime( true ) );
            $usuarioAgenda->idusuario = $request->input( 'usuario_red_control' );
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
        }

        // \Log::info( $jsonUsuarioAgenda );
        // dd( $usuarioAgenda->toJson() );
        // dd( $usuarioMensajeria->toJson() );
        // var_dump( $usuarioAgenda->toJson() );
    }


    public function persistirArchivos( $request ) {

        $resArray = null;
        $anacod = $request->input( 'anacod' ) ?? '';
        // \Log::info( 'Anacod: ' . $anacod );

        $files = $request->allFiles();

        foreach ( $files as $key => $fileArray ) {
            if ( is_array( $fileArray ) ) {
                foreach ( $fileArray as $file ) {
                    if ( $file instanceof \Illuminate\Http\UploadedFile ) {
                        $nombreArchivo = $file->getClientOriginalName();
                        $tipoMime = $file->getMimeType();
                        $tamaño = $file->getSize();
                        $contenido = file_get_contents( $file->getRealPath() );
                        $contenidoEscapado = base64_encode( $contenido );
                        // Encode to base64 to safely store the binary data

                        DB::connection( 'san' )->insert( "INSERT INTO aplicaciones.archivos_empleados (anacod, nombre, tipo_mime, contenido, tamaño) VALUES (?, ?, ?, decode(?,'base64'), ?) ON CONFLICT (anacod, nombre) DO UPDATE SET tipo_mime = EXCLUDED.tipo_mime, contenido = EXCLUDED.contenido, tamaño = EXCLUDED.tamaño, fecha_trx = NOW()", [
                            $anacod,
                            $nombreArchivo,
                            $tipoMime,
                            $contenidoEscapado,
                            $tamaño
                        ] );

                        if ( str_starts_with( $nombreArchivo, 'imagen' ) ) {
                            \Log::info( "El nombre del archivo comienza con 'imagen'." );
                            // Guardar el archivo en el disco público
                            $path = $file->storeAs( 'uploads', $anacod . '_' . $nombreArchivo, 'public' );

                            $resArray = [
                                'anacod' => $anacod,
                                'nombreArchivo' => $nombreArchivo,
                                'tipoMime' => $tipoMime,
                                'contenidoEscpado' => $contenidoEscapado,
                                'size' => $tamaño
                            ];
                        }

                        // URL pública del archivo
                        // $url = asset( 'storage/uploads/' . $nombreArchivo );
                        // \Log::info( 'Archivo guardado en: ' . $path );
                        // \Log::info( 'URL pública: ' . $url );
                    }
                }
            }
        }

        return $resArray;
    }

    public function persistirFormData( $request ) {
        $anacod = $request->input( 'anacod' ) ?? '';

        $jsonFormData = json_encode( $request->all() );
        DB::connection( 'san' )->insert( 'INSERT INTO aplicaciones.datos_empleados (anacod, info) VALUES (?, ?) ON CONFLICT (anacod) DO UPDATE SET info = EXCLUDED.info, fecha_trx = NOW()', [
            $anacod,
            $jsonFormData
        ] );
    }

    public function sendTask365( $request, $imagenAnacod ) {
        $nombre = $request->input( 'nombres' ) ?? '' . $request->input( 'apellidos' ) ?? '';
        $email = $request->input( 'anamai' ) ?? '';
        $anarea = $request->anarea;
        $anacod = $request->anacod;
        $anapos = $request->anapos;
        $anaext = $request->anaext;

        $name_flow = 'office365';
        $result = DB::connection( 'san' )->select( "
            INSERT INTO aplicaciones.hiring_flow (anacod, name_flow, status, trx_user, fecha_update)
            VALUES (?, ?, DEFAULT, ?, NOW())
            ON CONFLICT (anacod, name_flow)
            DO UPDATE SET fecha_update = NOW()
            RETURNING id_trx
        ", [ $anacod, $name_flow, 'WLARA' ] );

        // Si se espera solo un resultado, puedes acceder al id_trx así
        $idTrx = $result[ 0 ]->id_trx ?? null;

        $cssPersonalizado = 'style="width: 100%;"';

        $ms365 = new MailService();
        $to = 'wlara@red.com.sv';
        $bcc = [ 'awcruz@red.com.sv' => '', 'dbolaines@red.com.sv' => '' ];
        $subject = "Asignacion de tarea: Crear correo 365 para $nombre";

        // Contenido HTML del correo, incluye imagen si está presente
        $button = '<a href="http://administracion.red.com.sv/hiring/status-office365?id=' . $idTrx . '" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 5px;">Finalizado</a>';
        $body = "
        <div>
            <h1>Se brindan los datos para la creacion del correo office 365</h1>
            <ul>
                <li><strong>Nombre: </strong> $nombre</li>
                <li><strong>Anacod: </strong> $anacod</li>
                <li><strong>Mail: </strong> $email</li>
                <li><strong>Puesto: </strong> $anapos </li>
                <li><strong>Departamento: </strong> $anarea</li>
                <li><strong>Oficina: </strong> $anaext</li>
            </ul>
            " . ( !empty( $imagenAnacod ) ? "<img src='data:" . $imagenAnacod[ 'tipoMime' ] . ';base64,' . $imagenAnacod[ 'contenidoEscpado' ] . "' alt='Imagen' $cssPersonalizado >" : '' ) . "
            <h2>Favor confirmar al finalizar la tarea</h2>
            <strong>**Presionar boton de confirmacion solo si ha finalizado la tarea, ya que otras tareas se van a ejecutar luego de su confirmacion.</strong>
            </br>
            $button            
        </div>
     ";

        // Agregar el adjunto si está disponible
        if ( !empty( $imagenAnacod ) ) {
            $ms365->addBase64Attachment( $imagenAnacod[ 'contenidoEscpado' ], $imagenAnacod[ 'nombreArchivo' ], $imagenAnacod[ 'tipoMime' ] );
        }

        $ms365->sendEmail( $to, '', $subject, $body, '', $bcc );
    }

    public function sendInfoSap( $request ) {
        $nombre = $request->input( 'nombres' ) ?? '' . $request->input( 'apellidos' ) ?? '';
        $allJson = json_encode( $request->all(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
        $anacod = $request->anacod;

        $name_flow = 'makeSap';
        $result = DB::connection( 'san' )->select( "
            INSERT INTO aplicaciones.hiring_flow (anacod, name_flow, status, trx_user, fecha_update)
            VALUES (?, ?, DEFAULT, ?, NOW())
            ON CONFLICT (anacod, name_flow)
            DO UPDATE SET fecha_update = NOW()
            RETURNING id_trx
        ", [ $anacod, $name_flow, 'CSANTOS' ] );

        // Si se espera solo un resultado, puedes acceder al id_trx así
        $idTrx = $result[ 0 ]->id_trx ?? null;

        $ms365 = new MailService();
        $to = 'csantos@red.com.sv';
        $bcc = [ 'dbolaines@red.com.sv' => '' ];
        $subject = "Asignacion de tarea: Crear usuario nuevo $nombre";

        $button = '<a href="http://administracion.red.com.sv/hiring/status-sap?id=' . $idTrx . '" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 5px;">Finalizado</a>';
        // Contenido HTML del correo, incluye imagen si está presente
        $body = "
        <div>
            <h1>Se brindan los datos para la creacion del usuario en SAP</h1>
            <li><strong>Nombre: </strong> $nombre</li>
            <pre>$allJson</pre>

            <h2>Confirmar tarea finalizada</h2>
            $button
        </div>
    ";

        $ms365->sendEmail( $to, '', $subject, $body, '', $bcc );
    }

    public function newHiring( $request ) {
        try {
            $this->crearUsuariosRedControl( $request );
        } catch ( Exception $e ) {
            //throw $th;
        }

        try {
            //code...
            $this->asignarRolesSan( $request );
        } catch ( Exception $e ) {
            //throw $th;
        }

        $imagenAnacod = null;
        try {
            //code...
            $imagenAnacod = $this->persistirArchivos( $request );
        } catch ( Exception $e ) {
            //throw $th;
        }

        try {
            //code...
            $this->persistirFormData( $request );
        } catch ( Exception $e ) {
            //throw $th;
        }

        try {
            //code...
            if ( $imagenAnacod ) {
                $this->sendTask365( $request, $imagenAnacod );
                # code...
            }
        } catch ( Exception $e ) {
            //throw $th;
        }

        try {
            //code...
            $this->sendInfoSap( $request );
        } catch ( Exception $e ) {
            //throw $th;
        }
    }

}
