<?php

namespace App\Http\Controllers;

use App\Mail\UserRegistrationConfirmation;
use App\Models\Asistencia;
use App\Models\Empleado;
use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionTipo;
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

        $data = array_merge($data, $this->dashboardAcciones());

        return Inertia::render( 'Dashboard', [ 'data' => $data ] );
    }

    protected function dashboardAcciones(): array
    {
        $hoy = Carbon::today()->toDateString();
        $sieteDias = Carbon::today()->addDays(7)->toDateString();

        $vigentes = EmpleadoAccion::with('tipo')
            ->where('estado', 'aprobado')
            ->where('fecha_inicio', '<=', $hoy)
            ->where(function ($q) use ($hoy) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $hoy);
            })
            ->get();

        $porTipo = [];
        foreach ($vigentes as $a) {
            $codigo = $a->tipo?->codigo ?? 'otro';
            $porTipo[$codigo] = ($porTipo[$codigo] ?? 0) + 1;
        }
        $porTipo['total'] = array_sum($porTipo);

        $proximas = EmpleadoAccion::with('tipo')
            ->where('estado', 'aprobado')
            ->where('fecha_inicio', '>', $hoy)
            ->where('fecha_inicio', '<=', $sieteDias)
            ->orderBy('fecha_inicio')
            ->orderBy('id')
            ->limit(5)
            ->get()
            ->map(function ($a) {
                $emp = Empleado::where('anacod', $a->anacod)->first();
                return [
                    'id' => $a->id,
                    'anacod' => $a->anacod,
                    'empleado_nombre' => $emp?->ananam,
                    'tipo_codigo' => $a->tipo?->codigo,
                    'tipo_nombre' => $a->tipo?->nombre,
                    'fecha_inicio' => $a->fecha_inicio?->toDateString(),
                    'fecha_fin' => $a->fecha_fin?->toDateString(),
                    'hora_inicio' => $a->hora_inicio,
                    'hora_fin' => $a->hora_fin,
                    'motivo' => $a->motivo,
                ];
            });

        return [
            'acciones_hoy' => $porTipo,
            'proximas_acciones' => $proximas,
        ];
    }

    public function index(Request $request) {
        $fecha = $request->query('fecha', Carbon::today()->toDateString());
        $fechaFin = $request->query('fecha_fin', $fecha);
        $usuario = strtoupper(trim((string) $request->query('usuario', '')));

        $query = Asistencia::orderBy('id');
        if ($fecha === $fechaFin) {
            $query->whereDate('fecha', $fecha);
        } else {
            $query->whereBetween('fecha', [$fecha, $fechaFin]);
        }
        if ($usuario !== '') {
            $query->where('anacod', 'like', "%{$usuario}%");
        }
        $asistencias = $query->get();

        return Inertia::render('Asistencia/Eventos', [
            'asistencias' => $asistencias,
            'tiposAccion' => EmpleadoAccionTipo::where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'codigo', 'nombre']),
            'filters' => [
                'fecha' => $fecha,
                'fecha_fin' => $fechaFin,
                'usuario' => $usuario,
            ],
        ]);
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
