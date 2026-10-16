<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionArchivo;
use App\Models\EmpleadoAccionTipo;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmpleadoAccionController extends Controller
{
    protected function ensureEmpleadoExists(string $anacod): void
    {
        $exists = DB::connection('san')
            ->table('aplicaciones.pro_anacod')
            ->where('anacod', $anacod)
            ->exists();

        if (! $exists) {
            abort(404);
        }
    }

    protected function validatePayload(Request $request, bool $requireAnacod): array
    {
        $rules = [
            'tipo_id' => 'required|integer|exists:empleado_accion_tipos,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i|after:hora_inicio',
            'motivo' => 'required|string|max:1000',
            'observaciones' => 'nullable|string|max:1000',
            'archivos.*' => 'nullable|file|max:10240',
        ];
        if ($requireAnacod) {
            $rules['anacod'] = 'required|string|max:50';
        }

        $merged = $request->all();
        foreach (['hora_inicio', 'hora_fin'] as $k) {
            if (! empty($merged[$k]) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $merged[$k])) {
                $merged[$k] = substr($merged[$k], 0, 5);
            }
        }
        $request->merge($merged);

        $data = $request->validate($rules);

        foreach (['hora_inicio', 'hora_fin'] as $k) {
            if (! empty($data[$k]) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $data[$k])) {
                $data[$k] = substr($data[$k], 0, 5);
            }
        }

        if (! empty($data['hora_inicio']) || ! empty($data['hora_fin'])) {
            $inicio = $data['fecha_inicio'] ?? null;
            $fin = $data['fecha_fin'] ?? $data['fecha_inicio'] ?? null;
            if ($fin && $inicio && $fin !== $inicio) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'hora_inicio' => 'Las horas solo aplican a permisos de un solo día (fecha_inicio debe coincidir con fecha_fin).',
                ]);
            }
        }

        return $data;
    }

    protected function persist(Request $request, array $data, string $anacod, ?EmpleadoAccion $existing = null): EmpleadoAccion
    {
        if ($existing) {
            $originals = $existing->getOriginal();
            $oldAnacod = $originals['anacod'] ?? $anacod;
            $oldFechaInicio = $originals['fecha_inicio'] ?? null;
            $oldFechaFin = $originals['fecha_fin'] ?? null;
            $oldHoraInicio = $originals['hora_inicio'] ?? null;
            $oldHoraFin = $originals['hora_fin'] ?? null;
            $oldTipoId = $originals['tipo_id'] ?? null;
            $oldTipoNombre = $oldTipoId ? EmpleadoAccionTipo::where('id', $oldTipoId)->value('nombre') : null;

            $data['updated_by'] = Auth::id();
            $existing->update($data);
            $accion = $existing;

            $this->limpiarEventosEnRango(
                $oldAnacod,
                $oldFechaInicio,
                $oldFechaFin,
                $oldHoraInicio ? substr($oldHoraInicio, 0, 5) : null,
                $oldHoraFin ? substr($oldHoraFin, 0, 5) : null
            );

            $this->llenarEventosEnRango(
                $accion->anacod,
                $accion->fecha_inicio,
                $accion->fecha_fin,
                EmpleadoAccionTipo::where('id', $accion->tipo_id)->value('nombre'),
                $accion->hora_inicio ? substr($accion->hora_inicio, 0, 5) : null,
                $accion->hora_fin ? substr($accion->hora_fin, 0, 5) : null
            );
        } else {
            $data['anacod'] = $anacod;
            $data['estado'] = 'aprobado';
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();
            $accion = EmpleadoAccion::create($data);

            $this->llenarEventosEnRango(
                $accion->anacod,
                $accion->fecha_inicio,
                $accion->fecha_fin,
                EmpleadoAccionTipo::where('id', $accion->tipo_id)->value('nombre'),
                $accion->hora_inicio ? substr($accion->hora_inicio, 0, 5) : null,
                $accion->hora_fin ? substr($accion->hora_fin, 0, 5) : null
            );
        }
        $this->storeArchivos($request, $accion);
        return $accion;
    }

    private function getTipoNombre(int $tipoId): ?string
    {
        return EmpleadoAccionTipo::where('id', $tipoId)->value('nombre');
    }

    private function limpiarEventosEnRango(
        string $anacod,
        $fechaInicio,
        $fechaFin,
        ?string $horaInicio,
        ?string $horaFin
    ): void {
        $fechaInicioStr = $fechaInicio instanceof Carbon ? $fechaInicio->toDateString() : $fechaInicio;
        $fechaFinStr = $fechaFin instanceof Carbon ? $fechaFin->toDateString() : ($fechaFin ?? $fechaInicioStr);
        if (! $fechaInicioStr) return;

        try {
            $query = DB::connection('san')
                ->table('aplicaciones.pro_eventos_asistencia')
                ->where('anacod', $anacod)
                ->whereBetween(DB::raw('DATE(fecha)'), [$fechaInicioStr, $fechaFinStr])
                ->whereIn('evento', ['Tarde', 'Ausencia', 'Salida antes']);

            $this->aplicarFiltroHora($query, $horaInicio, $horaFin);

            $query->update(['accion_personal' => null]);
        } catch (\Throwable $e) {
            Log::warning('Error al limpiar eventos en rango', [
                'anacod' => $anacod,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function llenarEventosEnRango(
        string $anacod,
        $fechaInicio,
        $fechaFin,
        ?string $tipoNombre,
        ?string $horaInicio,
        ?string $horaFin
    ): void {
        if (! $tipoNombre) return;
        $fechaInicioStr = $fechaInicio instanceof Carbon ? $fechaInicio->toDateString() : $fechaInicio;
        $fechaFinStr = $fechaFin instanceof Carbon ? $fechaFin->toDateString() : ($fechaFin ?? $fechaInicioStr);
        if (! $fechaInicioStr) return;

        try {
            $query = DB::connection('san')
                ->table('aplicaciones.pro_eventos_asistencia')
                ->where('anacod', $anacod)
                ->whereBetween(DB::raw('DATE(fecha)'), [$fechaInicioStr, $fechaFinStr])
                ->whereIn('evento', ['Tarde', 'Ausencia', 'Salida antes'])
                ->whereNull('accion_personal');

            $this->aplicarFiltroHora($query, $horaInicio, $horaFin);

            $query->update(['accion_personal' => $tipoNombre]);
        } catch (\Throwable $e) {
            Log::warning('Error al llenar eventos en rango', [
                'anacod' => $anacod,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function aplicarFiltroHora($query, ?string $horaInicio, ?string $horaFin): void
    {
        if (! $horaInicio || ! $horaFin) return;
        [$hI, $mI] = explode(':', substr($horaInicio, 0, 5));
        [$hF, $mF] = explode(':', substr($horaFin, 0, 5));
        $tsIni = ((int) $hI) * 60 + (int) $mI;
        $tsFin = ((int) $hF) * 60 + (int) $mF;
        $query->whereRaw(
            '(EXTRACT(HOUR FROM fecha) * 60 + EXTRACT(MINUTE FROM fecha)) BETWEEN ? AND ?',
            [$tsIni, $tsFin]
        );
    }

    public function index(Request $request, string $anacod): Response
    {
        $this->ensureEmpleadoExists($anacod);

        $filters = $request->validate([
            'tipo_id' => 'nullable|integer|exists:empleado_accion_tipos,id',
            'estado' => 'nullable|in:aprobado,cancelado',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $query = EmpleadoAccion::with('tipo')
            ->where('anacod', $anacod)
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id');

        $this->applyFilters($query, $filters);
        $acciones = $query->paginate(15)->withQueryString();
        $empleado = Empleado::where('anacod', $anacod)->first();

        return Inertia::render('Empleados/Acciones/Index', [
            'anacod' => $anacod,
            'empleado' => $empleado,
            'acciones' => $acciones,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
            'filters' => $filters,
        ]);
    }

    public function create(string $anacod): Response
    {
        $this->ensureEmpleadoExists($anacod);
        $empleado = Empleado::where('anacod', $anacod)->first();
        return Inertia::render('Empleados/Acciones/Create', [
            'anacod' => $anacod,
            'empleado' => $empleado,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request, string $anacod): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        $data = $this->validatePayload($request, false);
        $this->persist($request, $data, $anacod);

        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción registrada correctamente.');
    }

    public function edit(string $anacod, EmpleadoAccion $accion): Response
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $accion->load('archivos');
        $empleado = Empleado::where('anacod', $anacod)->first();
        return Inertia::render('Empleados/Acciones/Edit', [
            'anacod' => $anacod,
            'empleado' => $empleado,
            'accion' => $accion,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function update(Request $request, string $anacod, EmpleadoAccion $accion): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $data = $this->validatePayload($request, false);
        $this->persist($request, $data, $anacod, $accion);

        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción actualizada.');
    }

    public function destroy(string $anacod, EmpleadoAccion $accion): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $this->destroyAccion($accion);
        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción eliminada.');
    }

    public function cancel(Request $request, string $anacod, EmpleadoAccion $accion): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod) {
            abort(404);
        }
        $this->cancelAccion($request, $accion);
        return redirect()->route('empleados.acciones.index', ['anacod' => $anacod])
            ->with('success', 'Acción cancelada.');
    }

    public function downloadArchivo(string $anacod, EmpleadoAccion $accion, EmpleadoAccionArchivo $archivo)
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod || $archivo->empleado_accion_id !== $accion->id) {
            abort(404);
        }
        return Storage::disk('public')->download($archivo->path, $archivo->nombre_original);
    }

    public function destroyArchivo(string $anacod, EmpleadoAccion $accion, EmpleadoAccionArchivo $archivo): RedirectResponse
    {
        $this->ensureEmpleadoExists($anacod);
        if ($accion->anacod !== $anacod || $archivo->empleado_accion_id !== $accion->id) {
            abort(404);
        }
        Storage::disk('public')->delete($archivo->path);
        $archivo->delete();
        return back()->with('success', 'Archivo eliminado.');
    }

    public function globalIndex(Request $request): Response
    {
        $filters = $request->validate([
            'anacod' => 'nullable|string|max:50',
            'tipo_id' => 'nullable|integer|exists:empleado_accion_tipos,id',
            'estado' => 'nullable|in:aprobado,cancelado',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        $query = EmpleadoAccion::with('tipo')
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id');

        if (! empty($filters['anacod'])) {
            $this->ensureEmpleadoExists($filters['anacod']);
            $query->where('anacod', $filters['anacod']);
        }
        $this->applyFilters($query, $filters);

        $acciones = $query->paginate(20)->withQueryString();

        $anacods = collect($acciones->items())->pluck('anacod')->unique()->all();
        $empleados = Empleado::whereIn('anacod', $anacods)->get()->keyBy('anacod');
        $acciones->setCollection(
            collect($acciones->items())->map(function ($a) use ($empleados) {
                $a->empleado = $empleados->get($a->anacod);
                return $a;
            })
        );

        return Inertia::render('Empleados/Acciones/GlobalIndex', [
            'acciones' => $acciones,
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
            'filters' => $filters,
        ]);
    }

    public function globalCreate(): Response
    {
        $empleadosActivos = $this->empleadosActivos();
        return Inertia::render('Empleados/Acciones/GlobalCreate', [
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
            'empleadosActivos' => $empleadosActivos,
        ]);
    }

    public function globalStore(Request $request): RedirectResponse
    {
        $data = $this->validatePayload($request, true);
        $this->ensureEmpleadoExists($data['anacod']);
        $this->persist($request, $data, $data['anacod']);

        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción registrada correctamente.');
    }

    public function globalEdit(EmpleadoAccion $accion): Response
    {
        $accion->load('archivos');
        $empleado = Empleado::where('anacod', $accion->anacod)->first();
        return Inertia::render('Empleados/Acciones/GlobalEdit', [
            'accion' => $accion,
            'empleado' => $empleado,
            'empleadosActivos' => $this->empleadosActivos(),
            'tipos' => EmpleadoAccionTipo::where('activo', true)->orderBy('nombre')->get(),
        ]);
    }

    public function globalUpdate(Request $request, EmpleadoAccion $accion): RedirectResponse
    {
        $data = $this->validatePayload($request, true);
        $this->ensureEmpleadoExists($data['anacod']);
        if ($data['anacod'] !== $accion->anacod) {
            abort(400, 'No se puede reasignar el empleado de una acción existente.');
        }
        $this->persist($request, $data, $data['anacod'], $accion);

        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción actualizada.');
    }

    public function globalDestroy(EmpleadoAccion $accion): RedirectResponse
    {
        $this->destroyAccion($accion);
        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción eliminada.');
    }

    public function globalCancel(Request $request, EmpleadoAccion $accion): RedirectResponse
    {
        $this->cancelAccion($request, $accion);
        return redirect()->route('empleados.acciones.global.index')
            ->with('success', 'Acción cancelada.');
    }

    protected function applyFilters($query, array $filters): void
    {
        if (! empty($filters['tipo_id'])) {
            $query->where('tipo_id', $filters['tipo_id']);
        }
        if (! empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }
        if (! empty($filters['fecha_desde'])) {
            $query->where('fecha_inicio', '>=', $filters['fecha_desde']);
        }
        if (! empty($filters['fecha_hasta'])) {
            $query->where('fecha_inicio', '<=', $filters['fecha_hasta']);
        }
    }

    protected function empleadosActivos(): array
    {
        return DB::connection('san')
            ->table('aplicaciones.pro_anacod')
            ->select('anacod', 'ananam')
            ->where('anasta', 'A')
            ->where('anatip', 'U')
            ->orderBy('anacod')
            ->get()
            ->map(fn ($e) => ['anacod' => (string) $e->anacod, 'ananam' => (string) $e->ananam])
            ->all();
    }

    protected function destroyAccion(EmpleadoAccion $accion): void
    {
        $this->limpiarEventosEnRango(
            $accion->anacod,
            $accion->fecha_inicio,
            $accion->fecha_fin,
            $accion->hora_inicio ? substr($accion->hora_inicio, 0, 5) : null,
            $accion->hora_fin ? substr($accion->hora_fin, 0, 5) : null
        );
        foreach ($accion->archivos()->get() as $archivo) {
            Storage::disk('public')->delete($archivo->path);
        }
        $accion->delete();
    }

    protected function cancelAccion(Request $request, EmpleadoAccion $accion): void
    {
        $this->limpiarEventosEnRango(
            $accion->anacod,
            $accion->fecha_inicio,
            $accion->fecha_fin,
            $accion->hora_inicio ? substr($accion->hora_inicio, 0, 5) : null,
            $accion->hora_fin ? substr($accion->hora_fin, 0, 5) : null
        );
        $data = $request->validate([
            'observaciones' => 'nullable|string|max:1000',
        ]);
        $accion->update([
            'estado' => 'cancelado',
            'observaciones' => $data['observaciones'] ?? $accion->observaciones,
            'updated_by' => Auth::id(),
        ]);
    }

    protected function storeArchivos(Request $request, EmpleadoAccion $accion): void
    {
        if (! $request->hasFile('archivos')) {
            return;
        }
        foreach ($request->file('archivos') as $file) {
            if (! $file || ! $file->isValid()) {
                continue;
            }
            $path = $file->store(
                "acciones/{$accion->anacod}/{$accion->id}",
                'public'
            );
            EmpleadoAccionArchivo::create([
                'empleado_accion_id' => $accion->id,
                'path' => $path,
                'nombre_original' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'tamano' => $file->getSize(),
                'uploaded_by' => Auth::id(),
            ]);
        }
    }
}
