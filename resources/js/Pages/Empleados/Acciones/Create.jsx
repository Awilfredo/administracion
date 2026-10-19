import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import AccionForm from "./Components/AccionForm";
import BackEmpleados from "../components/BackEmpleados";
import Nav from "../Partials/Nav";
import AprobadorTemporalModal from "@/Components/AprobadorTemporalModal";
import { esAccionProlongada } from "@/Helpers/esAccionProlongada";
import { apiFetch } from "@/Helpers/apiFetch";
import { showAprobadorSummary } from "@/Helpers/aprobadorSummary";

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
    const [aprobadorCheck, setAprobadorCheck] = useState(null);
    const [aprobadorModal, setAprobadorModal] = useState({ open: false, loading: false, error: null });
    const skipRef = useRef(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!esAccionProlongada(data)) {
            setAprobadorCheck(null);
            return;
        }
        if (!data.fecha_inicio) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const json = await apiFetch(
                    route("empleados.acciones.check-aprobador"),
                    {
                        method: "POST",
                        body: {
                            anacod,
                            fecha_inicio: data.fecha_inicio,
                            fecha_fin: data.fecha_fin || null,
                        },
                    }
                );
                setAprobadorCheck(json);
            } catch {
                setAprobadorCheck(null);
            }
        }, 500);
        return () => debounceRef.current && clearTimeout(debounceRef.current);
    }, [data.fecha_inicio, data.fecha_fin, data.hora_inicio, data.hora_fin]);

    const doSubmit = () => {
        router.post(route("empleados.acciones.store", { anacod }), data, {
            forceFormData: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (aprobadorCheck?.is_aprobador && !skipRef.current) {
            setAprobadorModal({ open: true, loading: false, error: null });
            return;
        }
        doSubmit();
    };

    const handleAprobadorConfirm = async (form) => {
        setAprobadorModal({ open: true, loading: true, error: null });
        try {
            const result = await apiFetch(
                route("empleados.acciones.asignar-aprobador-temporal"),
                { method: "POST", body: { ...form, anacod, accion_personal_id: null } }
            );
            setAprobadorModal({ open: false, loading: false, error: null });
            await showAprobadorSummary(result);
            doSubmit();
        } catch (e) {
            setAprobadorModal({
                open: true,
                loading: false,
                error: e.message || "Error al asignar aprobador temporal.",
            });
        }
    };

    const handleAprobadorSkip = async (form) => {
        setAprobadorModal({ open: true, loading: true, error: null });
        try {
            await apiFetch(
                route("empleados.acciones.skip-aprobador-temporal"),
                { method: "POST", body: { ...form, anacod, accion_personal_id: null } }
            );
            skipRef.current = true;
            setAprobadorModal({ open: false, loading: false, error: null });
            doSubmit();
        } catch (e) {
            setAprobadorModal({
                open: true,
                loading: false,
                error: e.message || "Error al omitir aprobador temporal.",
            });
        }
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

            <AprobadorTemporalModal
                open={aprobadorModal.open}
                onClose={() => setAprobadorModal({ open: false, loading: false, error: null })}
                onConfirm={handleAprobadorConfirm}
                onSkip={handleAprobadorSkip}
                empleado={empleado}
                anacod={anacod}
                ccCuentas={aprobadorCheck?.cc_cuentas || []}
                fechaInicioDefault={data.fecha_inicio}
                fechaFinDefault={data.fecha_fin || data.fecha_inicio}
                loading={aprobadorModal.loading}
                error={aprobadorModal.error}
                searchUsersUrl={route("empleados.acciones.search-users")}
            />
        </AuthenticatedLayout>
    );
}
