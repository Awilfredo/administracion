<?php

use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\ProfileController;
use App\Models\Asistencia;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use function Pest\Laravel\patch;

/*
Route::get('/asistencia', function(){
    return json_encode(Asistencia::all());
});
Route::get('/dashboard', function () {
    
    return Inertia::render('Dashboard', ['asistencias' => $asistencias]);
})->middleware(['auth', 'verified'])->name('dashboard');
*/
/*
    Route::get('/', function () {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    });
    */
Route::get('dashboard/resumen', [AsistenciaController::class, 'resumen'])->middleware(['auth', 'verified'])->name('resumen');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [AsistenciaController::class, 'index'])->name('welcome');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [AsistenciaController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/{fecha}', [AsistenciaController::class, 'fecha'])->name('asistencia.fecha');
    Route::patch('/asistencia/update', [AsistenciaController::class, 'update'])->name('asistencia.update');
    Route::patch('/asistencia/delete', [AsistenciaController::class, 'deleteAccion'])->name('asistencia.delete');
    Route::get('/asistencia/resumen/{anacod}', [AsistenciaController::class, 'resumenUsuario'])->name('usuario.resumen');
    Route::get('/horarios', [HorarioController::class, 'index'])->name('horario.index');
    Route::patch('/asistencia/actualizar/acciones', [AsistenciaController::class, 'accionesUpdate'])->name('acciones.update');
});

require __DIR__.'/auth.php';
