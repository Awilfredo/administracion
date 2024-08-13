<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Horario;
use App\Models\Hiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class EmpleadoController extends Controller
{
    public function index()
    {
        $empleados = Empleado::where('anatip', 'U')->where('anasta', 'A')->get();
        return Inertia::render('Empleados', ['empleados' => $empleados]);
    }

    public function create()
    {
        $anacods = Empleado::pluck('anacod');
        $horarios = Horario::all();
        $jefes = Empleado::jefes();
        $areas = Empleado::areas();
        $posiciones = Empleado::posiciones();
        return Inertia::render('Empleado/Create', ['anacods' => $anacods, 'jefes' => $jefes, 'areas' => $areas, 'posiciones' => $posiciones, 'horarios' => $horarios]);
    }

    public function store(Request $request)
    {

        // dump($request->all());
        /* $request->validate([
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
             'anatel' => 'required|string|max:255',
             'anajef' => 'required|string|max:255',
             'folcod' => 'required|string|max:255',
             'anaext' => 'required|string|max:255',
             'horario_id' => 'required|string|max:255',
         ]);*/

        // Instanciar el modelo
        Empleado::store($request);
        $hiring = new Hiring();
        $hiring->newHiring($request);

        // var_dump(json_encode($request->all()));
        // dd($request->all());
        // \Log::info(json_encode($request->files));
        //return json_encode($request->all());
        return Redirect::route('empleados.index');
    }
}
