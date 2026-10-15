import { useEffect, useMemo, useState } from "react";
import TextInput from "./TextInput";

function toRow(r) {
    return {
        cc_id: r.centro_costo_id,
        cuenta_id: r.cuenta_id,
        is_aprobador: !!r.is_aprobador,
        aprobador_temporal: !!r.aprobador_temporal,
        vigente_hasta: r.vigente_hasta || null,
    };
}

function fromRow(r) {
    const out = {
        centro_costo_id: parseInt(r.cc_id, 10) || 0,
        cuenta_id: parseInt(r.cuenta_id, 10) || 0,
        is_aprobador: !!r.is_aprobador,
    };
    if (r.aprobador_temporal) out.aprobador_temporal = true;
    if (r.vigente_hasta) out.vigente_hasta = r.vigente_hasta;
    return out;
}

export default function PresupuestosUserSection({
    mode = "create",
    anacod = "",
    centrosCosto = [],
    cuentas = [],
    value = [],
    onChange,
    errors = {},
    warning = null,
    disabled = false,
    enabled: enabledProp,
    onEnabledChange,
}) {
    const isEdit = mode === "edit";
    const isControlled = onEnabledChange != null;
    const [internalEnabled, setInternalEnabled] = useState(isEdit || value.length > 0);
    const enabled = isControlled ? !!enabledProp : internalEnabled;
    const setEnabled = (v) => {
        if (isControlled) {
            onEnabledChange(v);
        } else {
            setInternalEnabled(v);
        }
    };
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(() => {
        const init = {};
        centrosCosto.forEach((c) => {
            const hasSelection = (value || []).some((r) => r.centro_costo_id === c.id);
            init[c.id] = hasSelection;
        });
        return init;
    });
    const [rows, setRows] = useState(() => (value || []).map(toRow));

    useEffect(() => {
        if (!enabled) {
            onChange?.([]);
            return;
        }
        const cleaned = rows
            .filter((r) => r.cc_id && r.cuenta_id)
            .map(fromRow);
        onChange?.(cleaned);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, rows]);

    useEffect(() => {
        const valueKey = JSON.stringify(value || []);
        const rowsKey = JSON.stringify(rows);
        if (valueKey !== rowsKey && (value || []).length === 0) {
            setRows([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(value || [])]);

    useEffect(() => {
        if (isEdit) return;
        if (centrosCosto.length === 0) return;
        setExpanded((current) => {
            const next = { ...current };
            let changed = false;
            centrosCosto.forEach((c) => {
                if (!(c.id in next)) {
                    next[c.id] = false;
                    changed = true;
                }
            });
            return changed ? next : current;
        });
    }, [centrosCosto, isEdit]);

    const filteredCcs = useMemo(() => {
        const q = search.trim().toLowerCase();
        return centrosCosto.filter((c) => {
            if (!q) return true;
            return (
                (c.codigo || "").toLowerCase().includes(q) ||
                (c.nombre || "").toLowerCase().includes(q)
            );
        });
    }, [centrosCosto, search]);

    const rowsForCc = (ccId) => rows.filter((r) => r.cc_id === ccId);
    const cuentaIdsForCc = (ccId) => new Set(rowsForCc(ccId).map((r) => r.cuenta_id));
    const isCuentaSelected = (ccId, cuentaId) => cuentaIdsForCc(ccId).has(cuentaId);
    const getRow = (ccId, cuentaId) => rows.find((r) => r.cc_id === ccId && r.cuenta_id === cuentaId);
    const isAprobador = (ccId, cuentaId) => {
        const row = getRow(ccId, cuentaId);
        return row ? row.is_aprobador : false;
    };
    const isTemporal = (ccId, cuentaId) => {
        const row = getRow(ccId, cuentaId);
        return row ? !!row.aprobador_temporal : false;
    };
    const getVigenteHasta = (ccId, cuentaId) => {
        const row = getRow(ccId, cuentaId);
        return row?.vigente_hasta || "";
    };

    const toggleExpanded = (ccId) => {
        setExpanded((current) => ({ ...current, [ccId]: !current[ccId] }));
    };

    const toggleCuenta = (ccId, cuentaId, checked) => {
        setRows((current) => {
            if (checked) {
                if (current.some((r) => r.cc_id === ccId && r.cuenta_id === cuentaId)) {
                    return current;
                }
                return [...current, { cc_id: ccId, cuenta_id: cuentaId, is_aprobador: false, aprobador_temporal: false, vigente_hasta: null }];
            }
            return current.filter((r) => !(r.cc_id === ccId && r.cuenta_id === cuentaId));
        });
        if (checked) {
            setExpanded((current) => ({ ...current, [ccId]: true }));
        }
    };

    const updateRow = (ccId, cuentaId, patch) => {
        setRows((current) => {
            const next = [...current];
            const idx = next.findIndex((r) => r.cc_id === ccId && r.cuenta_id === cuentaId);
            if (idx === -1) return current;
            next[idx] = { ...next[idx], ...patch };
            return next;
        });
    };

    const toggleAprobador = (ccId, cuentaId, value) => {
        const patch = { is_aprobador: !!value };
        if (!value) {
            patch.aprobador_temporal = false;
            patch.vigente_hasta = null;
        }
        updateRow(ccId, cuentaId, patch);
    };

    const toggleTemporal = (ccId, cuentaId, value) => {
        const patch = { aprobador_temporal: !!value };
        if (!value) {
            patch.vigente_hasta = null;
        }
        updateRow(ccId, cuentaId, patch);
    };

    const setVigenteHasta = (ccId, cuentaId, value) => {
        updateRow(ccId, cuentaId, { vigente_hasta: value || null });
    };

    const fieldError = (key) => {
        if (!errors) return null;
        const candidates = [
            `presupuestos.cc_cuentas.${key}`,
            `presupuestos.cc_cuentas.*.${key}`,
            `cc_cuentas.${key}`,
            `cc_cuentas.*.${key}`,
        ];
        for (const c of candidates) {
            if (errors[c]) return errors[c];
        }
        return null;
    };
    const rootError = errors?.["presupuestos.cc_cuentas"] || errors?.cc_cuentas;

    const totalSelected = rows.length;

    return (
        <div className="bg-white p-5 mt-10 rounded-xl">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xl">Usuario en Presupuestos</p>
                    <hr className="h-1 my-3 bg-red-800" />
                </div>
                {!isEdit && (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            disabled={disabled}
                        />
                        Crear también usuario en Presupuestos
                    </label>
                )}
            </div>

            {warning && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                    {warning}
                </div>
            )}

            {enabled && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <TextInput
                            label={
                                <div>
                                    Código en Presupuestos
                                    <span className="text-gray-500 text-xs ml-1">(anacod)</span>
                                </div>
                            }
                            value={anacod}
                            disabled
                        />
                        <div className="flex items-end justify-end text-sm text-gray-600">
                            Total seleccionados: <span className="ml-1 font-semibold text-gray-800">{totalSelected}</span>
                        </div>
                    </div>

                    {rootError && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                            {Array.isArray(rootError) ? rootError[0] : rootError}
                        </div>
                    )}

                    <div className="mb-3 flex flex-col md:flex-row md:items-end gap-3">
                        <div className="md:flex-1">
                            <TextInput
                                label="Buscar centro de costo"
                                placeholder="Código o nombre…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-gray-600 md:pb-2">
                            Mostrando <span className="font-semibold text-gray-800">{filteredCcs.length}</span> de {centrosCosto.length}
                        </div>
                    </div>

                    {centrosCosto.length === 0 && (
                        <p className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded">
                            No hay centros de costo disponibles.
                        </p>
                    )}

                    {centrosCosto.length > 0 && filteredCcs.length === 0 && (
                        <p className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded">
                            Sin coincidencias para "{search}".
                        </p>
                    )}

                    <div
                        className="space-y-3 overflow-y-auto pr-2"
                        style={{ maxHeight: "60vh" }}
                    >
                        {filteredCcs.map((cc) => {
                            const ccId = cc.id;
                            const isExpanded = !!expanded[ccId];
                            const count = rowsForCc(ccId).length;
                            const hasSelection = count > 0;
                            return (
                                <div
                                    key={ccId}
                                    className="border border-gray-200 rounded-md overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleExpanded(ccId)}
                                        className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 text-left"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-gray-500">
                                                {isExpanded ? "▼" : "▶"}
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {cc.codigo} — {cc.nombre}
                                            </span>
                                            <span
                                                className={
                                                    "ml-2 px-2 py-0.5 text-xs rounded-full " +
                                                    (hasSelection
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-200 text-gray-600")
                                                }
                                            >
                                                {hasSelection
                                                    ? `Asignado (${count})`
                                                    : "Sin asignar"}
                                            </span>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="p-3 space-y-2 bg-white">
                                            {cuentas.length === 0 && (
                                                <p className="text-sm text-gray-500 italic">
                                                    No hay cuentas disponibles en el catálogo.
                                                </p>
                                            )}
                                            {cuentas.map((cuenta) => {
                                                const checked = isCuentaSelected(ccId, cuenta.id);
                                                const aprobador = isAprobador(ccId, cuenta.id);
                                                const temporal = isTemporal(ccId, cuenta.id);
                                                const vigenteHasta = getVigenteHasta(ccId, cuenta.id);
                                                const today = new Date().toISOString().split("T")[0];
                                                return (
                                                    <div
                                                        key={cuenta.id}
                                                        className="flex flex-col gap-1 pl-2 border-l-2 border-gray-100"
                                                    >
                                                        <label className="flex items-center gap-2 text-sm text-gray-800">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) =>
                                                                    toggleCuenta(
                                                                        ccId,
                                                                        cuenta.id,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                            />
                                                            <span>
                                                                {cuenta.codigo} — {cuenta.nombre}
                                                            </span>
                                                        </label>
                                                        {checked && (
                                                            <label className="flex items-center gap-2 text-xs text-gray-600 pl-6">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={aprobador}
                                                                    onChange={(e) =>
                                                                        toggleAprobador(
                                                                            ccId,
                                                                            cuenta.id,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                                Aprueba presupuesto
                                                            </label>
                                                        )}
                                                        {checked && aprobador && (
                                                            <label className="flex items-center gap-2 text-xs text-gray-600 pl-6">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={temporal}
                                                                    onChange={(e) =>
                                                                        toggleTemporal(
                                                                            ccId,
                                                                            cuenta.id,
                                                                            e.target.checked,
                                                                        )
                                                                    }
                                                                />
                                                                Aprobador temporal
                                                            </label>
                                                        )}
                                                        {checked && aprobador && temporal && (
                                                            <label className="flex items-center gap-2 text-xs text-gray-600 pl-10">
                                                                <span>Vigente hasta:</span>
                                                                <input
                                                                    type="date"
                                                                    min={today}
                                                                    value={vigenteHasta || ""}
                                                                    onChange={(e) =>
                                                                        setVigenteHasta(
                                                                            ccId,
                                                                            cuenta.id,
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {(fieldError("centro_costo_id") ||
                                                fieldError("cuenta_id")) && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {fieldError("centro_costo_id")?.[0] ||
                                                        fieldError("cuenta_id")?.[0]}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {!enabled && !isEdit && (
                <p className="text-sm text-gray-500 italic">
                    No se creará un usuario en Presupuestos para este empleado.
                </p>
            )}
        </div>
    );
}
