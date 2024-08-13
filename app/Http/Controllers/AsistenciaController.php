<?php

namespace App\Http\Controllers;

use App\Mail\UserRegistrationConfirmation;
use App\Models\Asistencia;
use App\Models\Empleado;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function dashboard()
    {
        $data = Asistencia::dashboard();
        return Inertia::render('Dashboard', ['data' => $data]);
    }
    public function index()
    {
        $asistencias = Asistencia::whereDate("fecha", Date::today())->orderBy('id')->get();
        return Inertia::render('Eventos', ['asistencias' => $asistencias]);

        // return json_encode($asistencias);
    }

    public function fecha($fecha)
    {
        $asistencias = Asistencia::whereDate("fecha", $fecha)->orderBy('id')->get();
        return Inertia::render('Eventos', ['asistencias' => $asistencias, 'date' => $fecha]);
    }

    public function nfcIndex()
    {
        $registros = Asistencia::registrosNFC(Carbon::now()->format('Y-m-d'));
       // 

        if (isset($_GET['fecha']) || isset($_GET['busqueda'])) {
            if (isset($_GET['busqueda']) && $_GET['busqueda'] == 'mes') {
                $mes = $_GET['mes'];
                $anio = $_GET['anio'];
                $registros = Asistencia::registrosNFCMes($anio, $mes);
                return json_encode($registros);
            } else {
                $fecha = $_GET['fecha'];
                $registros = Asistencia::registrosNFC($fecha);
                return json_encode($registros);
            }
        } else {
            return Inertia::render('RegistrosNFC', ['registros' => $registros, 'fecha' => Carbon::now()->format('Y-m-d')]);
        }
    }
    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Asistencia $asistencia)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function accionesUpdate(Request $request)
    {
        // Validación de los datos del request
        $request->validate([
            'accion_personal' => 'required|string', // Asegura que 'accion' esté presente y sea una cadena de texto
            'users_id' => 'required|array',     // Asegura que 'ids' esté presente y sea un array
            'users_id.*' => 'integer',          // Asegura que cada elemento del array 'ids' sea un entero
        ]);

        // Recuperar los IDs de la solicitud
        $users_id = $request->input('users_id');

        // Recuperar el nuevo valor de "accion"
        $nuevaAccion = $request->input('accion_personal');

        // Actualizar los registros
        Asistencia::whereIn('id', $users_id)->update(['accion_personal' => $nuevaAccion]);

        return Redirect::route('dashboard');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $asistencia = Asistencia::find($request->id);
        $asistencia->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function deleteAccion(Request $request)
    {
        $asistencia = Asistencia::find($request->id);
        $asistencia->accion_personal = null;
        $asistencia->save();
    }

    public function resumen()
    {
        if (isset($_GET['mes'])) {
            $mes = $_GET['mes'];
            $anio = $_GET['anio'];
            $resumenEventos = Asistencia::resumenAsistenciaContador($mes, $anio);
            return json_encode($resumenEventos);
        } else {
            $resumenEventos = Asistencia::resumenAsistenciaContador(date('m'), date('Y'));
            $llegadas_Tarde = Asistencia::tarde();
            $ausencias = Asistencia::ausencia();
            
            $recipients = ['dbolaines@red.com.sv', 'awcruz@red.com.sv'];
            Mail::to($recipients)->send(new UserRegistrationConfirmation());

            
            return Inertia::render('Resumen', ['llegadas_tarde' => $llegadas_Tarde, 'ausencias' => $ausencias, 'eventos' => $resumenEventos]);
        }


        //return json_encode($resumen);
    }

    public function resumenFecha($anio, $mes)
    {
        //return null;
        $eventos = Asistencia::resumenMes($anio, $mes);
        return json_encode($eventos);
        //return json_encode(['anio' => $anio, 'mes'=>$mes]);
    }
    public function resumenUsuario($anacod, $evento)
    {
        $resumen = Asistencia::resumenUsuario($anacod, $evento);
        return json_encode($resumen);
    }

    public function EventrosResumenContador($month)
    {
        $eventosResumen = Asistencia::resumenAsistenciaContador($month);
        return json_encode($eventosResumen);
    }

    public function marcas()
    {
        $registros = Asistencia::marcas(Carbon::today());
        $nfc = Asistencia::registrosNFC(Carbon::now()->format('Y-m-d'));
        //$registros = Asistencia::marcas( Carbon::parse('2024-06-01'));
        //return Inertia::render('Marcaciones', ['registros'=> $registros, 'fecha' => Carbon::parse('2024-06-01')]);
        //return json_encode($registros);
        return Inertia::render('Marcaciones', ['registros' => $registros, 'nfc' => $nfc, 'fecha' => Carbon::today()]);
    }

    public function estadisticas()
    {
        $empleados = Empleado::where('anatip', 'U')->where('anasta', 'A')->where('anapai', 'SV')->orderBy('anacod')->get();
        if(isset($_GET['mes']) && isset($_GET['mes'])){
            $datos = Asistencia::horasNFCMes($_GET['anio'], $_GET['mes']);
            return json_encode($datos);
        }else{
            $now= Carbon::now();
            $data = Asistencia::horasNFCMes($now->format('Y'), $now->format('m'));
            return Inertia::render('Estadisticas', ['datos' => $data, 'empleados' => $empleados]);
        }
    }

    public function marcasCompletasDia()
    {
        if (isset($_GET['fecha'])) {
            if (isset($_GET['busqueda']) && $_GET['busqueda'] == 'mes') {
                $fecha = $_GET['fecha'];
                $marcas = Asistencia::marcasCompletasMes($fecha);
                return json_encode($marcas);
            } else {
                $fecha = $_GET['fecha'];
                $marcas = Asistencia::marcasCompletasDia($fecha);
                return json_encode($marcas);
            }
        } else {
            $fechaActual = Carbon::now()->format('Y-m-d');
            $marcas = Asistencia::marcasCompletasDia($fechaActual);
            return Inertia::render('Asistencia/MarcasDia', ['marcas' => $marcas]);
        }
    }
}
