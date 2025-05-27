<?php

namespace App\Http\Controllers;

use App\Mail\ControlRegistrationConfirmation;
use App\Mail\UserRegistrationConfirmation;
use Illuminate\Support\Facades\Validator;
use App\Models\Empleado;
use App\Models\Horario;
use App\Models\Hiring;
use App\Models\UsuarioRedControl;
use DateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Str;
class EmpleadoController extends Controller {
    public function index() {
        $empleados = Empleado::empleados();
        return Inertia::render( 'Empleados', [ 'empleados' => $empleados ] );
    }

    public function create() {
        $anacods = Empleado::pluck( 'anacod' );
        $horarios = Horario::all();
        $jefes = Empleado::jefes();
        $areas = Empleado::areas();
        $posiciones = Empleado::posiciones();
        return Inertia::render( 'Empleado/Create', [ 'anacods' => $anacods, 'jefes' => $jefes, 'areas' => $areas, 'posiciones' => $posiciones, 'horarios' => $horarios ] );
    }

    public function show( $anacod ) {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        $anacods = Empleado::pluck( 'anacod' );
        $horarios = Horario::all();
        $jefes = Empleado::jefes();
        $areas = Empleado::areas();
        $posiciones = Empleado::posiciones();
        $redControl = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', 1 )->first();
        $mensajeria = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', ( $empleado->anapai === 'SV' ) ? 26 : 32 )->first();
        return Inertia::render( 'Empleado/ShowEmpleado', [ 'empleado' => $empleado, 'anacods' => $anacods, 'jefes' => $jefes, 'areas' => $areas, 'posiciones' => $posiciones, 'horarios' => $horarios, 'redControl' => $redControl, 'mensajeria' => $mensajeria ] );
        //return json_encode( $empleado );
    }

    public function baja( Request $request ) {
        $request->validate( [
            'anacod' => 'required|string',
            'fechaBaja' => 'required|date'
        ] );

        $empleado = Empleado::where( 'anacod', $request->anacod )->first();

        if ( !$empleado ) {
            return response()->json( [ 'message' => 'Empleado no encontrado' ], 404 );
        }
        $empleado->anasta = 'I';
        $empleado->fecha_baja = $request->fechaBaja;
        $redControl = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', 1 )->first();
        $mensajeria = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', ( $empleado->anapai === 'SV' ) ? 26 : 32 )->first();
        $empleado->save();
        if ( $redControl ) {
            $redControl->estado = 1;
            $redControl->save();
        }
        if ( $mensajeria ) {
            $mensajeria->estado = 1;
            $mensajeria->save();
        }
        return redirect()->route( 'empleados.index' );
    }

