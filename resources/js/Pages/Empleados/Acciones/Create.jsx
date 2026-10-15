import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AccionForm from "./Components/AccionForm";
import BackEmpleados from "../components/BackEmpleados";
import Nav from "../Partials/Nav";

export default function Create({ auth, anacod, empleado, tipos, errors }) {
    const [data, setData] = useState({
        tipo_id: "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date().toISOString().split("T")[0],
        hora_inicio: "",
        hora_fin: "",
        motivo: "",
        observaciones: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route("empleados.acciones.store", { anacod }), data, {
            forceFormData: true,
        });
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
            <Head title={`Nueva acción - ${anacod}`} />

            <div className="max-w-3xl mx-auto mt-8 p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Nueva acción de personal</h1>
                <div className="bg-white p-5 rounded-lg shadow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AccionForm data={data} setData={setData} errors={errors} tipos={tipos} />
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
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
