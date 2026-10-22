import { useEffect, useRef, useState } from "react";
import { getXsrfToken } from "@/Helpers/apiFetch";

function toIsoDate(value) {
    if (!value) return "";
    if (typeof value !== "string") return "";
    return value.length > 10 ? value.substring(0, 10) : value;
}

export default function AsignarAprobadorModal({
    open,
    onClose,
    onConfirm,
    empleado = null,
    anacod = "",
    ccCuentas = [],
    fechaInicioDefault = "",
    searchUsersUrl = "",
    copyFromUrl = "",
    loading = false,
    error = null,
}) {
    const [search, setSearch] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [tempUser, setTempUser] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [fechaDesde, setFechaDesde] = useState(toIsoDate(fechaInicioDefault));
    const [fechaHasta, setFechaHasta] = useState("");
    const [esPermanente, setEsPermanente] = useState(false);
    const [selectedCcCuentas, setSelectedCcCuentas] = useState(
        ccCuentas.map((c) => ({ ...c, selected: true }))
    );
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (open) {
            setFechaDesde(toIsoDate(fechaInicioDefault));
            setFechaHasta("");
            setEsPermanente(false);
            setTempUser(null);
            setSearch("");
            setUsuarios([]);
            setSelectedCcCuentas(ccCuentas.map((c) => ({ ...c, selected: true })));
        }
    }, [open, fechaInicioDefault]);

    useEffect(() => {
        if (open && ccCuentas.length > 0 && selectedCcCuentas.length === 0) {
            setSelectedCcCuentas(ccCuentas.map((c) => ({ ...c, selected: true })));
        }
    }, [open, ccCuentas]);

    useEffect(() => {
        if (!open || !searchUsersUrl) return;
        let cancelled = false;
        const t = setTimeout(() => {
            if (cancelled) return;
            setSearching(true);
            setSearchError(null);
            const url = new URL(searchUsersUrl, window.location.origin);
            if (search) url.searchParams.set("search", search);
            fetch(url.toString(), {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": getXsrfToken(),
                },
                credentials: "same-origin",
            })
                .then(async (r) => {
                    const json = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
                    return json;
                })
                .then((json) => {
                    if (cancelled) return;
                    setUsuarios(json.data || []);
                })
                .catch((e) => {
                    if (cancelled) return;
                    setSearchError(e.message);
                    setUsuarios([]);
                })
                .finally(() => {
                    if (!cancelled) setSearching(false);
                });
        }, 250);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [search, open, searchUsersUrl]);

    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        if (!tempUser) {
            setSearchError("Selecciona un aprobador.");
            return;
        }
        if (!fechaDesde) {
            setSearchError("La fecha desde es requerida.");
            return;
        }
        if (!esPermanente && !fechaHasta) {
            setSearchError("Para asignación temporal, la fecha hasta es requerida. Marca 'Es permanente' si no aplica.");
            return;
        }
        if (!esPermanente && fechaHasta < fechaDesde) {
            setSearchError("La fecha hasta debe ser mayor o igual a la fecha desde.");
            return;
        }
        const ccCuentasSeleccionadas = selectedCcCuentas
            .filter((c) => c.selected)
            .map((c) => ({ cc_id: c.cc_id, cuenta_id: c.cuenta_id }));

        if (ccCuentasSeleccionadas.length === 0) {
            setSearchError("Selecciona al menos una cc/cuenta.");
            return;
        }

        onConfirm?.({
            temp_user_id: tempUser.id,
            temp_user_email: tempUser.email,
            fecha_desde: fechaDesde,
            fecha_hasta: esPermanente ? null : fechaHasta,
            cc_cuentas: ccCuentasSeleccionadas,
            es_permanente: esPermanente,
            origen: "manual_admin",
        });
    };

    const handleCopyFrom = async (fromAnacod) => {
        if (!fromAnacod) return;
        if (!window.confirm(`¿Copiar las cc/cuentas aprobador de ${fromAnacod} a este empleado?`)) return;
        try {
            const url = copyFromUrl.replace('{fromAnacod}', fromAnacod);
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": getXsrfToken(),
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    temp_user_id: tempUser?.id,
                    temp_user_email: tempUser?.email,
                    fecha_desde: fechaDesde,
                    fecha_hasta: esPermanente ? null : fechaHasta,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
            window.alert(`Se copiaron ${json.asignaciones?.length || 0} cc/cuentas.`);
            onClose?.();
        } catch (e) {
            window.alert("Error: " + e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b bg-blue-50">
                    <h3 className="text-lg font-semibold text-blue-900">
                        Asignar aprobadores — {empleado?.ananam ?? anacod}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4">
                    <div ref={dropdownRef} className="relative">
                        <label className="text-sm font-medium text-gray-700">
                            Aprobador (destinatario)
                        </label>
                        <input
                            type="text"
                            value={tempUser ? `${tempUser.name} (${tempUser.email})` : search}
                            onChange={(e) => {
                                setTempUser(null);
                                setSearch(e.target.value);
                                setOpenDropdown(true);
                            }}
                            onFocus={() => setOpenDropdown(true)}
                            placeholder="Buscar por nombre, email o código…"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                            autoComplete="off"
                            disabled={loading}
                        />
                        {openDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                                {searching && <p className="p-2 text-sm text-gray-500 italic">Buscando…</p>}
                                {!searching && searchError && <p className="p-2 text-sm text-red-600">{searchError}</p>}
                                {!searching && !searchError && usuarios.length === 0 && (
                                    <p className="p-2 text-sm text-gray-500 italic">Sin resultados.</p>
                                )}
                                {!searching && !searchError && usuarios.map((u) => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => {
                                            setTempUser(u);
                                            setOpenDropdown(false);
                                            setSearch("");
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                                    >
                                        <p className="font-medium text-gray-800">
                                            {u.name}{" "}
                                            {u.code && (
                                                <span className="font-mono text-gray-500 text-xs">({u.code})</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Vigente desde
                            </label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={esPermanente}
                                    onChange={(e) => setEsPermanente(e.target.checked)}
                                    disabled={loading}
                                />
                                Es permanente (sin fecha de fin)
                            </label>
                            {!esPermanente ? (
                                <input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                                    disabled={loading}
                                    placeholder="Fecha hasta"
                                />
                            ) : (
                                <p className="mt-1 text-xs text-gray-500 italic">
                                    Se asignará sin fecha de fin (permanente).
                                </p>
                            )}
                        </div>
                    </div>

                    {copyFromUrl && (
                        <div className="border-t pt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                Copiar de otro empleado
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                                Trae las cc/cuentas aprobador de otro empleado y las asigna al destinatario de arriba.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    id="copy-from-anacod"
                                    type="text"
                                    placeholder="ANACOD origen"
                                    className="flex-1 rounded-md border border-gray-300 px-2 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const v = document.getElementById('copy-from-anacod')?.value;
                                        if (v) handleCopyFrom(v);
                                    }}
                                    disabled={loading || !tempUser}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-700">
                                cc/cuentas a asignar ({selectedCcCuentas.filter((c) => c.selected).length} de {ccCuentas.length})
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCcCuentas(selectedCcCuentas.map((c) => ({ ...c, selected: true })))}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Todas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCcCuentas(selectedCcCuentas.map((c) => ({ ...c, selected: false })))}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Ninguna
                                </button>
                            </div>
                        </div>
                        {ccCuentas.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                                Este empleado no es aprobador de ninguna cc/cuenta en Red.
                            </p>
                        ) : (
                            <ul className="border border-gray-200 rounded max-h-40 overflow-y-auto divide-y divide-gray-100">
                                {selectedCcCuentas.map((c, i) => (
                                    <li key={i} className="p-2 text-sm flex items-center gap-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={c.selected}
                                            onChange={(e) => {
                                                const updated = [...selectedCcCuentas];
                                                updated[i] = { ...c, selected: e.target.checked };
                                                setSelectedCcCuentas(updated);
                                            }}
                                        />
                                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-mono text-xs rounded shrink-0">
                                            {c.cc_codigo}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-mono text-xs rounded shrink-0">
                                            {c.cuenta_codigo}
                                        </span>
                                        <span className="truncate text-gray-600">{c.cc_nombre} / {c.cuenta_nombre}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Asignando…" : "Asignar"}
                    </button>
                </div>
            </div>
        </div>
    );
}