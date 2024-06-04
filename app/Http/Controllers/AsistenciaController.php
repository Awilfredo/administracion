<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function index()
    {
        $asistencias = Asistencia::whereDate("fecha", Date::today())->orderBy('id')->get();
        return Inertia::render('Dashboard', ['asistencias' => $asistencias]);

       // return json_encode($asistencias);
    }

    public function fecha($fecha){
        $asistencias = Asistencia::whereDate("fecha",$fecha)->orderBy('id')->get();
        return Inertia::render('Dashboard', ['asistencias' => $asistencias, 'date' => $fecha]);
    }

    public function nfcIndex(){
        $registros = Asistencia::registrosNFC(Carbon::now()->format('Y-m-d'));
        return Inertia::render('RegistrosNFC', ['registros' => $registros, 'fecha' => Carbon::now()->format('Y-m-d')]);
    }
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Asistencia $asistencia)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function accionesUpdate(Request $request)
    {
            // Validación de los datos del request
    $request->validate([
        'accion_personal' => 'required|string', // Asegura que 'accion' esté presente y sea una cadena de texto
        'users_id' => 'required|array',     // Asegura que 'ids' esté presente y sea un array
        'users_id.*' => 'integer',          // Asegura que cada elemento del array 'ids' sea un entero
    ]);

        // Recuperar los IDs de la solicitud
        $users_id = $request->input('users_id');

        // Recuperar el nuevo valor de "accion"
        $nuevaAccion = $request->input('accion_personal');
    
        // Actualizar los registros
        Asistencia::whereIn('id', $users_id)->update(['accion_personal' => $nuevaAccion]);

        return Redirect::route('dashboard');


    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $asistencia = Asistencia::find($request->id);
        $asistencia->update($request->all());

    }

    /**
     * Remove the specified resource from storage.
     */
    public function deleteAccion(Request $request)
    {
        $asistencia = Asistencia::find($request->id);
        $asistencia->accion_personal = null;
        $asistencia->save();
    }

    public function resumen(){
        $llegadas_Tarde = Asistencia::tarde();
        $ausencias = Asistencia::ausencia();
        return Inertia::render('Resumen', ['llegadas_tarde' => $llegadas_Tarde, 'ausencias' =>$ausencias]);
        //return json_encode($resumen);
    }

    public function resumenUsuario($anacod){
        $resumen = Asistencia::where('anacod', $anacod)->get();
        return json_encode($resumen);
    }

    public function marcas(){
        $registros = Asistencia::marcas(Carbon::today());
        //$registros = Asistencia::marcas( Carbon::parse('2024-06-01'));
        //return Inertia::render('Marcaciones', ['registros'=> $registros, 'fecha' => Carbon::parse('2024-06-01')]);
        //return json_encode($registros);
        return Inertia::render('Marcaciones', ['registros'=> $registros, 'fecha' => Carbon::today()]);
    }
}
