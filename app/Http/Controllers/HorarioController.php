<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use App\Models\HorarioDia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $horarios = Horario::with('dias')->get();
        return Inertia::render('Horario', ['horarios' => $horarios]);
        //return json_encode($horarios);
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
            'nombre' => 'required|string|max:255',
            'dia_libre1' => 'nullable|integer',
            'dia_libre2' => 'nullable|integer',
        ], ['nombre.required' => 'El campo nombre es obligatorio.',]);
        $horario = new Horario();

        $horario = Horario::create([
            'nombre' => $request->nombre,
            'dia_libre1' => $request->dia_libre1,
            'dia_libre2' => $request->dia_libre2
        ]);

        return redirect(route('horario.edit', ['horario' => $horario->id]));
        //return json_encode($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Horario $horario)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($horario)
    {
        $horario = Horario::where('id', $horario)->with('dias')->get();
        //return json_encode($horario);
        return Inertia::render('Horario/Edit', ['horario' => $horario[0]]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Horario $horario)
    {
        //
    }

    public function updateDay(Request $request)
    {
        //return json_encode($request->all());
        HorarioDia::where('id', $request->id)->update(['entrada' => $request->entrada, 'salida_almuerzo' => $request->salida_almuerzo, 'entrada_almuerzo' => $request->entrada_almuerzo, 'salida' => $request->salida]);
        $this->edit($request->horario_id);
    }

    public function destroy(Horario $horario): RedirectResponse
    {
        HorarioDia::where('horario_id', '=', $horario->id)->delete();
        $horario->delete();
        return Redirect::to('/horarios');
    }

    public function storeDay(Request $request)
    {
        $day = HorarioDia::create([
            'numero_dia' => $request->numero_dia,
            'horario_id' => $request->horario_id,
            'entrada' => $request->entrada,
            'salida' => $request->salida_almuerzo,
            'entrada_almuerzo' => $request->entrada_almuerzo,
            'salida_almuerzo' => $request->salida,
        ]);

        $this->edit($request->horario_id);
    }

    public function destroyDay(HorarioDia $dia)
    {
        $horario_id = $dia->horario_id;
        $dia->delete();
        $this->edit($horario_id);
    }
}
