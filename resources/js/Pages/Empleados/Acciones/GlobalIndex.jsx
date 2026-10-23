import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { HiOutlineChartBar, HiOutlineClipboardList } from "react-icons/hi";
import AccionTable from "./Components/AccionTable";
import AccionesDashboard from "./Components/AccionesDashboard";

export default function GlobalIndex({ auth, acciones, tipos, filters, dashboard }) {
    const [search, setSearch] = useState(filters || {});
    const [tabActiva, setTabActiva] = useState("listado");

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

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (search.anacod) params.set('anacod', search.anacod);
        if (search.tipo_id) params.set('tipo_id', search.tipo_id);
        if (search.estado) params.set('estado', search.estado);
        if (search.fecha_desde) params.set('fecha_desde', search.fecha_desde);
        if (search.fecha_hasta) params.set('fecha_hasta', search.fecha_hasta);
        const qs = params.toString();
        return route("empleados.acciones.global.export") + (qs ? '?' + qs : '');
    };
    void exportUrl;

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
                        <p className="text-sm text-gray-500">
                            {tabActiva === "listado"
                                ? "Listado global de todas las acciones registradas."
                                : "Indicadores y estadísticas de las acciones de personal."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={exportUrl()}
                            data-test="export-csv-btn"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                            download
                        >
                            Exportar Excel
                        </a>
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

                <div className="sticky top-16 z-10 bg-white border-b shadow-sm -mx-6 px-6 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setTabActiva("listado")}
                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                tabActiva === "listado"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <HiOutlineClipboardList className="w-4 h-4" />
                            Listado
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                    tabActiva === "listado"
                                        ? "bg-white/20 text-white"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                            >
                                {acciones?.total ?? 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabActiva("dashboard")}
                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                tabActiva === "dashboard"
                                    ? "bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <HiOutlineChartBar className="w-4 h-4" />
                            Dashboard
                        </button>
                    </div>
                </div>

                {tabActiva === "listado" && (
                    <>
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
                    </>
                )}

                {tabActiva === "dashboard" && (
                    <AccionesDashboard
                        activo={tabActiva === "dashboard"}
                        datosIniciales={dashboard ?? null}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
