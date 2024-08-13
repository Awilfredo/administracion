<?php

namespace App\Http\Controllers;

use App\Models\Horario;
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
            'dia_libre1'=> 'nullable|integer',
            'dia_libre2' => 'nullable|integer',
        ]);
        $horario = new Horario();
        /*
        $horario = Horario::create([
            'nombre' => $request->nombre,
            'dia_libre1' => $request->dia_libre1,
            'dia_libre2' => $request->dia_libre1
        ]);
*/
        //return redirect(route('horario.edit',['horario'=>$horario->id]));
        return json_encode($horario);
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Horario $horario)
    {
        //
    }
}
