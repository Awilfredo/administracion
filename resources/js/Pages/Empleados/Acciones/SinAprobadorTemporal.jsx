import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { apiFetch } from "@/Helpers/apiFetch";
import { showAprobadorSummary } from "@/Helpers/aprobadorSummary";
import AprobadorTemporalModal from "@/Components/AprobadorTemporalModal";

const { formatDate } = ManejoFechas();

export default function SinAprobadorTemporal({ auth, acciones = [], aprobadoresPorEmpleado = {}, filters = {}, today = '' }) {

    const calcularEstadoTemporal = (accion) => {
        if (!today) return { label: '', cls: '' };
        const inicio = accion.fecha_inicio?.substring?.(0, 10) ?? accion.fecha_inicio;
        const fin = accion.fecha_fin?.substring?.(0, 10) ?? accion.fecha_inicio;
        if (inicio <= today && (fin >= today || !accion.fecha_fin)) {
            return { label: '🟢 En curso', cls: 'bg-green-100 text-green-800' };
        }
        if (inicio > today) {
            return { label: '🟡 Próxima', cls: 'bg-yellow-100 text-yellow-800' };
        }
        return { label: '🔵 Reciente', cls: 'bg-blue-100 text-blue-800' };
    };
    const [search, setSearch] = useState(filters || {});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [selectedAccion, setSelectedAccion] = useState(null);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const skipAprobadorRef = useRef(false);

    const applyFilters = (e) => {
        e?.preventDefault?.();
        router.get(route("empleados.acciones.sin-aprobador-temporal"), search, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch({});
        router.get(route("empleados.acciones.sin-aprobador-temporal"), {}, { preserveState: true });
    };

    const handleAsignar = (accion) => {
        skipAprobadorRef.current = false;
        setSelectedAccion(accion);
        setSelectedEmpleado({ anacod: accion.anacod, ananam: accion.anacod });
        setModalOpen(true);
    };

    const handleOmitir = async (accion) => {
        if (!confirm(`¿Marcar la acción #${accion.id} de ${accion.anacod} como "no requiere aprobador temporal"?`)) {
            return;
        }
        try {
            await apiFetch(
                route("empleados.acciones.skip-aprobador-temporal"),
                {
                    method: "POST",
                    body: {
                        anacod: accion.anacod,
                        fecha_desde: accion.fecha_inicio,
                        fecha_hasta: accion.fecha_fin || accion.fecha_inicio,
                        accion_personal_id: accion.id,
                    },
                }
            );
            alert("Acción marcada como omitida. Se recargará la lista.");
            router.reload();
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    const handleModalConfirm = async (form) => {
        setModalLoading(true);
        setModalError(null);
        try {
            const result = await apiFetch(
                route("empleados.acciones.asignar-aprobador-temporal"),
                {
                    method: "POST",
                    body: {
                        ...form,
                        anacod: selectedAccion.anacod,
                        accion_personal_id: selectedAccion.id,
                    },
                }
            );
            setModalOpen(false);
            setModalLoading(false);
            await showAprobadorSummary(result);
            router.reload();
        } catch (e) {
            setModalError(e.message || "Error al asignar aprobador temporal.");
            setModalLoading(false);
        }
    };

    const handleModalSkip = async (form) => {
        setModalLoading(true);
        setModalError(null);
        try {
            await apiFetch(
                route("empleados.acciones.skip-aprobador-temporal"),
                {
                    method: "POST",
                    body: {
                        ...form,
                        anacod: selectedAccion.anacod,
                        accion_personal_id: selectedAccion.id,
                    },
                }
            );
            skipAprobadorRef.current = true;
            setModalOpen(false);
            setModalLoading(false);
            router.reload();
        } catch (e) {
            setModalError(e.message || "Error al omitir aprobador temporal.");
            setModalLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <h1 className="text-lg font-semibold">Acciones sin aprobador temporal</h1>
                </div>
            }
        >
            <Head title="Acciones sin aprobador temporal" />

            <div className="max-w-7xl mx-auto mt-8 p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Acciones sin aprobador temporal</h1>
                    <p className="text-sm text-gray-500">
                        Acciones de personal aprobadas, vigentes o próximas, donde el empleado es aprobador de cc/cuentas en Red pero aún no se le asignó un aprobador temporal.
                    </p>
                </div>

                <form
                    onSubmit={applyFilters}
                    className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
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
                        <label className="text-stone-600 text-sm font-medium">Origen</label>
                        <select
                            value={search.origen || ""}
                            onChange={(e) => setSearch({ ...search, origen: e.target.value })}
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        >
                            <option value="">Todos</option>
                            <option value="manual">Manual</option>
                            <option value="sharepoint">SharePoint</option>
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

                {acciones.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-2 text-green-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">Sin acciones pendientes</p>
                        <p className="text-sm">Todas las acciones vigentes tienen aprobador temporal asignado.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3">Empleado</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Período</th>
                                        <th className="px-4 py-3">Estado temporal</th>
                                        <th className="px-4 py-3">Origen</th>
                                        <th className="px-4 py-3">cc/cuentas aprobador</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acciones.map((a) => {
                                        const ccCuentas = aprobadoresPorEmpleado[a.anacod] || [];
                                        const estadoTemp = calcularEstadoTemporal(a);
                                        return (
                                            <tr
                                                key={a.id}
                                                className="border-t border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2 font-mono text-xs">
                                                    <div className="font-semibold">{a.anacod}</div>
                                                </td>
                                                <td className="px-4 py-2 font-medium">{a.tipo?.nombre ?? '—'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    {formatDate(a.fecha_inicio)}
                                                    {a.fecha_fin ? (
                                                        <span className="text-gray-400 mx-1">→</span>
                                                    ) : null}
                                                    {a.fecha_fin ? formatDate(a.fecha_fin) : null}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${estadoTemp.cls}`}>
                                                        {estadoTemp.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {a.origen === 'sharepoint' ? (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                            📥 SharePoint
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Manual</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {ccCuentas.length === 0 ? (
                                                        <span className="text-xs text-gray-400 italic">
                                                            No es aprobador en Red
                                                        </span>
                                                    ) : (
                                                        <ul className="text-xs space-y-1">
                                                            {ccCuentas.slice(0, 3).map((c, i) => (
                                                                <li key={i} className="flex items-center gap-1">
                                                                    <span className="px-1 py-0.5 bg-blue-50 text-blue-700 font-mono rounded">
                                                                        {c.cc_codigo}
                                                                    </span>
                                                                    <span className="text-gray-400">→</span>
                                                                    <span className="px-1 py-0.5 bg-purple-50 text-purple-700 font-mono rounded">
                                                                        {c.cuenta_codigo}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                            {ccCuentas.length > 3 && (
                                                                <li className="text-gray-500 italic">
                                                                    +{ccCuentas.length - 3} más
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAsignar(a)}
                                                            disabled={ccCuentas.length === 0}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Asignar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOmitir(a)}
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                                                        >
                                                            Omitir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <AprobadorTemporalModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setModalError(null);
                }}
                onConfirm={handleModalConfirm}
                onSkip={handleModalSkip}
                empleado={selectedEmpleado}
                anacod={selectedAccion?.anacod ?? ''}
                ccCuentas={selectedAccion ? (aprobadoresPorEmpleado[selectedAccion.anacod] || []) : []}
                fechaInicioDefault={selectedAccion?.fecha_inicio?.substring?.(0, 10) ?? ''}
                fechaFinDefault={selectedAccion?.fecha_fin?.substring?.(0, 10) ?? selectedAccion?.fecha_inicio?.substring?.(0, 10) ?? ''}
                defaultIsTemporal={true}
                loading={modalLoading}
                error={modalError}
                searchUsersUrl={route("empleados.acciones.search-users")}
            />
        </AuthenticatedLayout>
    );
}