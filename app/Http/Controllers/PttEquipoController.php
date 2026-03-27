<?php

namespace App\Http\Controllers;

use App\Models\PttEquipo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PttEquipoController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'anacod' => ['required', 'string', 'max:50'],
            'licencia' => ['nullable', 'string', 'max:255'],
            'anexo' => ['nullable', 'integer'],
            'numero_telefono' => ['nullable', 'string', 'max:255'],
            'modelo_equipo' => ['nullable', 'string', 'max:255'],
            'imei' => ['nullable', 'string', 'max:255'],
            'imei2' => ['nullable', 'string', 'max:255'],
            'sim' => ['nullable', 'string', 'max:255'],
            'sim2' => ['nullable', 'string', 'max:255'],
            'tipo_sim' => ['nullable', 'string', 'max:255'],
            'descripcion_empresa' => ['nullable', 'string'],
            'plan_operador' => ['nullable', 'string'],
            'comentarios' => ['nullable', 'string'],
        ]);

        PttEquipo::create($validated);

        return back()->with('success', 'Equipo creado correctamente.');
    }

    public function update(Request $request, PttEquipo $pttEquipo): RedirectResponse
    {
        $validated = $request->validate([
            'anacod' => ['required', 'string', 'max:50'],
            'licencia' => ['nullable', 'string', 'max:255'],
            'anexo' => ['nullable', 'integer'],
            'numero_telefono' => ['nullable', 'string', 'max:255'],
            'modelo_equipo' => ['nullable', 'string', 'max:255'],
            'imei' => ['nullable', 'string', 'max:255'],
            'imei2' => ['nullable', 'string', 'max:255'],
            'sim' => ['nullable', 'string', 'max:255'],
            'sim2' => ['nullable', 'string', 'max:255'],
            'tipo_sim' => ['nullable', 'string', 'max:255'],
            'descripcion_empresa' => ['nullable', 'string'],
            'plan_operador' => ['nullable', 'string'],
            'comentarios' => ['nullable', 'string'],
        ]);

        $pttEquipo->update($validated);

        return back()->with('success', 'Equipo actualizado correctamente.');
    }

    public function destroy(PttEquipo $pttEquipo): RedirectResponse
    {
        $pttEquipo->delete();

        return back()->with('success', 'Equipo eliminado correctamente.');
    }
}