<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DatosEmpleado;
use App\Models\Empleado;
use App\Models\EmpleadoHijo;

class DatosEmpleadoController extends Controller
{
    //
    public function index($anacod)
    {
        $datos = DatosEmpleado::where('anacod', $anacod)->with(['hijos', 'archivos'])->first();
        $empleado = Empleado::where('anacod', $anacod)->first();
        return Inertia::render('Empleado/Datos', [
            'datos' => $datos,
            'empleado' => $empleado,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'anacod' => 'required',
            'cc' => 'nullable',
            'genero' => 'nullable',
            'padre' => 'nullable',
            'madre' => 'nullable',
            'dui' => 'nullable',
            'nit' => 'nullable',
            'isss' => 'nullable',
            'tipo_afp' => 'nullable',
            'afp' => 'nullable',
            'tel_casa' => 'nullable',
            'cel_personal' => 'nullable',
            'direccion' => 'nullable',
            'modelo_red_ptt' => 'nullable',
            'imei' => 'nullable',
            'imei2' => 'nullable',
            'simcard' => 'nullable',
            'tipo_sim' => 'nullable',
            'observacion_equipo' => 'nullable',
            'tarjeta_acceso' => 'nullable',
            'dui_adjunto' => 'nullable',
            'comentarios' => 'nullable',
            'asegurado' => 'nullable',
        ]);

        $datos = DatosEmpleado::create($request->all());
        return back()->with('success', 'Datos guardados correctamente');
    }   

    public function update(Request $request, $id)
    {
        $request->validate([
            'anacod' => 'required',
            'cc' => 'nullable',
            'genero' => 'nullable',
            'padre' => 'nullable',
            'madre' => 'nullable',
            'dui' => 'nullable',
            'nit' => 'nullable',
            'isss' => 'nullable',
            'tipo_afp' => 'nullable',
            'afp' => 'nullable',
            'tel_casa' => 'nullable',
            'cel_personal' => 'nullable',
            'direccion' => 'nullable',
            'modelo_red_ptt' => 'nullable',
            'imei' => 'nullable',
            'imei2' => 'nullable',
            'simcard' => 'nullable',
            'tipo_sim' => 'nullable',
            'observacion_equipo' => 'nullable',
            'tarjeta_acceso' => 'nullable',
            'dui_adjunto' => 'nullable',
            'comentarios' => 'nullable',
            'asegurado' => 'nullable',
        ]);

        $datos = DatosEmpleado::find($id);
        $datos->update($request->all());
        return back()->with('success', 'Datos actualizados correctamente');
    }

    public function destroy($id)
    {
        $datos = DatosEmpleado::find($id);
        $datos->delete();
        return back()->with('success', 'Datos eliminados correctamente');
    }
}