    public function store( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'ananam' => 'required|string|max:255',
            'anapai' => 'required|string|max:2',
            'anamai' => 'required|email|max:255',
            'anasta' => 'nullable|string|max:1',
            'anatel' => 'nullable|string|max:20',
            'anarea' => 'required|string|max:3',
            'anarad' => 'nullable|string|max:50',
            'anajef' => 'required|string|max:50',
            'folcod' => 'nullable|integer',
            'folcodreal' => 'nullable|integer',
            'anaext' => 'nullable|string|max:10',
            'anapos' => 'required|string|max:50',
            'anames' => 'nullable|integer',
            'anadia' => 'nullable|integer',
            'fecha_ingreso' => 'nullable|date',
            'horario_id' => 'required|integer',
            'isBoss' => 'required|boolean',
            'lider_area' => 'required|string|max:50',
            'anaimg' => 'nullable|string|max:255',
        ] );
        // Crear un nuevo registro
        $empleado = Empleado::create( $validatedData );
        $empleado->asignarRolesSan( $request );
        $empleado->asignarReportes( $request );
        $empleado->asignarSuplementarios( $request );

        //Redirect user
        $recipients = [ 'it-global@red.com.sv', 'aayala@red.com.sv' ];
        Mail::to( $recipients )->send( new UserRegistrationConfirmation( $empleado->ananam, $empleado->anacod, $empleado->anamai, $empleado->anapas ) );
        return Redirect::route( 'empleados.show', [ $empleado->anacod ] );
    }

    public function saveSan( $request, $empleado ) {
        $request->validate( [
            'anacod' => 'required|string|max:255',
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'anamai' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|string|max:255',
            'anapai' => 'required|string|max:255',
            'fecha_ingreso' => 'required|string|max:255',
            'anapos' => 'required|string|max:255',
            'anarea' => 'required|string|max:255',
            'anajef' => 'required|string|max:255',
            'lider_area' => 'required|string|max:255',
            'horario_id' => 'required|string|max:255',
        ] );
        $empleado->anacod = $request->anacod;
        $empleado->ananam = $request->nombres . ' ' . $request->apellidos;
        $empleado->anamai = $request->anamai;
        $empleado->anasta = 'A';
        $empleado->anapai = $request->anapai;
        $empleado-> anajef = $request->anajef;
        $empleado->lider_area = $request->lider_area;
        $empleado->anarea = $request->anarea;
        $empleado->folcod = $request->folcod ? $request->folcod : null;
        $empleado->anaext = $request->anaext ? $request->anaext : null;
        $empleado->folcodreal = $request->folcodreal ? $request->folcodreal : null;
        $empleado->anatip = 'U';
        $empleado->anapos = $request->anapos;
        $empleado->anasuc = 1;
        if ( $request->fecha_nacimiento ) {
            $fechaNacimiento = new DateTime( $request->fecha_nacimiento );
            $empleado->anames = $fechaNacimiento->format( 'm' );
            $empleado->anadia = $fechaNacimiento->format( 'd' );
        }
        $empleado->telreg = '503';
        $empleado->teltip = 'ISSABEL';
        $empleado->fecha_ingreso = $request->fecha_ingreso;
        $empleado->horario_id = $request->horario_id;
        $empleado->save();
        return $empleado;
    }

    public function update( Request $request, $anacod ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'ananam' => 'required|string|max:255',
            'anapai' => 'required|string|max:2',
            'anamai' => 'required|email|max:255',
            'anatel' => 'nullable|string|max:20',
            'anarea' => 'required|string|max:50',
            'anarad' => 'nullable|string|max:50',
            'anajef' => 'required|string|max:50',
            'folcod' => 'nullable|integer',
            'folcodreal' => 'nullable|integer',
            'anaext' => 'nullable|string|max:10',
            'anapos' => 'required|string|max:50',
            'anames' => 'nullable|integer',
            'anadia' => 'nullable|integer',
            'fecha_ingreso' => 'nullable|date',
            'horario_id' => 'required|integer',
            'lider_area' => 'required|string|max:50',
        ] );

        $empleado = Empleado::find( $anacod );
        $empleado->anacod = $request->anacod;
        $empleado->ananam = $request->ananam;
        $empleado->anapai = $request->anapai;
        $empleado->anamai = $request->anamai;
        $empleado->anatel = $request->anatel;
        $empleado->anarea = $request->anarea;
        $empleado->anarad = $request->anarad;
        $empleado->anajef = $request->anajef;
        $empleado->folcod = $request->folcod;
        $empleado->folcodreal = $request->folcodreal;
        $empleado->anaext = $request->anaext;
        $empleado->anapos = $request->anapos;
        $empleado->anames = $request->anames;
        $empleado->anadia = $request->anadia;
        $empleado->fecha_ingreso = $request->fecha_ingreso;
        $empleado->horario_id = $request->horario_id;
        $empleado->lider_area = $request->lider_area;
        $empleado->save();
        return Redirect::route( 'empleados.show', [ $empleado->anacod ] );
    }

    public function insertarRegistro( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string',
            'ananam' => 'required|string',
            'anasta' => 'nullable|string',
            'anamai' => 'nullable|email',
            'anatel' => 'nullable|string',
            'anarea' => 'nullable|string',
        ] );

        // Insertar datos usando el modelo
        $registro = Empleado::create( $validatedData );

        // Respuesta
        return response()->json( [
            'message' => 'Registro insertado correctamente',
            'data' => $registro
        ], 201 );
    }

    public function updateImage( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'foto' => 'required|file|image|max:1024',
        ] );
        $empleado = Empleado::find( $request->anacod );
        $imagen_name = mb_strtolower( $empleado->anacod ) . '.' . $request->foto->getClientOriginalExtension();
        $request->foto->storeAs( 'uploads', $imagen_name, 'public' );

        $empleado->anaimg = $imagen_name;
        return json_encode( $empleado );
        // $empleado->anaimg = $request->foto->store( 'empleados', 'public' );

    }

    public function updateControl( Request $request ): RedirectResponse {
        $redControl = UsuarioRedControl::find( $request->id );
        $redControl->estado = $request->activar ? 2 : 1;
        $redControl->actualizacion = now();
        $redControl->save();
        return Redirect::route( 'empleados.show', [ $request->anacod ] );
    }

    public function crearMensajeria(Request $request):RedirectResponse
    {
        $usuarioMensajeria = new UsuarioRedControl();
        $empleado = Empleado::find($request->anacod);
        $contrasenia = Str::random(4) . rand(1000, 9999);
        $usuarioMensajeria->codigoInterno= hash( 'sha256', microtime( true ) );
        $usuarioMensajeria->idusuario = $request->aplicacion =='Mensajeria' ? strtolower($empleado->anacod) . '@mensajeria.red.' . strtolower($empleado->anapai) : $empleado->anacod;
        $usuarioMensajeria->cliente = 1;
        $usuarioMensajeria->email = $empleado->anamai;
        $usuarioMensajeria->nombre = $empleado->ananam;
        $usuarioMensajeria->jefeInmediato = $empleado->anajef;
        $usuarioMensajeria->contrasenia = base64_encode($contrasenia);
        $usuarioMensajeria->permisos = 1;
        $usuarioMensajeria->estado = 2;
        $usuarioMensajeria->telefono = $empleado->anatel;
        $usuarioMensajeria->trxdat = now()->toDateString();
        $usuarioMensajeria->empresa =$request->aplicacion =='Mensajeria' ? (( $empleado->anapai === 'SV' ) ? 26 : 32) : 1;
        $usuarioMensajeria->pais = $empleado->anapai;
        $usuarioMensajeria->imei = $empleado->getImei($empleado->folcod)->eqpser;
        $usuarioMensajeria->tracking_key = 1;
        $usuarioMensajeria->actualizacion = now();
        $usuarioMensajeria->anexo = $empleado->folcod;
        $usuarioMensajeria->lat = 0;
        $usuarioMensajeria->lng = 0;
        $usuarioMensajeria->save();
        $recipients = [$empleado->anamai, 'awcruz@red.com.sv'];
        Mail::to( $recipients )->send( new ControlRegistrationConfirmation( $usuarioMensajeria->nombre, $usuarioMensajeria->idusuario, $usuarioMensajeria->email, $contrasenia, $request->aplicacion) );
        return Redirect::route( 'empleados.show', [ $request->anacod ] );
    }
}
