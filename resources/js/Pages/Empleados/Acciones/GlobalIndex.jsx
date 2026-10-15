import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AccionTable from "./Components/AccionTable";

export default function GlobalIndex({ auth, acciones, tipos, filters }) {
    const [search, setSearch] = useState(filters || {});

    const applyFilters = (e) => {
        e?.preventDefault?.();
        router.get(route("empleados.acciones.global.index"), search, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch({});
        router.get(route("empleados.acciones.global.index"), {}, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <h1 className="text-lg font-semibold">Acciones de personal</h1>
                </div>
            }
        >
            <Head title="Acciones de personal" />

            <div className="max-w-7xl mx-auto mt-8 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Acciones de personal</h1>
                        <p className="text-sm text-gray-500">Listado global de todas las acciones registradas.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route("admin.accion-tipos.index")}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                            Administrar tipos
                        </Link>
                        <Link
                            href={route("empleados.acciones.global.create")}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Nueva acción
                        </Link>
                    </div>
                </div>

                <form
                    onSubmit={applyFilters}
                    className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
                >
                    <div>
                        <label className="text-stone-600 text-sm font-medium">Empleado (anacod)</label>
                        <input
                            type="text"
                            value={search.anacod || ""}
                            onChange={(e) => setSearch({ ...search, anacod: e.target.value })}
                            placeholder="OBENAVIDES"
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        />
                    </div>
                    <div>
                        <label className="text-stone-600 text-sm font-medium">Tipo</label>
                        <select
                            value={search.tipo_id || ""}
                            onChange={(e) => setSearch({ ...search, tipo_id: e.target.value })}
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        >
                            <option value="">Todos</option>
                            {tipos.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-stone-600 text-sm font-medium">Estado</label>
                        <select
                            value={search.estado || ""}
                            onChange={(e) => setSearch({ ...search, estado: e.target.value })}
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        >
                            <option value="">Todos</option>
                            <option value="aprobado">Aprobado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-stone-600 text-sm font-medium">Desde</label>
                        <input
                            type="date"
                            value={search.fecha_desde || ""}
                            onChange={(e) => setSearch({ ...search, fecha_desde: e.target.value })}
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        />
                    </div>
                    <div>
                        <label className="text-stone-600 text-sm font-medium">Hasta</label>
                        <input
                            type="date"
                            value={search.fecha_hasta || ""}
                            onChange={(e) => setSearch({ ...search, fecha_hasta: e.target.value })}
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
                        >
                            Filtrar
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                            Limpiar
                        </button>
                    </div>
                </form>

                <AccionTable
                    acciones={acciones}
                    scope="global"
                    showEmpleado={true}
                    emptyMessage="No hay acciones registradas en el sistema."
                />
            </div>
        </AuthenticatedLayout>
    );
}
