import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

export default function Edit({ auth, tipo, errors }) {
    const [data, setData] = useState({
        codigo: tipo.codigo,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || "",
        requiere_adjunto: !!tipo.requiere_adjunto,
        activo: !!tipo.activo,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            route("admin.accion-tipos.update", { tipo: tipo.id }),
            { ...data, _method: "patch" }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <h1 className="text-lg font-semibold">Editar tipo de acción</h1>
                </div>
            }
        >
            <Head title="Editar tipo de acción" />

            <div className="max-w-2xl mx-auto mt-8 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Editar tipo de acción</h1>
                <div className="bg-white p-5 rounded-lg shadow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-stone-600 text-sm font-medium">Código</label>
                            <input
                                type="text"
                                value={data.codigo}
                                onChange={(e) => setData({ ...data, codigo: e.target.value })}
                                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 font-mono"
                            />
                            {errors?.codigo && <p className="text-red-600 text-sm mt-1">{errors.codigo[0]}</p>}
                        </div>
                        <div>
                            <label className="text-stone-600 text-sm font-medium">Nombre</label>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={(e) => setData({ ...data, nombre: e.target.value })}
                                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                            />
                            {errors?.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre[0]}</p>}
                        </div>
                        <div>
                            <label className="text-stone-600 text-sm font-medium">Descripción (opcional)</label>
                            <textarea
                                value={data.descripcion}
                                onChange={(e) => setData({ ...data, descripcion: e.target.value })}
                                rows="2"
                                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={data.requiere_adjunto}
                                onChange={(e) => setData({ ...data, requiere_adjunto: e.target.checked })}
                            />
                            Requiere archivo adjunto (futuro)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={data.activo}
                                onChange={(e) => setData({ ...data, activo: e.target.checked })}
                            />
                            Activo
                        </label>
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
