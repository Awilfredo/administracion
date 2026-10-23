<?php

use App\Http\Controllers\AprobadorAsignacionController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\EmpleadoAccionController;
use App\Http\Controllers\EmpleadoAccionTipoController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\HiringController;
use App\Models\Asistencia;
use App\Models\Empleado;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DatosEmpleadoController;
use App\Http\Controllers\EmpleadoHijoController;
use App\Http\Controllers\EmpleadoArchivoController;
use App\Http\Controllers\PttEquipoController;

use function Pest\Laravel\patch;

/*
Route::get('/asistencia', function(){
    return json_encode(Asistencia::all());
*/
Route::get('/dashboard',[AsistenciaController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/aplicaciones/formulario',[AsistenciaController::class, 'formulario'])->name('formulario');
Route::post('/aplicaciones/formulario', [AsistenciaController::class, 'formularioStore'])->name('formulario.store');


Route::get('/test', [TestController::class, 'ping'])->name("test.ping");


//Rutas para formulario de contratacion
Route::prefix('hiring')->group(function () {
    Route::get('/status-office365', [HiringController::class, 'statusOffice365Step'])->name('office365.status');
    Route::get('/status-sap', [HiringController::class, 'statusSapStep'])->name('sap.status');
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
    Route::get('/asistencia/getEventos', [AsistenciaController::class, 'getEventos'])->name('eventos');
    Route::get('/asistencia/nfc', [AsistenciaController::class, 'nfcIndex'])->name('asistencia.nfc');
    Route::get('/asistencia/nfc/tags', [AsistenciaController::class, 'nfcCreate'])->name('tag.create');
    Route::post('/asistencia/nfc/tags', [AsistenciaController::class, 'nfcStore'])->name('tag.store');
    Route::delete('/asistencia/nfc/tags', [AsistenciaController::class, 'deleteTag'])->name('tag.delete');
    
    Route::get('asistencia/resumen', [AsistenciaController::class, 'resumen'])->name('resumen');
    Route::patch('/asistencia/update', [AsistenciaController::class, 'update'])->name('asistencia.update');
    Route::patch('/asistencia/delete', [AsistenciaController::class, 'deleteAccion'])->name('asistencia.delete');
    Route::get('/asistencia/marcas', [AsistenciaController::class, 'marcasCompletasDia'])->name('asistencia.marcas');
    
    //Route::get('/asistencia/marcasTest', [AsistenciaController::class, 'marcasCompletasDia'])->name('asistencia.marcasTest');
    
    Route::patch('/asistencia/actualizar/acciones', [AsistenciaController::class, 'accionesUpdate'])->name('acciones.update');
    Route::get('/asistencia/resumen/{anacod}/{evento}', [AsistenciaController::class, 'resumenUsuario'])->name('usuario.resumen');
    Route::get('/horarios', [HorarioController::class, 'index'])->name('horario.index');
    Route::post('/horarios', [HorarioController::class, 'store'])->name('horario.store');
    Route::get('/horarios/editar/{horario}', [HorarioController::class, 'edit'])->name('horario.edit');
    Route::post('/horarios/editar/', [HorarioController::class, 'storeDay'])->name('horarioDia.store');
    Route::delete('/horarios/{horario}', [HorarioController::class, 'destroy'])->name('horario.destroy');
    Route::delete('/horarios/editar/{dia}', [HorarioController::class, 'destroyDay'])->name('horarioDia.destroy');
    Route::patch('/horarios/editar/update', [HorarioController::class, 'updateDay'])->name('horarioDia.update');
    Route::get('/empleados', [EmpleadoController::class, 'index'])->name('empleados.index');
    Route::get('/empleados/export', [EmpleadoController::class, 'export'])->name('empleados.export');
    Route::get('/estadisticas', [AsistenciaController::class, 'estadisticas'])->name('estadisticas.index');
    Route::get('/empleados/nuevo', [EmpleadoController::class, 'create'])->name('empleados.create');
    Route::post('/empleados/store', [EmpleadoController::class, 'store'])->name('empleados.store');
    Route::patch('/empleados/{anacod}', [EmpleadoController::class, 'update'])->name('empleados.update');
    Route::get('/empleados/{anacod}', [EmpleadoController::class, 'show'])->name('empleados.show');
    Route::delete('/empleados/{anacod}/baja', [EmpleadoController::class, 'baja'])->name('empleados.baja');
    Route::get('asistencia/resumen/{anio}/{mes}', [AsistenciaController::class, 'resumenFecha'])->name('resumen.fecha');
    Route::post('empleados/update/image', [EmpleadoController::class, 'updateImage'])->name('empleados.update.image');
    Route::patch('empleados/update/control', [EmpleadoController::class, 'updateControl'])->name('empleados.update.control');
    Route::post('empleados/create/control', [EmpleadoController::class, 'crearMensajeria'])->name('empleado.create.control');
    Route::get('empleados/{anacod}/datos', [DatosEmpleadoController::class, 'index'])->name('datos.index');
    Route::post('datos', [DatosEmpleadoController::class, 'store'])->name('datos.store');
    Route::patch('datos/{id}', [DatosEmpleadoController::class, 'update'])->name('datos.update');
    route::post('hijos', [EmpleadoHijoController::class, 'store'])->name('hijos.store');
    route::patch('hijos/{id}', [EmpleadoHijoController::class, 'update'])->name('hijos.update');
    route::delete('hijos/{id}', [EmpleadoHijoController::class, 'destroy'])->name('hijos.destroy');
    route::post('archivos', [EmpleadoArchivoController::class, 'store'])->name('archivos.store');
    route::patch('archivos/{id}', [EmpleadoArchivoController::class, 'update'])->name('archivos.update');
    route::delete('archivos/{empleadoArchivo}', [EmpleadoArchivoController::class, 'destroy'])->name('archivos.destroy');


    Route::post('/ptt-equipos', [PttEquipoController::class, 'store'])->name('ptt-equipos.store');
    Route::patch('/ptt-equipos/{pttEquipo}', [PttEquipoController::class, 'update'])->name('ptt-equipos.update');
    Route::delete('/ptt-equipos/{pttEquipo}', [PttEquipoController::class, 'destroy'])->name('ptt-equipos.destroy');

    Route::post('/empleados/{anacod}/presupuesto/retry', [EmpleadoController::class, 'retryPresupuesto'])->name('empleados.presupuesto.retry');
    Route::post('/empleados/{anacod}/presupuesto/link', [EmpleadoController::class, 'linkPresupuesto'])->name('empleados.presupuesto.link');
    Route::get('/empleados/{anacod}/presupuesto', [EmpleadoController::class, 'presupuesto'])->name('empleados.presupuesto');

    Route::prefix('empleados/{anacod}/aprobadores')->group(function () {
        Route::get('/', [AprobadorAsignacionController::class, 'index'])->name('empleados.aprobadores.index');
        Route::post('/', [AprobadorAsignacionController::class, 'store'])->name('empleados.aprobadores.store');
        Route::post('/copiar-de/{fromAnacod}', [AprobadorAsignacionController::class, 'copyFrom'])->name('empleados.aprobadores.copy-from');
    });

    Route::prefix('empleados/{anacod}/acciones')->group(function () {
        Route::get('/', [EmpleadoAccionController::class, 'index'])->name('empleados.acciones.index');
        Route::get('/export', [EmpleadoAccionController::class, 'export'])->name('empleados.acciones.export');
        Route::get('/create', [EmpleadoAccionController::class, 'create'])->name('empleados.acciones.create');
        Route::post('/', [EmpleadoAccionController::class, 'store'])->name('empleados.acciones.store');
        Route::get('/{accion}/edit', [EmpleadoAccionController::class, 'edit'])->name('empleados.acciones.edit');
        Route::patch('/{accion}', [EmpleadoAccionController::class, 'update'])->name('empleados.acciones.update');
        Route::delete('/{accion}', [EmpleadoAccionController::class, 'destroy'])->name('empleados.acciones.destroy');
        Route::post('/{accion}/cancel', [EmpleadoAccionController::class, 'cancel'])->name('empleados.acciones.cancel');
        Route::get('/{accion}/archivos/{archivo}', [EmpleadoAccionController::class, 'downloadArchivo'])->name('empleados.acciones.archivos.download');
        Route::delete('/{accion}/archivos/{archivo}', [EmpleadoAccionController::class, 'destroyArchivo'])->name('empleados.acciones.archivos.destroy');
    });

    Route::prefix('acciones')->group(function () {
        Route::get('/', [EmpleadoAccionController::class, 'globalIndex'])->name('empleados.acciones.global.index');
        Route::get('/export', [EmpleadoAccionController::class, 'globalExport'])->name('empleados.acciones.global.export');
        Route::get('/dashboard', [EmpleadoAccionController::class, 'globalDashboard'])->name('empleados.acciones.global.dashboard');
        Route::get('/create', [EmpleadoAccionController::class, 'globalCreate'])->name('empleados.acciones.global.create');
        Route::post('/', [EmpleadoAccionController::class, 'globalStore'])->name('empleados.acciones.global.store');
        Route::get('/{accion}/edit', [EmpleadoAccionController::class, 'globalEdit'])->name('empleados.acciones.global.edit');
        Route::patch('/{accion}', [EmpleadoAccionController::class, 'globalUpdate'])->name('empleados.acciones.global.update');
        Route::delete('/{accion}', [EmpleadoAccionController::class, 'globalDestroy'])->name('empleados.acciones.global.destroy');
        Route::post('/{accion}/cancel', [EmpleadoAccionController::class, 'globalCancel'])->name('empleados.acciones.global.cancel');
        Route::post('/check-aprobador', [EmpleadoAccionController::class, 'checkAprobador'])->name('empleados.acciones.check-aprobador');
        Route::post('/asignar-aprobador-temporal', [EmpleadoAccionController::class, 'asignarAprobadorTemporal'])->name('empleados.acciones.asignar-aprobador-temporal');
        Route::post('/skip-aprobador-temporal', [EmpleadoAccionController::class, 'skipAprobadorTemporal'])->name('empleados.acciones.skip-aprobador-temporal');
        Route::get('/search-users', [EmpleadoAccionController::class, 'searchUsers'])->name('empleados.acciones.search-users');
        Route::get('/sin-aprobador-temporal', [EmpleadoAccionController::class, 'indexSinAprobador'])->name('empleados.acciones.sin-aprobador-temporal');
    });

    Route::prefix('admin/accion-tipos')->group(function () {
        Route::get('/', [EmpleadoAccionTipoController::class, 'index'])->name('admin.accion-tipos.index');
        Route::get('/create', [EmpleadoAccionTipoController::class, 'create'])->name('admin.accion-tipos.create');
        Route::post('/', [EmpleadoAccionTipoController::class, 'store'])->name('admin.accion-tipos.store');
        Route::get('/{tipo}/edit', [EmpleadoAccionTipoController::class, 'edit'])->name('admin.accion-tipos.edit');
        Route::patch('/{tipo}', [EmpleadoAccionTipoController::class, 'update'])->name('admin.accion-tipos.update');
        Route::delete('/{tipo}', [EmpleadoAccionTipoController::class, 'destroy'])->name('admin.accion-tipos.destroy');
    });

});



require __DIR__ . '/auth.php';
