<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Validator;
use App\Models\Empleado;
use App\Models\Horario;
use App\Models\Hiring;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

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
        return Inertia::render( 'Empleado/ShowEmpleado', [ 'empleado' => $empleado, 'anacods' => $anacods, 'jefes' => $jefes, 'areas' => $areas, 'posiciones' => $posiciones, 'horarios' => $horarios ] );
        //return json_encode( $empleado );
    }

    public function baja( $anacod ) {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        $empleado->anasta = 'I';
        $empleado->save();
    }

    public function store( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'ananam' => 'required|string|max:255',
            'anapas' => 'required|string|max:255',
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
            'anaimg' => 'nullable|string|max:255',
        ] );

        // Crear un nuevo registro
        $empleado = Empleado::create( $validatedData );

        // // Retornar una respuesta
        // return response()->json( [
        //     'success' => true,
        //     'message' => 'Empleado creado con éxito',
        //     'data' => $empleado
        // ], 201 );

        return Redirect::route( 'empleados.show', [ $empleado->anacod ] );
        //Redirect original
    }

    public function saveSan( $request, $empleado ) {
        $request->validate( [
            'anacod' => 'required|string|max:255',
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'anamai' => 'required|string|max:255',
            'anapas' => 'required|string|max:255',
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
        $empleado->anapas = $request->anapas;
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
            'anapas' => 'required|string|max:255',
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
            'anaimg' => 'nullable|string|max:255',
        ] );
        $empleado = Empleado::find( $anacod );
        $empleado->update($validatedData);
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

    public function updateImage(Request $request) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'foto' => 'required|file|image|max:1024',
        ] );
        $empleado = Empleado::find( $request->anacod );
        $imagen_name = mb_strtolower($empleado->anacod) . '.' . $request->foto->getClientOriginalExtension();
        $request->foto->storeAs('uploads', $imagen_name , 'public');  
        $empleado->anaimg = $imagen_name;
        return json_encode($empleado);
        // $empleado->anaimg = $request->foto->store( 'empleados', 'public' );              
    }
}
