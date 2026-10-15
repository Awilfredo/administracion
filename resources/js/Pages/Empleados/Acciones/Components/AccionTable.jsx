import { Link, router } from "@inertiajs/react";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import {
    IconEdit,
    IconCancel,
    IconTrash,
    IconCheck,
    IconX,
    IconChevronLeft,
    IconChevronRight,
} from "@/Components/Icons/AccionesIcons";

const { formatDate } = ManejoFechas();

function EstadoBadge({ estado }) {
    const esCancelado = estado === "cancelado";
    return (
        <span
            className={
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold " +
                (esCancelado
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700")
            }
        >
            {esCancelado ? (
                <IconX width={10} height={10} />
            ) : (
                <IconCheck width={10} height={10} />
            )}
            {esCancelado ? "Cancelado" : "Aprobado"}
        </span>
    );
}

function IconButton({ onClick, href, title, color, children, as = "button" }) {
    const cls = `p-1.5 rounded hover:bg-gray-100 transition-colors ${color}`;
    if (href) {
        return (
            <Link href={href} className={cls} title={title}>
                {children}
            </Link>
        );
    }
    return (
        <button type="button" onClick={onClick} className={cls} title={title}>
            {children}
        </button>
    );
}

export default function AccionTable({
    acciones,
    scope = "empleado",
    anacod = null,
    showEmpleado = false,
    emptyMessage = "No hay acciones registradas.",
}) {
    const data = acciones?.data ?? [];
    const links = acciones?.links ?? [];

    if (data.length === 0) {
        return (
            <div className="p-8 bg-white rounded-lg shadow text-center text-gray-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-2 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <rect x="4" y="5" width="16" height="16" rx="2" />
                    <path d="M8 3v4M16 3v4M4 11h16" />
                </svg>
                {emptyMessage}
            </div>
        );
    }

    const editRoute = (a) =>
        scope === "global"
            ? route("empleados.acciones.global.edit", { accion: a.id })
            : route("empleados.acciones.edit", { anacod, accion: a.id });
    const cancelRoute = (a) =>
        scope === "global"
            ? route("empleados.acciones.global.cancel", { accion: a.id })
            : route("empleados.acciones.cancel", { anacod, accion: a.id });
    const destroyRoute = (a) =>
        scope === "global"
            ? route("empleados.acciones.global.destroy", { accion: a.id })
            : route("empleados.acciones.destroy", { anacod, accion: a.id });

    const handleCancel = (a) => {
        if (!confirm("¿Cancelar esta acción?")) return;
        router.post(cancelRoute(a));
    };
    const handleDelete = (a) => {
        if (!confirm("¿Eliminar esta acción? Los archivos también se borrarán.")) return;
        router.delete(destroyRoute(a));
    };

    const renderLabel = (link) => {
        if (link.label.includes("Previous")) return <IconChevronLeft />;
        if (link.label.includes("Next")) return <IconChevronRight />;
        return <span dangerouslySetInnerHTML={{ __html: link.label }} />;
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600 sticky top-0 z-10 shadow-sm">
                        <tr>
                            {showEmpleado && <th className="px-4 py-3">Empleado</th>}
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Período</th>
                            <th className="px-4 py-3">Horario</th>
                            <th className="px-4 py-3">Motivo</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-center">Arch.</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((a) => (
                            <tr
                                key={a.id}
                                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                {showEmpleado && (
                                    <td className="px-4 py-2 font-mono text-xs">
                                        <div className="font-semibold">{a.anacod}</div>
                                        <div className="text-gray-500 text-[11px] truncate max-w-[12rem]">
                                            {a.empleado?.ananam ?? "—"}
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-2 font-medium">{a.tipo?.nombre ?? "—"}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {formatDate(a.fecha_inicio)}
                                    {a.fecha_fin ? (
                                        <span className="text-gray-400 mx-1">→</span>
                                    ) : null}
                                    {a.fecha_fin ? formatDate(a.fecha_fin) : null}
                                </td>
                                <td className="px-4 py-2 text-xs text-gray-700">
                                    {a.hora_inicio || a.hora_fin ? (
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-mono">
                                            {a.hora_inicio?.slice(0, 5) ?? "?"} – {a.hora_fin?.slice(0, 5) ?? "?"}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 max-w-xs truncate" title={a.motivo}>
                                    {a.motivo}
                                </td>
                                <td className="px-4 py-2">
                                    <EstadoBadge estado={a.estado} />
                                </td>
                                <td className="px-4 py-2 text-center text-gray-600">
                                    {a.archivos?.length ?? 0}
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex justify-end items-center gap-1">
                                        <IconButton
                                            href={editRoute(a)}
                                            title="Editar"
                                            color="text-blue-600 hover:text-blue-800"
                                        >
                                            <IconEdit />
                                        </IconButton>
                                        {a.estado === "aprobado" && (
                                            <IconButton
                                                onClick={() => handleCancel(a)}
                                                title="Cancelar"
                                                color="text-yellow-600 hover:text-yellow-800"
                                            >
                                                <IconCancel />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => handleDelete(a)}
                                            title="Eliminar"
                                            color="text-red-600 hover:text-red-800"
                                        >
                                            <IconTrash />
                                        </IconButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {links.length > 1 && (
                <div className="px-4 py-3 flex justify-end items-center gap-1 text-xs border-t border-gray-100">
                    {links.map((l, i) => (
                        <Link
                            key={i}
                            href={l.url || "#"}
                            aria-disabled={!l.url}
                            className={
                                "min-w-[2rem] h-8 px-2 inline-flex items-center justify-center rounded " +
                                (l.active
                                    ? "bg-blue-500 text-white"
                                    : l.url
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none")
                            }
                        >
                            {renderLabel(l)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
