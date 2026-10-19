import { useEffect, useRef, useState } from "react";
import { getXsrfToken } from "@/Helpers/apiFetch";

function toIsoDate(value) {
    if (!value) return "";
    if (typeof value !== "string") return "";
    return value.length > 10 ? value.substring(0, 10) : value;
}

export default function AprobadorTemporalModal({
    open,
    onClose,
    onConfirm,
    onSkip,
    empleado = null,
    ccCuentas = [],
    fechaInicioDefault = "",
    fechaFinDefault = "",
    loading = false,
    error = null,
    searchUsersUrl = "",
    skipUrl = "",
    anacod = "",
    accionPersonalId = null,
    defaultIsTemporal = true,
    title = "",
}) {
    const [search, setSearch] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [tempUser, setTempUser] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [fechaDesde, setFechaDesde] = useState(toIsoDate(fechaInicioDefault));
    const [fechaHasta, setFechaHasta] = useState(toIsoDate(fechaFinDefault));
    const [isTemporal, setIsTemporal] = useState(defaultIsTemporal);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (open) {
            setFechaDesde(toIsoDate(fechaInicioDefault));
            setFechaHasta(toIsoDate(fechaFinDefault));
            setIsTemporal(defaultIsTemporal);
            setTempUser(null);
            setSearch("");
            setUsuarios([]);
        }
    }, [open, fechaInicioDefault, fechaFinDefault, defaultIsTemporal]);

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
            })
                .then(async (r) => {
                    const json = await r.json().catch(() => ({}));
                    if (!r.ok) {
                        throw new Error(json?.warning || json?.message || `HTTP ${r.status}`);
                    }
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

    const handleAsignar = () => {
        if (!tempUser) {
            setSearchError("Selecciona un aprobador temporal.");
            return;
        }
        if (!fechaDesde) {
            setSearchError("La fecha desde es requerida.");
            return;
        }
        if (isTemporal && !fechaHasta) {
            setSearchError("La fecha hasta es requerida.");
            return;
        }
        if (isTemporal && fechaHasta < fechaDesde) {
            setSearchError("La fecha hasta debe ser mayor o igual a la fecha desde.");
            return;
        }
        onConfirm?.({
            temp_user_id: tempUser.id,
            temp_user_email: tempUser.email,
            fecha_desde: fechaDesde,
            fecha_hasta: isTemporal ? fechaHasta : null,
            cc_cuentas: ccCuentas.map((c) => ({
                cc_id: c.cc_id,
                cuenta_id: c.cuenta_id,
                remote_cc_cuenta_id: c.remote_cc_cuenta_id ?? null,
            })),
            pausar_original: false,
        });
    };

    const handleSkip = () => {
        onSkip?.({
            fecha_desde: fechaDesde,
            fecha_hasta: isTemporal ? fechaHasta : null,
            cc_cuentas: ccCuentas.map((c) => ({
                cc_id: c.cc_id,
                cuenta_id: c.cuenta_id,
            })),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b bg-amber-50">
                    <h3 className="text-lg font-semibold text-amber-900">
                        {title || "Aprobador de presupuestos vigente detectado"}
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
                    <div className="p-3 bg-amber-100 border border-amber-300 rounded text-amber-900 text-sm">
                        <p className="font-medium mb-1">⚠ Aprobador de presupuestos vigente</p>
                        <p>
                            El empleado{" "}
                            <span className="font-semibold">
                                {empleado?.ananam || anacod}
                            </span>{" "}
                            es <strong>aprobador de presupuestos</strong> vigente de las siguientes combinaciones
                            de centro de costo + cuenta.{" "}
                            {defaultIsTemporal
                                ? "Como la acción cubre más de 6h, se recomienda asignar un aprobador temporal."
                                : "Como el empleado será dado de baja, se recomienda asignar un aprobador permanente."}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-gray-700">
                                Centros de costo y cuentas donde es aprobador:
                            </p>
                            <span className="text-xs text-gray-500">
                                {ccCuentas.length} combinación{ccCuentas.length !== 1 ? "es" : ""}
                            </span>
                        </div>
                        <div className="border border-gray-200 rounded max-h-60 overflow-y-auto">
                            {ccCuentas.length === 0 ? (
                                <p className="p-3 text-sm text-gray-500 italic text-center">
                                    Sin cc/cuentas activas.
                                </p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {ccCuentas.map((c, i) => (
                                        <li
                                            key={i}
                                            className="p-2 text-sm flex items-center justify-between gap-2 hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-mono text-xs rounded shrink-0">
                                                    {c.cc_codigo}
                                                </span>
                                                <span className="truncate">{c.cc_nombre}</span>
                                            </div>
                                            <div className="flex items-center gap-1 min-w-0 text-gray-500">
                                                <span className="text-gray-400 shrink-0">→</span>
                                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-mono text-xs rounded shrink-0">
                                                    {c.cuenta_codigo}
                                                </span>
                                                <span className="truncate">{c.cuenta_nombre}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {ccCuentas.length > 5 && (
                            <p className="mt-1 text-xs text-gray-400 italic text-center">
                                Desplázate para ver todas las combinaciones
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div ref={dropdownRef} className="relative">
                            <label className="text-sm font-medium text-gray-700">
                                Aprobador temporal
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
                                    {searching && (
                                        <p className="p-2 text-sm text-gray-500 italic">
                                            Buscando…
                                        </p>
                                    )}
                                    {!searching && searchError && (
                                        <p className="p-2 text-sm text-red-600">
                                            {searchError}
                                        </p>
                                    )}
                                    {!searching && !searchError && usuarios.length === 0 && (
                                        <p className="p-2 text-sm text-gray-500 italic">
                                            Sin resultados.
                                        </p>
                                    )}
                                    {!searching &&
                                        usuarios.map((u) => (
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
                                                        <span className="font-mono text-gray-500 text-xs">
                                                            ({u.code})
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {u.email}
                                                </p>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
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
                            {isTemporal ? (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Vigente hasta
                                    </label>
                                    <input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-end pb-2 text-sm text-gray-500 italic">
                                    Aprobador permanente (sin fecha de fin)
                                </div>
                            )}
                        </div>
                        <div className="mt-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={isTemporal}
                                    onChange={(e) => setIsTemporal(e.target.checked)}
                                    disabled={loading}
                                />
                                Aprobador temporal (con fecha de fin)
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Al confirmar, el aprobador temporal será agregado en Presupuestos
                        como aprobador de las cc/cuentas listadas durante el rango
                        seleccionado. El aprobador original permanecerá activo en su
                        registro.
                    </p>
                </div>

                <div className="px-5 py-3 border-t bg-gray-50 flex flex-wrap items-center justify-end gap-2">
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
                        onClick={handleSkip}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Guardar sin asignar
                    </button>
                    <button
                        type="button"
                        onClick={handleAsignar}
                        disabled={loading || !tempUser}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Asignando…" : "Asignar y guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
