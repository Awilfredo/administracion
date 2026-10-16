import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AccionForm from "./Components/AccionForm";

export default function GlobalCreate({ auth, tipos, empleadosActivos = [], errors }) {
    const [data, setData] = useState({
        anacod: "",
        tipo_id: "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date().toISOString().split("T")[0],
        hora_inicio: "",
        hora_fin: "",
        motivo: "",
        observaciones: "",
    });
    const [empleadoActual, setEmpleadoActual] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route("empleados.acciones.global.store"), data, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <h1 className="text-lg font-semibold">Nueva acción de personal</h1>
                </div>
            }
        >
            <Head title="Nueva acción de personal" />

            <div className="max-w-3xl mx-auto mt-8 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Nueva acción de personal</h1>
                {errors && Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-semibold text-sm mb-1">Hay errores en el formulario:</p>
                        <ul className="list-disc pl-5 text-xs space-y-0.5">
                            {Object.entries(errors).map(([key, msgs]) => (
                                <li key={key}>
                                    <strong>{key}:</strong>{" "}
                                    {Array.isArray(msgs) ? msgs[0] : msgs}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="bg-white p-5 rounded-lg shadow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AccionForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            tipos={tipos}
                            showEmpleadoSelector={true}
                            empleadoActual={empleadoActual}
                            onSelectEmpleado={setEmpleadoActual}
                            empleadosActivos={empleadosActivos}
                        />
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
                                disabled={!data.anacod}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
