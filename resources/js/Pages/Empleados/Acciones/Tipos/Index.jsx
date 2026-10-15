import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
    IconEdit,
    IconTrash,
    IconCheck,
    IconX,
    IconChevronLeft,
    IconChevronRight,
} from "@/Components/Icons/AccionesIcons";

function EstadoBadge({ activo }) {
    return activo ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <IconCheck width={10} height={10} />
            Activo
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
            <IconX width={10} height={10} />
            Inactivo
        </span>
    );
}

function IconLink({ href, title, color, children }) {
    return (
        <Link
            href={href}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${color}`}
        >
            {children}
        </Link>
    );
}

function IconActionButton({ onClick, title, color, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${color}`}
        >
            {children}
        </button>
    );
}

export default function Index({ auth, tipos, counts = {}, search: initialSearch = "" }) {
    const [search, setSearch] = useState(initialSearch);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(
            route("admin.accion-tipos.index"),
            search ? { q: search } : {},
            { preserveState: true }
        );
    };

    const handleDelete = (id, nombre) => {
        if (!confirm(`¿Desactivar el tipo "${nombre}"? Las acciones existentes lo seguirán mostrando.`)) return;
        router.delete(route("admin.accion-tipos.destroy", { tipo: id }));
    };

    const renderLabel = (link) => {
        if (link.label.includes("Previous")) return <IconChevronLeft />;
        if (link.label.includes("Next")) return <IconChevronRight />;
        return <span dangerouslySetInnerHTML={{ __html: link.label }} />;
    };

    const data = tipos?.data ?? [];
    const links = tipos?.links ?? [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <h1 className="text-lg font-semibold">Tipos de acciones</h1>
                </div>
            }
        >
            <Head title="Tipos de acciones" />

            <div className="max-w-6xl mx-auto mt-8 p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tipos de acciones</h1>
                        <p className="text-sm text-gray-500">Administra los tipos disponibles al crear acciones de personal.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route("empleados.acciones.global.index")}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                            ← Acciones
                        </Link>
                        <Link
                            href={route("admin.accion-tipos.create")}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Nuevo tipo
                        </Link>
                    </div>
                </div>

                <form
                    onSubmit={applyFilter}
                    className="bg-white p-4 rounded-lg shadow flex gap-2 items-end"
                >
                    <div className="flex-1">
                        <label className="text-stone-600 text-sm font-medium">Buscar</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="código o nombre…"
                            className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
                    >
                        Filtrar
                    </button>
                </form>

                {data.length === 0 ? (
                    <div className="p-8 bg-white rounded-lg shadow text-center text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-2 text-gray-300"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                        No hay tipos registrados.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3">Código</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Descripción</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                        <th className="px-4 py-3">Adjunto</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 text-right">Operaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((t) => (
                                        <tr
                                            key={t.id}
                                            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-2 font-mono">{t.codigo}</td>
                                            <td className="px-4 py-2 font-medium">{t.nombre}</td>
                                            <td
                                                className="px-4 py-2 text-gray-600 text-xs max-w-xs truncate"
                                                title={t.descripcion}
                                            >
                                                {t.descripcion || "—"}
                                            </td>
                                            <td className="px-4 py-2 text-center font-mono">
                                                {counts[t.id] ?? 0}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {t.requiere_adjunto ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                                        Sí
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <EstadoBadge activo={t.activo} />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex justify-end items-center gap-1">
                                                    <IconLink
                                                        href={route("admin.accion-tipos.edit", { tipo: t.id })}
                                                        title="Editar"
                                                        color="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <IconEdit />
                                                    </IconLink>
                                                    {t.activo && (
                                                        <IconActionButton
                                                            onClick={() => handleDelete(t.id, t.nombre)}
                                                            title="Desactivar"
                                                            color="text-red-600 hover:text-red-800"
                                                        >
                                                            <IconTrash />
                                                        </IconActionButton>
                                                    )}
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
                )}
            </div>
        </AuthenticatedLayout>
    );
}
