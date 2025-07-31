<?php

namespace App\Http\Controllers;

use App\Models\EmpleadoArchivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmpleadoArchivoController extends Controller
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
            'empleado_id' => 'required',
            'nombre' => 'required',
            'archivo' => 'required|file|max:5120', // max 5MB
        ]);
    
        // Guarda el archivo en storage/app/public/empleados
        $path = $request->file('archivo')->store('empleados', 'public');
    
        // Crea el registro en la base de datos
        EmpleadoArchivo::create([
            'empleado_id' => $request->empleado_id,
            'nombre' => $request->nombre,
            'ruta' => $path,
        ]);
    
        return back()->with('success', 'Archivo subido correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EmpleadoArchivo $empleadoArchivo)
    {
        return $empleadoArchivo;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EmpleadoArchivo $empleadoArchivo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EmpleadoArchivo $empleadoArchivo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmpleadoArchivo $empleadoArchivo)
    {
        $empleadoArchivo->delete();
        //ELIMINAR EL ARCHIVO DEL DISK $path = $request->file('archivo')->store('empleados', 'public');
        Storage::disk('public')->delete($empleadoArchivo->ruta);
        return back()->with('success', 'Archivo eliminado correctamente.');
    }
}
