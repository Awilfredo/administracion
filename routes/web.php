<?php

use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\HiringController;
use App\Models\Asistencia;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use function Pest\Laravel\patch;

/*
Route::get('/asistencia', function(){
    return json_encode(Asistencia::all());
*/
Route::get('/dashboard',[AsistenciaController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');



Route::get('/test', [TestController::class, 'ping'])->name("test.ping");


//Rutas para formulario de contratacion
Route::prefix('hiring')->group(function () {
    Route::get('/status-office365', [HiringController::class, 'statusOffice365Step'])->name('office365.status');
    // Aquí puedes agregar más rutas que comiencen con /hiring
});

Route::middleware(['auth', 'verified'])->group(function () {
    /*
        Route::get('/', function () {
            return Inertia::render('Welcome', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ]);
        });*/

    Route::get('/', function () {
        return Redirect::route('dashboard');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/asistencia/eventos/{fecha}', [AsistenciaController::class, 'fecha'])->name('asistencia.fecha');
    Route::get('/asistencia/eventos', [AsistenciaController::class, 'index'])->name('asistencia.eventos');
    Route::get('/asistencia/nfc', [AsistenciaController::class, 'nfcIndex'])->name('asistencia.nfc');
    Route::get('asistencia/resumen', [AsistenciaController::class, 'resumen'])->name('resumen');
    Route::patch('/asistencia/update', [AsistenciaController::class, 'update'])->name('asistencia.update');
    Route::patch('/asistencia/delete', [AsistenciaController::class, 'deleteAccion'])->name('asistencia.delete');
    Route::get('/asistencia/marcas', [AsistenciaController::class, 'marcasCompletasDia'])->name('asistencia.marcas');

    //Route::get('/asistencia/marcasTest', [AsistenciaController::class, 'marcasCompletasDia'])->name('asistencia.marcasTest');

    Route::get('/asistencia/resumen/{anacod}/{evento}', [AsistenciaController::class, 'resumenUsuario'])->name('usuario.resumen');
    Route::get('/horarios', [HorarioController::class, 'index'])->name('horario.index');
    Route::get('/horarios/editar/{horario}', [HorarioController::class, 'edit'])->name('horario.edit');
    Route::patch('/asistencia/actualizar/acciones', [AsistenciaController::class, 'accionesUpdate'])->name('acciones.update');
    Route::get('/empleados', [EmpleadoController::class, 'index'])->name('empleados.index');
    Route::get('/estadisticas', [AsistenciaController::class, 'estadisticas'])->name('estadisticas.index');
    Route::get('/empleados/nuevo', [EmpleadoController::class, 'create'])->name('empleados.create');
    Route::post('/empleados/store', [EmpleadoController::class, 'store'])->name('empleados.store');
    Route::get('asistencia/resumen/{anio}/{mes}', [AsistenciaController::class, 'resumenFecha'])->name('resumen.fecha');
});



require __DIR__ . '/auth.php';
