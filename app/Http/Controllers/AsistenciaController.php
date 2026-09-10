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
        return Inertia::render( 'Asistencia/Formulario', [ 'anacod' => $anacod ] );
    }

    public function formularioStore( Request $request ) {
        DB::connection( 'san' )->insert( "INSERT INTO aplicaciones.pro_usuarios_sistemas (anacod, posicion, modulos) VALUES ('$request->anacod', '$request->puesto', '$request->modulos')" );
    }

    public function dashboard(Request $request) {
        $cumpleMes  = $request->has('cumple_mes')  ? (int) $request->query('cumple_mes')  : null;
        $cumpleAnio = $request->has('cumple_anio') ? (int) $request->query('cumple_anio') : null;
        $data = Asistencia::dashboard(null, null, $cumpleMes, $cumpleAnio);

        $anioActual = (int) date( 'Y' );
        $data['puntualidad_anual'] = [
            'anio' => $anioActual,
            'tasa' => round( Asistencia::tasaPuntualidadAnio( $anioActual ), 1 ),
            'tasa_anio_anterior' => round( Asistencia::tasaPuntualidadAnio( $anioActual - 1 ), 1 ),
            'top_10' => Asistencia::tasaPuntualidadUsuariosAnio( $anioActual, 10 ),
        ];

        return Inertia::render( 'Dashboard', [ 'data' => $data ] );
    }

    public function index() {
        return Inertia::render( 'Asistencia/Eventos' );
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
        $fechaActual = Carbon::now()->format( 'Y-m-d' );
        $fecha = $_GET[ 'fecha' ] ?? $fechaActual;
        $fechaFin = $_GET[ 'fecha_fin' ] ?? null;
        $usuario = strtoupper( $_GET[ 'usuario' ] ?? '' );
        $preset = $_GET[ 'preset' ] ?? 'hoy';

        if ( $fechaFin && $fechaFin !== $fecha ) {
            $registros = Asistencia::registrosNFCRango( $fecha, $fechaFin, $usuario );
        } else {
            $registros = Asistencia::registrosNFC( $fecha, $usuario );
        }

        return Inertia::render( 'Asistencia/RegistrosNFC', [
            'registros' => $registros,
            'filters' => [
                'fecha' => $fecha,
                'fecha_fin' => $fechaFin,
                'usuario' => $usuario,
                'preset' => $preset,
            ],
        ] );
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
        $mes = (int) ( $_GET[ 'mes' ] ?? date( 'n' ) );
        $anio = $_GET[ 'anio' ] ?? date( 'Y' );

        $eventos = Asistencia::resumenAsistenciaContador( $mes, $anio );
        $kpis = [
            'tasa_puntualidad' => Asistencia::tasaPuntualidadMes( $mes, $anio ),
            'total_eventos' => Asistencia::totalEventosMes( $mes, $anio ),
            'empleados_sin_incidencias' => Asistencia::empleadosSinIncidencias( $mes, $anio ),
            'total_empleados' => Asistencia::totalEmpleadosActivos(),
        ];
        $tendencia = Asistencia::tendenciaMensual( $mes, $anio, 6 );
        $porJefe = Asistencia::eventosPorJefe( $mes, $anio );
        $topImpuntuales = Asistencia::topImpuntuales( $mes, $anio, 5 );
        $topPontuales = Asistencia::topPontuales( $mes, $anio, 5 );

        return Inertia::render( 'Asistencia/Resumen', [
            'eventos' => $eventos,
            'kpis' => $kpis,
            'tendencia' => $tendencia,
            'porJefe' => $porJefe,
            'topImpuntuales' => $topImpuntuales,
            'topPontuales' => $topPontuales,
            'filters' => [
                'mes' => $mes,
                'anio' => $anio,
            ],
        ] );
    }

    public function resumenFecha( $anio, $mes ) {
        $eventos = Asistencia::resumenMes( $anio, $mes );
        return Inertia::render( 'Asistencia/Resumen', [
            'eventos' => $eventos,
            'filters' => [ 'mes' => $mes, 'anio' => $anio ],
        ] );
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
        return Inertia::render( 'Asistencia/Marcaciones', [ 'registros' => $registros, 'nfc' => $nfc, 'fecha' => Carbon::today() ] );
    }

    public function estadisticas() {
        $empleados = Empleado::where( 'anatip', 'U' )->where( 'anasta', 'A' )->where( 'anapai', 'SV' )->orderBy( 'anacod' )->get();
        if ( isset( $_GET[ 'mes' ] ) && isset( $_GET[ 'mes' ] ) ) {
            $datos = Asistencia::horasNFCMes( $_GET[ 'anio' ], $_GET[ 'mes' ] );
            return json_encode( $datos );
        } else {
            $now = Carbon::now();
            $data = Asistencia::horasNFCMes( $now->format( 'Y' ), $now->format( 'm' ) );
            return Inertia::render( 'Asistencia/Estadisticas', [ 'datos' => $data, 'empleados' => $empleados ] );
        }
    }

    public function marcasCompletasDia() {
        $fechaActual = Carbon::now()->format( 'Y-m-d' );
        $fecha = $_GET[ 'fecha' ] ?? $fechaActual;
        $fechaFin = $_GET[ 'fecha_fin' ] ?? null;
        $usuario = strtoupper( $_GET[ 'usuario' ] ?? '' );
        $preset = $_GET[ 'preset' ] ?? 'hoy';

        if ( isset( $_GET[ 'busqueda' ] ) && $_GET[ 'busqueda' ] == 'mes' ) {
            $marcas = Asistencia::marcasCompletasMes( $fecha );
            return Inertia::render( 'Asistencia/MarcasDia', [
                'marcas' => $marcas,
                'filters' => [
                    'fecha' => $fecha,
                    'fecha_fin' => $fechaFin,
                    'usuario' => $usuario,
                    'preset' => $preset,
                ],
            ] );
        }

        $marcas = Asistencia::marcasCompletasDia( $fecha, $fechaFin, $usuario );

        return Inertia::render( 'Asistencia/MarcasDia', [
            'marcas' => $marcas,
            'filters' => [
                'fecha' => $fecha,
                'fecha_fin' => $fechaFin,
                'usuario' => $usuario,
                'preset' => $preset,
            ],
        ] );
    }

    public function nfcCreate() {
        return Inertia::render( 'Nfc/Create', [
            'tagsConTag' => Asistencia::tagsConTag(),
            'tagsSinTag' => Asistencia::tagsSinTag(),
            'totalEmpleados' => Asistencia::totalEmpleadosActivos(),
        ] );
    }

    public function nfcStore( Request $request ) {
        Asistencia::nfcStore( $request->uid, $request->anacod );
        return $this->nfcCreate();
    }

    public function deleteTag( Request $request ) {
        Asistencia::deleteTag( $request->uid );
        return $this->nfcCreate();
    }
}
