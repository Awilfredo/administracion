<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmpleadoController extends Controller
{
    public function index()
    {
        $empleados = Empleado::where('anatip', 'U')->get();
        return Inertia::render('Empleados', ['empleados'=> $empleados]);
    }
}
