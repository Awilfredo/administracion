<?php

namespace App\Http\Controllers;

use App\Mail\EmpleadoArchivoSubido;
use App\Models\DatosEmpleado;
use App\Models\Empleado;
use App\Models\EmpleadoArchivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class EmpleadoArchivoController extends Controller
{
    /**
     * Correo que recibe la notificación de archivos cargados.
     */
    private const DESTINATARIO_NOTIFICACION = 'awcruz@red.com.sv';

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

        $archivo = $request->file('archivo');
        $nombreOriginal = $archivo->getClientOriginalName();

        // Guarda el archivo en storage/app/public/empleados
        $path = $archivo->store('empleados', 'public');

        // Crea el registro en la base de datos
        EmpleadoArchivo::create([
            'empleado_id' => $request->empleado_id,
            'nombre' => $request->nombre,
            'ruta' => $path,
        ]);

        // Notifica por correo los archivos cargados (adjuntando el archivo).
        // Si el correo falla, la carga se mantiene y se registra el error.
        $this->notificarArchivosCargados(
            $request->empleado_id,
            $request->nombre,
            $path,
            $nombreOriginal
        );

        return back()->with('success', 'Archivo subido correctamente.');
    }

    /**
     * Envía la notificación por correo de los archivos cargados.
     */
    protected function notificarArchivosCargados(
        $empleadoId,
        string $nombreArchivo,
        string $ruta,
        string $nombreOriginal
    ): void {
        try {
            $datos = DatosEmpleado::find($empleadoId);

            if (! $datos) {
                Log::warning('No se encontró el registro de datos del empleado para notificar archivos.', [
                    'empleado_id' => $empleadoId,
                ]);

                return;
            }

            $empleado = Empleado::where('anacod', $datos->anacod)->first();

            $nombreEmpleado = $empleado->ananam ?? $datos->anacod;

            Mail::to(self::DESTINATARIO_NOTIFICACION)->send(
                new EmpleadoArchivoSubido(
                    $nombreEmpleado,
                    $datos->anacod,
                    $nombreArchivo,
                    $nombreOriginal,
                    $ruta,
                    $empleado->anarea ?? null,
                    $empleado->anapos ?? null,
                    Auth::user()?->name ?? Auth::user()?->email
                )
            );
        } catch (\Throwable $e) {
            // La carga del archivo ya fue realizada; no se revierte por un fallo de correo.
            Log::error('No se pudo enviar la notificación por correo de archivos cargados.', [
                'empleado_id' => $empleadoId,
                'ruta' => $ruta,
                'error' => $e->getMessage(),
            ]);
        }
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
        // ELIMINAR EL ARCHIVO DEL DISK $path = $request->file('archivo')->store('empleados', 'public');
        Storage::disk('public')->delete($empleadoArchivo->ruta);

        return back()->with('success', 'Archivo eliminado correctamente.');
    }
}
