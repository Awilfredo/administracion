<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
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
    public function edit(Asistencia $asistencia)
    {
        //
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
}
