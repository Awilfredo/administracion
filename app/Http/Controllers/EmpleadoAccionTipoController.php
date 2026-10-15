<?php

namespace App\Http\Controllers;

use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionTipo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmpleadoAccionTipoController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));

        $query = EmpleadoAccionTipo::query();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%");
            });
        }

        $tipos = $query->orderBy('nombre')->paginate(25)->withQueryString();

        $counts = EmpleadoAccion::query()
            ->select('tipo_id', DB::raw('count(*) as total'))
            ->groupBy('tipo_id')
            ->pluck('total', 'tipo_id')
            ->all();

        return Inertia::render('Empleados/Acciones/Tipos/Index', [
            'tipos' => $tipos,
            'counts' => $counts,
            'search' => $search,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Empleados/Acciones/Tipos/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50|unique:empleado_accion_tipos,codigo',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:1000',
            'requiere_adjunto' => 'sometimes|boolean',
            'activo' => 'sometimes|boolean',
        ]);

        $data['requiere_adjunto'] = (bool) ($data['requiere_adjunto'] ?? false);
        $data['activo'] = (bool) ($data['activo'] ?? true);

        EmpleadoAccionTipo::create($data);

        return redirect()
            ->route('admin.accion-tipos.index')
            ->with('success', 'Tipo creado correctamente.');
    }

    public function edit(EmpleadoAccionTipo $tipo): Response
    {
        return Inertia::render('Empleados/Acciones/Tipos/Edit', [
            'tipo' => $tipo,
        ]);
    }

    public function update(Request $request, EmpleadoAccionTipo $tipo): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => 'required|string|max:50|unique:empleado_accion_tipos,codigo,' . $tipo->id,
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:1000',
            'requiere_adjunto' => 'sometimes|boolean',
            'activo' => 'sometimes|boolean',
        ]);

        $data['requiere_adjunto'] = (bool) ($data['requiere_adjunto'] ?? false);
        $data['activo'] = (bool) ($data['activo'] ?? false);

        $tipo->update($data);

        return redirect()
            ->route('admin.accion-tipos.index')
            ->with('success', 'Tipo actualizado.');
    }

    public function destroy(EmpleadoAccionTipo $tipo): RedirectResponse
    {
        $tipo->update(['activo' => false]);

        return redirect()
            ->route('admin.accion-tipos.index')
            ->with('success', 'Tipo desactivado.');
    }
}
