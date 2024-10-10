<?php

namespace App\Http\Controllers;

use App\Mail\UserRegistrationConfirmation;
use App\Models\Asistencia;
use App\Models\Empleado;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class AsistenciaController extends Controller {
    public function formulario() {
        $anacod = isset( $_GET[ 'anacod' ] ) ? $_GET[ 'anacod' ] : null;
        return Inertia::render( 'Formulario', [ 'anacod' => $anacod ] );
    }

    public function formularioStore( Request $request ) {
        DB::connection( 'san' )->insert( "INSERT INTO aplicaciones.pro_usuarios_sistemas (anacod, posicion, modulos) VALUES ('$request->anacod', '$request->puesto', '$request->modulos')" );
    }

    public function dashboard() {
        $data = Asistencia::dashboard();
        return Inertia::render( 'Dashboard', [ 'data' => $data ] );
    }

    public function index() {
        return Inertia::render( 'Eventos' );
    }

    public function getEventos() {
        $fecha = isset( $_GET[ 'fecha' ] ) ? $_GET[ 'fecha' ] : null;
        $fecha_fin = isset( $_GET[ 'fecha_fin' ] ) ? $_GET[ 'fecha_fin' ] : null;

        if ( $fecha && $fecha_fin ) {
            $asistencias = Asistencia::whereBetween( 'fecha', [ $fecha, $fecha_fin ] )
            ->orderBy( 'id' )
            ->get();
            return json_encode( [ 'data'=>$asistencias ] );
        } elseif ( $fecha ) {
            $asistencias = Asistencia::whereDate( 'fecha', $fecha )->orderBy( 'id' )->get();
            return json_encode( [ 'data'=>$asistencias ] );
        }

        return json_encode( [ 'ok' => false, 'message' =>'No se ha enviado la fecha' ] );
    }

    public function nfcIndex() {
        $fecha = isset( $_GET[ 'fecha' ] ) ? $_GET[ 'fecha' ] : null;
        $fecha_fin = isset( $_GET[ 'fecha_fin' ] ) ? $_GET[ 'fecha_fin' ] : null;
        if ($fecha && $fecha_fin) {
            $fecha = $_GET[ 'fecha' ];
            $fecha_fin = $_GET[ 'fecha_fin' ];
            $registros = Asistencia::registrosNFCRango( $fecha, $fecha_fin );
            return json_encode( $registros );
        } elseif($fecha){
            $fecha = $_GET[ 'fecha' ];
            $registros = Asistencia::registrosNFC( $fecha );
            return json_encode( $registros );
        }
        return Inertia::render( 'RegistrosNFC');
    }

    public function create() {
        //
    }

    public function store( Request $request ) {
        //
    }

    /**
    * Display the specified resource.
    */

    public function show( Asistencia $asistencia ) {
        //
    }

    /**
    * Show the form for editing the specified resource.
    */

    public function accionesUpdate( Request $request ) {
        Asistencia::whereIn( 'id', $request->ids )->update( [ 'accion_personal' => $request->accion_personal ] );
    }

    public function accionUpdate( Request $request ) {

    }

    public function update( Request $request ) {
        $asistencia = Asistencia::find( $request->id );
        $asistencia->accion_personal = $request->accion_personal;
        $asistencia->save();
    }

    /**
    * Remove the specified resource from storage.
    */

    public function deleteAccion( Request $request ) {
        //return json_encode( $request->id );
        $asistencia = Asistencia::find( $request->id );
        $asistencia->accion_personal = null;
        $asistencia->save();
    }

    public function resumen() {
        if ( isset( $_GET[ 'mes' ] ) ) {
            $mes = $_GET[ 'mes' ];
            $anio = $_GET[ 'anio' ];
            $resumenEventos = Asistencia::resumenAsistenciaContador( $mes, $anio );
            return json_encode( $resumenEventos );
        } else {
            $resumenEventos = Asistencia::resumenAsistenciaContador( date( 'm' ), date( 'Y' ) );
            $llegadas_Tarde = Asistencia::tarde();
            $ausencias = Asistencia::ausencia();

            $recipients = [ 'dbolaines@red.com.sv', 'awcruz@red.com.sv' ];
            //Mail::to( $recipients )->send( new UserRegistrationConfirmation() );

            return Inertia::render( 'Resumen', [ 'llegadas_tarde' => $llegadas_Tarde, 'ausencias' => $ausencias, 'eventos' => $resumenEventos ] );
        }

        //return json_encode( $resumen );
    }

    public function resumenFecha( $anio, $mes ) {
        //return null;
        $eventos = Asistencia::resumenMes( $anio, $mes );
        return json_encode( $eventos );
        //return json_encode( [ 'anio' => $anio, 'mes'=>$mes ] );
    }

    public function resumenUsuario( $anacod, $evento ) {
        $resumen = Asistencia::resumenUsuario( $anacod, $evento );
        return json_encode( $resumen );
    }

    public function EventrosResumenContador( $month, $year ) {
        $eventosResumen = Asistencia::resumenAsistenciaContador( $month, $year );
        return json_encode( $eventosResumen );
    }

    public function marcas() {
        $registros = Asistencia::marcas( Carbon::today() );
        $nfc = Asistencia::registrosNFC( Carbon::now()->format( 'Y-m-d' ) );
        //$registros = Asistencia::marcas( Carbon::parse( '2024-06-01' ) );
        //return Inertia::render( 'Marcaciones', [ 'registros'=> $registros, 'fecha' => Carbon::parse( '2024-06-01' ) ] );
        //return json_encode( $registros );
        return Inertia::render( 'Marcaciones', [ 'registros' => $registros, 'nfc' => $nfc, 'fecha' => Carbon::today() ] );
    }

    public function estadisticas() {
        $empleados = Empleado::where( 'anatip', 'U' )->where( 'anasta', 'A' )->where( 'anapai', 'SV' )->orderBy( 'anacod' )->get();
        if ( isset( $_GET[ 'mes' ] ) && isset( $_GET[ 'mes' ] ) ) {
            $datos = Asistencia::horasNFCMes( $_GET[ 'anio' ], $_GET[ 'mes' ] );
            return json_encode( $datos );
        } else {
            $now = Carbon::now();
            $data = Asistencia::horasNFCMes( $now->format( 'Y' ), $now->format( 'm' ) );
            return Inertia::render( 'Estadisticas', [ 'datos' => $data, 'empleados' => $empleados ] );
        }
    }

    public function marcasCompletasDia() {
        if ( isset( $_GET[ 'fecha' ] ) ) {
            if ( isset( $_GET[ 'busqueda' ] ) && $_GET[ 'busqueda' ] == 'mes' ) {
                $fecha = $_GET[ 'fecha' ];
                $marcas = Asistencia::marcasCompletasMes( $fecha );
                return json_encode( $marcas );
            } else {
                $fecha = $_GET[ 'fecha' ];
                $marcas = Asistencia::marcasCompletasDia( $fecha );
                return json_encode( $marcas );
            }
        } else {
            $fechaActual = Carbon::now()->format( 'Y-m-d' );
            $marcas = Asistencia::marcasCompletasDia( $fechaActual );
            return Inertia::render( 'Asistencia/MarcasDia', [ 'marcas' => $marcas ] );
        }
    }

    public function nfcCreate() {
        $tags = Asistencia::tags();
        return Inertia::render( 'Nfc/Create', [ 'tags'=>$tags ] );
    }

    public function nfcStore( Request $request ) {
        Asistencia::nfcStore( $request->uid, $request->anacod );
        $tags = Asistencia::tags();
        $this->nfcCreate();
    }

    public function deleteTag( Request $request ) {
        //return json_encode( $request->uid );
        Asistencia::deleteTag( $request->uid );

        $this->nfcCreate();
    }
}
