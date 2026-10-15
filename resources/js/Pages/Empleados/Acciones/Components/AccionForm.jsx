import { useState } from "react";
import TextInput from "../../../Empleados/Partials/TextInput";
import Select from "../../../Empleados/Partials/Select";

function EmpleadoDatalist({ value, empleadoActual, empleadosActivos, onSelect, error }) {
    return (
        <div>
            <label className="text-stone-600 text-sm font-medium">Empleado</label>
            <input
                list="empleados-activos-list"
                value={value || ""}
                onChange={(e) => {
                    const v = e.target.value;
                    const emp = empleadosActivos.find((x) => x.anacod === v) || null;
                    onSelect(v, emp);
                }}
                placeholder="Escribí el anacod o nombre del empleado…"
                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
            />
            <datalist id="empleados-activos-list">
                {empleadosActivos.map((e) => (
                    <option key={e.anacod} value={e.anacod}>
                        {e.ananam}
                    </option>
                ))}
            </datalist>
            {empleadoActual && (
                <p className="text-xs text-gray-500 mt-1">
                    Seleccionado: <span className="font-mono">{empleadoActual.anacod}</span> — {empleadoActual.ananam}
                </p>
            )}
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}

export default function AccionForm({
    data,
    setData,
    errors,
    tipos,
    showEmpleadoSelector = false,
    empleadoActual = null,
    onSelectEmpleado = null,
    empleadosActivos = [],
}) {
    const [archivos, setArchivos] = useState([]);

    const sameDay = !data.fecha_fin || data.fecha_fin === data.fecha_inicio;

    const handleTipo = (e) => setData({ ...data, tipo_id: parseInt(e.target.value, 10) || "" });
    const handleArchivos = (e) => {
        const list = Array.from(e.target.files || []);
        setArchivos(list);
    };

    const removeArchivo = (index) => {
        setArchivos((current) => {
            const removed = current[index];
            if (removed && removed.type && removed.type.startsWith("image/")) {
                const url = URL.createObjectURL(removed);
                URL.revokeObjectURL(url);
            }
            return current.filter((_, i) => i !== index);
        });
    };

    return (
        <div className="space-y-4">
            {showEmpleadoSelector && (
                <EmpleadoDatalist
                    value={data.anacod}
                    empleadoActual={empleadoActual}
                    empleadosActivos={empleadosActivos}
                    onSelect={(v, emp) => {
                        onSelectEmpleado?.(emp);
                        setData({ ...data, anacod: v });
                    }}
                    error={errors?.anacod?.[0]}
                />
            )}

            <Select label="Tipo de acción" value={data.tipo_id} onChange={handleTipo}>
                <option value="">— Seleccione —</option>
                {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.nombre}
                    </option>
                ))}
            </Select>
            {errors?.tipo_id && <p className="text-red-600 text-sm">{errors.tipo_id[0]}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Fecha de inicio"
                    type="date"
                    value={data.fecha_inicio || ""}
                    onChange={(e) => setData({ ...data, fecha_inicio: e.target.value, hora_inicio: null, hora_fin: null })}
                />
                <TextInput
                    label="Fecha de fin (opcional)"
                    type="date"
                    value={data.fecha_fin || ""}
                    onChange={(e) => setData({ ...data, fecha_fin: e.target.value, hora_inicio: null, hora_fin: null })}
                />
            </div>
            {(errors?.fecha_inicio || errors?.fecha_fin) && (
                <p className="text-red-600 text-sm">
                    {errors.fecha_inicio?.[0] || errors.fecha_fin?.[0]}
                </p>
            )}

            {sameDay && (
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        Horario (opcional, solo para permisos de unas horas)
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                        Si el permiso es para entrar más tarde o salir más temprano el mismo día.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <TextInput
                            label="Hora de inicio"
                            type="time"
                            value={data.hora_inicio || ""}
                            onChange={(e) => setData({ ...data, hora_inicio: e.target.value || null })}
                        />
                        <TextInput
                            label="Hora de fin"
                            type="time"
                            value={data.hora_fin || ""}
                            onChange={(e) => setData({ ...data, hora_fin: e.target.value || null })}
                        />
                    </div>
                    {(errors?.hora_inicio || errors?.hora_fin) && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.hora_inicio?.[0] || errors.hora_fin?.[0]}
                        </p>
                    )}
                </div>
            )}

            <div>
                <label className="text-stone-600 text-sm font-medium">Motivo</label>
                <textarea
                    value={data.motivo || ""}
                    onChange={(e) => setData({ ...data, motivo: e.target.value })}
                    rows="3"
                    className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
            </div>
            {errors?.motivo && <p className="text-red-600 text-sm">{errors.motivo[0]}</p>}

            <div>
                <label className="text-stone-600 text-sm font-medium">Observaciones (opcional)</label>
                <textarea
                    value={data.observaciones || ""}
                    onChange={(e) => setData({ ...data, observaciones: e.target.value })}
                    rows="2"
                    className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
            </div>

            <div>
                <label className="text-stone-600 text-sm font-medium">
                    Archivos adjuntos (opcional, máx 10 MB c/u)
                </label>
                <input
                    type="file"
                    multiple
                    onChange={handleArchivos}
                    className="mt-2 block w-full text-sm"
                />
                {archivos.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {archivos.map((f, i) => {
                            const isImage = f.type.startsWith("image/");
                            const url = isImage ? URL.createObjectURL(f) : null;
                            return (
                                <div
                                    key={i}
                                    className="relative border border-gray-200 rounded p-2 bg-white"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeArchivo(i)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                                        title="Quitar archivo"
                                    >
                                        ✕
                                    </button>
                                    <div className="h-20 w-full flex items-center justify-center bg-gray-50 rounded overflow-hidden mb-1">
                                        {isImage ? (
                                            <img
                                                src={url}
                                                alt={f.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-10 w-10 text-gray-400"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-700 truncate" title={f.name}>
                                        {f.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {(f.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
