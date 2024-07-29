<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Horario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    public function ping()
    {
        // $res = DB::connection('redControl')->select("SELECT * FROM usuario LIMIT 5");
        // return json_encode($res);
        echo 'pong';
    }

}
