import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import BackEmpleados from "./components/BackEmpleados";
import Nav from "./Partials/Nav";
import PresupuestosUserSection from "./Partials/PresupuestosUserSection";

function PresupestoPage({
    auth,
    empleado,
    presupuesto = null,
    presupuestoRemote = null,
    presupuestoRemoteChecked = false,
    presupuestoRemoteError = null,
    presupuestosCentrosCosto = [],
    presupuestosCuentas = [],
    presupuestosWarning = null,
}) {
    const [editing, setEditing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [presupuestosCcCuentas, setPresupuestosCcCuentas] = useState(() => {
        const remote = Array.isArray(presupuestoRemote?.cc_cuentas) ? presupuestoRemote.cc_cuentas : null;
        const local = Array.isArray(presupuesto?.cc_cuentas) ? presupuesto.cc_cuentas : null;
        return (remote && remote.length > 0) ? remote : (local || []);
    });
    const [errors, setErrors] = useState({});

    const found = presupuestoRemoteChecked && presupuestoRemote && presupuestoRemote.id;
    const notFound = presupuestoRemoteChecked && !presupuestoRemote;
    const remoteRoles = Array.isArray(presupuestoRemote?.roles) ? presupuestoRemote.roles : [];
    const remoteCcCuentas = Array.isArray(presupuestoRemote?.cc_cuentas) ? presupuestoRemote.cc_cuentas : [];
    const isError = presupuesto?.sync_status === "error";
    const hasEmailConflict = presupuesto?.hasEmailConflict;

    const ccById = new Map((presupuestosCentrosCosto || []).map((c) => [c.id, c]));
    const cuentasById = new Map((presupuestosCuentas || []).map((c) => [c.id, c]));

    const groupedByCc = (() => {
        const map = new Map();
        for (const row of remoteCcCuentas) {
            if (!map.has(row.centro_costo_id)) map.set(row.centro_costo_id, []);
            map.get(row.centro_costo_id).push(row);
        }
        const result = Array.from(map.entries()).map(([ccId, rows]) => ({
            ccId,
            cc: ccById.get(ccId),
            rows,
        }));
        result.sort((a, b) => {
            const ca = a.cc?.codigo || "";
            const cb = b.cc?.codigo || "";
            return ca.localeCompare(cb);
        });
        return result;
    })();

    const [expandedCcs, setExpandedCcs] = useState(() => new Set());
    const toggleExpanded = (ccId) => {
        setExpandedCcs((current) => {
            const next = new Set(current);
            if (next.has(ccId)) next.delete(ccId);
            else next.add(ccId);
            return next;
        });
    };

    const handleSaveEdit = () => {
        if (!presupuestoRemote?.id) return;
        router.patch(
            route("empleados.update", { anacod: empleado.anacod }),
            { presupuestos_cc_cuentas: presupuestosCcCuentas },
            {
                preserveState: false,
                onError: (errs) => setErrors(errs),
                onSuccess: () => {
                    setEditing(false);
                    setErrors({});
                },
            }
        );
    };

    const handleCreate = () => {
        router.post(
            route("empleados.presupuesto.retry", { anacod: empleado.anacod }),
            { presupuestos_cc_cuentas: presupuestosCcCuentas },
            {
                preserveState: false,
                onError: (errs) => setErrors(errs),
                onSuccess: () => {
                    setCreating(false);
                    setErrors({});
                },
            }
        );
    };

    const handleRetry = () => {
        const ccCuentas = (presupuesto?.cc_cuentas && presupuesto.cc_cuentas.length > 0)
            ? presupuesto.cc_cuentas
            : presupuestosCcCuentas;
        if (!ccCuentas || ccCuentas.length === 0) {
            setErrors({ presupuesto: ["No hay combinaciones cc/cuenta para reintentar. Edite y agregue al menos una."] });
            return;
        }
        router.post(
            route("empleados.presupuesto.retry", { anacod: empleado.anacod }),
            { presupuestos_cc_cuentas: ccCuentas },
            { preserveState: false }
        );
    };

    const handleLink = () => {
        router.post(
            route("empleados.presupuesto.link", { anacod: empleado.anacod }),
            {},
            { preserveState: false }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <BackEmpleados />
                    <Nav user={empleado} />
                    <div> </div>
                </div>
            }
        >
            <Head title={`Presupuestos - ${empleado.anacod}`} />

            <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
                        <p className="text-sm text-gray-500">
                            Empleado <span className="font-mono">{empleado.anacod}</span> · {empleado.ananam}
                        </p>
                    </div>
                    {presupuestoRemoteChecked && (
                        <span
                            className={
                                "px-3 py-1 rounded-full text-xs font-semibold " +
                                (found
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-700")
                            }
                        >
                            {found ? "Activo en Presupuestos" : "No existe en Presupuestos"}
                        </span>
                    )}
                </div>

                {presupuestosWarning && (
                    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                        {presupuestosWarning}
                    </div>
                )}

                {!presupuestoRemoteChecked && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                        Verificando en Presupuestos…
                    </div>
                )}

                {presupuestoRemoteError && presupuestoRemoteChecked && (
                    <div className="p-3 bg-red-50 border border-red-300 rounded">
                        <p className="text-sm text-red-800 font-semibold">No se pudo consultar Presupuestos:</p>
                        <p className="text-sm text-red-700">{presupuestoRemoteError}</p>
                        <a
                            href={route("empleados.presupuesto", { anacod: empleado.anacod })}
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                            Reintentar verificación
                        </a>
                    </div>
                )}

                {isError && presupuesto.last_error && (
                    <div className="p-4 bg-red-50 border border-red-300 rounded">
                        <p className="text-sm text-red-800 font-semibold">Último error de sincronización local:</p>
                        <p className="text-sm text-red-700">{presupuesto.last_error}</p>
                        {presupuesto.last_synced_at && (
                            <p className="text-xs text-red-600 mt-1">
                                Último intento: {new Date(presupuesto.last_synced_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {found && (
                    <>
                        <div className="p-4 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800 font-semibold mb-1">
                                Cuenta creada en Presupuestos.
                            </p>
                            <p className="text-sm text-gray-700">
                                ID <span className="font-mono">{presupuestoRemote.id}</span>
                                {presupuestoRemote.email && (
                                    <span> · Email <span className="font-mono">{presupuestoRemote.email}</span></span>
                                )}
                                {presupuestoRemote.code && (
                                    <span> · Code <span className="font-mono">{presupuestoRemote.code}</span></span>
                                )}
                            </p>
                            {remoteRoles.length > 0 && (
                                <p className="text-sm text-gray-700 mt-1">
                                    Rol: <span className="font-semibold">{remoteRoles.map((r) => r.name).join(", ")}</span>
                                </p>
                            )}
                            {presupuestoRemote.is_active === false && (
                                <p className="text-xs text-red-700 italic mt-1">
                                    Usuario inactivo en Presupuestos.
                                </p>
                            )}
                        </div>

                        <div className="p-4 border border-gray-200 rounded">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                Asignaciones
                                {remoteCcCuentas.length > 0 && (
                                    <span className="ml-2 text-xs text-gray-500 font-normal">
                                        ({remoteCcCuentas.length} {remoteCcCuentas.length === 1 ? "cuenta" : "cuentas"} en {groupedByCc.length} {groupedByCc.length === 1 ? "centro de costo" : "centros de costo"})
                                    </span>
                                )}
                            </p>
                            {remoteCcCuentas.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Sin asignaciones cc/cuenta.</p>
                            ) : (
                                <div className="space-y-2">
                                    {groupedByCc.map((group) => {
                                        const isExpanded = expandedCcs.has(group.ccId);
                                        const ccInactivo = group.cc && group.cc.activo === false;
                                        return (
                                            <div key={group.ccId} className="border border-gray-200 rounded overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpanded(group.ccId)}
                                                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-2 text-left"
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-gray-500">{isExpanded ? "▼" : "▶"}</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {group.cc ? `${group.cc.codigo} — ${group.cc.nombre}` : `CC #${group.ccId}`}
                                                        </span>
                                                        {ccInactivo && (
                                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                                                                Inactivo
                                                            </span>
                                                        )}
                                                        <span
                                                            className={
                                                                "ml-2 px-2 py-0.5 text-xs rounded-full " +
                                                                (group.rows.length > 0
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-gray-200 text-gray-600")
                                                            }
                                                        >
                                                            {group.rows.length} {group.rows.length === 1 ? "cuenta" : "cuentas"}
                                                        </span>
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <ul className="p-3 space-y-1 bg-white">
                                                        {group.rows.map((row, idx) => {
                                                            const cuenta = cuentasById.get(row.cuenta_id);
                                                            const cuentaInactiva = cuenta && cuenta.activo === false;
                                                            const vigenteHasta = row.vigente_hasta ? new Date(row.vigente_hasta) : null;
                                                            const isVencida = row.is_currently_active === false;
                                                            return (
                                                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                                    <span>
                                                                        {cuenta
                                                                            ? `${cuenta.codigo} — ${cuenta.nombre}`
                                                                            : `Cuenta #${row.cuenta_id}`}
                                                                    </span>
                                                                    {cuentaInactiva && (
                                                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                                                                            Inactiva
                                                                        </span>
                                                                    )}
                                                                    {row.is_aprobador && (
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                                            Aprobador
                                                                        </span>
                                                                    )}
                                                                    {vigenteHasta && (
                                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                                                            Hasta {vigenteHasta.toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                    {isVencida && (
                                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                                                            Vencida
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {!editing ? (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    Editar asignaciones
                                </button>
                            </div>
                        ) : (
                            <>
                                <PresupuestosUserSection
                                    mode="edit"
                                    anacod={empleado.anacod}
                                    centrosCosto={presupuestosCentrosCosto}
                                    cuentas={presupuestosCuentas}
                                    value={presupuestosCcCuentas}
                                    onChange={setPresupuestosCcCuentas}
                                    errors={errors}
                                    warning={null}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => { setEditing(false); setErrors({}); }}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={presupuestosCcCuentas.length === 0}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {notFound && (
                    <div className="p-5 border border-gray-200 rounded-lg">
                        <p className="text-gray-700 mb-3">
                            No existe un usuario en Presupuestos con code <span className="font-mono">{empleado.anacod}</span>.
                        </p>
                        {!creating ? (
                            <button
                                onClick={() => setCreating(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Crear ahora
                            </button>
                        ) : (
                            <div>
                                <PresupuestosUserSection
                                    mode="create"
                                    anacod={empleado.anacod}
                                    centrosCosto={presupuestosCentrosCosto}
                                    cuentas={presupuestosCuentas}
                                    value={presupuestosCcCuentas}
                                    onChange={setPresupuestosCcCuentas}
                                    errors={errors}
                                    warning={null}
                                    enabled={creating}
                                    onEnabledChange={() => {}}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => { setCreating(false); setErrors({}); }}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={presupuestosCcCuentas.length === 0}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                                    >
                                        Guardar y crear
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {found && isError && hasEmailConflict && (
                    <div className="p-3 border-2 border-blue-300 bg-blue-50 rounded">
                        <p className="text-sm text-gray-800 font-semibold mb-1">
                            Hay un registro local con error de email, pero el usuario sí existe en Red.
                        </p>
                        <p className="text-xs text-gray-700 mb-2">
                            Puede vincular para actualizar la referencia local.
                        </p>
                        <button
                            onClick={handleLink}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Vincular referencia local
                        </button>
                    </div>
                )}

                {found && isError && !hasEmailConflict && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Reintentar sincronización
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

export default PresupestoPage;
