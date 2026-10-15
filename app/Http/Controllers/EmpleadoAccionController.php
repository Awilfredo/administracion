<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionArchivo;
use App\Models\EmpleadoAccionTipo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $data = $request->validate($rules);

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
            $data['updated_by'] = Auth::id();
            $existing->update($data);
            $accion = $existing;
        } else {
            $data['anacod'] = $anacod;
            $data['estado'] = 'aprobado';
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();
            $accion = EmpleadoAccion::create($data);
        }
        $this->storeArchivos($request, $accion);
        return $accion;
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
        foreach ($accion->archivos()->get() as $archivo) {
            Storage::disk('public')->delete($archivo->path);
        }
        $accion->delete();
    }

    protected function cancelAccion(Request $request, EmpleadoAccion $accion): void
    {
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
