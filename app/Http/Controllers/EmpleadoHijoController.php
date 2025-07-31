<?php

namespace App\Http\Controllers;

use App\Models\EmpleadoHijo;
use Illuminate\Http\Request;

class EmpleadoHijoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required',
            'fecha_nacimiento' => 'required',
            'genero' => 'required',
        ]);

        EmpleadoHijo::create($request->all());
        return back()->with('success', 'Hijo guardado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(EmpleadoHijo $empleadoHijo)
    {
        return $empleadoHijo;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmpleadoHijo $empleadoHijo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required',
            'fecha_nacimiento' => 'required',
            'genero' => 'required',
        ]);

        EmpleadoHijo::find($id)->update($request->all());
        return back()->with('success', 'Hijo actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        EmpleadoHijo::find($id)->delete();
        return back()->with('success', 'Hijo eliminado correctamente');
    }
}
