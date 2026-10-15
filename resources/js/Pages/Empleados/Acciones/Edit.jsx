import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AccionForm from "./Components/AccionForm";
import BackEmpleados from "../components/BackEmpleados";
import Nav from "../Partials/Nav";

export default function Edit({ auth, anacod, empleado, accion, tipos, errors }) {
    const [data, setData] = useState({
        tipo_id: accion.tipo_id,
        fecha_inicio: accion.fecha_inicio,
        fecha_fin: accion.fecha_fin || "",
        hora_inicio: accion.hora_inicio || "",
        hora_fin: accion.hora_fin || "",
        motivo: accion.motivo,
        observaciones: accion.observaciones || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            route("empleados.acciones.update", { anacod, accion: accion.id }),
            { ...data, _method: "patch" },
            { forceFormData: true }
        );
    };

    const handleDeleteArchivo = (archivoId) => {
        if (!confirm("¿Eliminar este archivo?")) return;
        router.delete(
            route("empleados.acciones.archivos.destroy", {
                anacod,
                accion: accion.id,
                archivo: archivoId,
            })
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
            <Head title={`Editar acción - ${anacod}`} />

            <div className="max-w-3xl mx-auto mt-8 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Editar acción</h1>
                <div className="bg-white p-5 rounded-lg shadow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AccionForm data={data} setData={setData} errors={errors} tipos={tipos} />

                        {(accion.archivos?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                    Archivos actuales
                                </p>
                                <ul className="text-sm space-y-1">
                                    {accion.archivos.map((a) => (
                                        <li
                                            key={a.id}
                                            className="flex items-center justify-between border-b border-gray-100 py-1"
                                        >
                                            <Link
                                                href={route(
                                                    "empleados.acciones.archivos.download",
                                                    { anacod, accion: accion.id, archivo: a.id }
                                                )}
                                                className="text-blue-600 hover:underline"
                                                target="_blank"
                                            >
                                                {a.nombre_original}
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteArchivo(a.id)}
                                                className="text-red-600 hover:underline text-xs"
                                            >
                                                Eliminar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => history.back()}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
