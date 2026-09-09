import { useForm } from "@inertiajs/react";
import { useState } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import ExportButton from "@/Components/ExportButton";
import Swal from "sweetalert2";

const EquiposEmpleado = ({ empleado, equipos }) => {
    const [showForm, setShowForm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedEquipo, setSelectedEquipo] = useState(null);

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        id: null,
        anacod: empleado?.anacod || "",
        licencia: "",
        anexo: "",
        numero_telefono: "",
        modelo_equipo: "",
        imei: "",
        imei2: "",
        sim: "",
        sim2: "",
        tipo_sim: "",
        descripcion_empresa: "",
        plan_operador: "",
        comentarios: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.id) {
            patch(route("ptt-equipos.update", data.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    handleCancel();
                },
            });
        } else {
            post(route("ptt-equipos.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    handleCancel();
                },
            });
        }
    };

    const handleEdit = (equipo) => {
        setShowModal(false);
        setSelectedEquipo(null);
        setShowForm(true);
        setData({
            id: equipo.id,
            anacod: equipo.anacod || empleado?.anacod || "",
            licencia: equipo.licencia || "",
            anexo: equipo.anexo || "",
            numero_telefono: equipo.numero_telefono || "",
            modelo_equipo: equipo.modelo_equipo || "",
            imei: equipo.imei || "",
            imei2: equipo.imei2 || "",
            sim: equipo.sim || "",
            sim2: equipo.sim2 || "",
            tipo_sim: equipo.tipo_sim || "",
            descripcion_empresa: equipo.descripcion_empresa || "",
            plan_operador: equipo.plan_operador || "",
            comentarios: equipo.comentarios || "",
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Seguro que deseas eliminar este equipo?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route("ptt-equipos.destroy", id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleCancel = () => {
        reset();
        setData("anacod", empleado?.anacod || "");
        setShowForm(false);
    };

    const handleView = (equipo) => {
        setSelectedEquipo(equipo);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEquipo(null);
    };

    return (
        <div className="m-5">
            <div className="bg-white rounded shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Equipos asignados</h2>

                    <div className="flex items-center gap-2">
                        {equipos.length > 0 && (
                            <ExportButton data={equipos} name="equipos" />
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                handleCancel();
                                setShowForm(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            + Agregar equipo
                        </button>
                    </div>
                </div>

                {equipos && equipos.length > 0 ? (
                    <div className="overflow-x-auto mb-6">
                        <table className="min-w-full border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-2">Modelo</th>
                                    <th className="border px-3 py-2">IMEI</th>
                                    <th className="border px-3 py-2">Número</th>
                                    <th className="border px-3 py-2">SIM</th>
                                    <th className="border px-3 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipos.map((e) => (
                                    <tr key={e.id}>
                                        <td className="border px-3 py-2">{e.modelo_equipo}</td>
                                        <td className="border px-3 py-2">{e.imei}</td>
                                        <td className="border px-3 py-2">{e.numero_telefono}</td>
                                        <td className="border px-3 py-2">{e.sim}</td>
                                        <td className="border px-3 py-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleView(e)}
                                                    className="bg-slate-600 text-white px-2 py-1 rounded"
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(e)}
                                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(e.id)}
                                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 mb-6">No hay equipos asignados.</p>
                )}

                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4"
                    >
                        <div className="flex flex-col">
                            <InputLabel value="Licencia" htmlFor="licencia" />
                            <select
                                id="licencia"
                                className="w-full border rounded p-2"
                                value={data.licencia}
                                onChange={(e) => setData("licencia", e.target.value)}
                            >
                                <option value="">Seleccionar</option>
                                <option value="INRICO">INRICO</option>
                                <option value="CORGET">CORGET</option>
                            </select>
                            {errors.licencia && (
                                <span className="text-sm text-red-600 mt-1">
                                    {errors.licencia}
                                </span>
                            )}
                        </div>

                        <InputField
                            name="anexo"
                            label="Anexo"
                            data={data}
                            setData={setData}
                            error={errors.anexo}
                        />
                        <InputField
                            name="numero_telefono"
                            label="Número"
                            data={data}
                            setData={setData}
                            error={errors.numero_telefono}
                        />
                        <InputField
                            name="modelo_equipo"
                            label="Modelo"
                            data={data}
                            setData={setData}
                            error={errors.modelo_equipo}
                        />
                        <InputField
                            name="imei"
                            label="IMEI"
                            data={data}
                            setData={setData}
                            error={errors.imei}
                        />
                        <InputField
                            name="imei2"
                            label="IMEI 2"
                            data={data}
                            setData={setData}
                            error={errors.imei2}
                        />
                        <InputField
                            name="sim"
                            label="SIM"
                            data={data}
                            setData={setData}
                            error={errors.sim}
                        />
                        <InputField
                            name="sim2"
                            label="SIM 2"
                            data={data}
                            setData={setData}
                            error={errors.sim2}
                        />
                        <InputField
                            name="tipo_sim"
                            label="Tipo SIM"
                            data={data}
                            setData={setData}
                            error={errors.tipo_sim}
                        />

                        <div className="md:col-span-2">
                            <InputLabel value="Descripción" htmlFor="descripcion_empresa" />
                            <textarea
                                id="descripcion_empresa"
                                className="w-full border rounded p-2"
                                value={data.descripcion_empresa}
                                onChange={(e) =>
                                    setData("descripcion_empresa", e.target.value)
                                }
                            />
                            {errors.descripcion_empresa && (
                                <span className="text-sm text-red-600 mt-1">
                                    {errors.descripcion_empresa}
                                </span>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Plan operador" htmlFor="plan_operador" />
                            <textarea
                                id="plan_operador"
                                className="w-full border rounded p-2"
                                value={data.plan_operador}
                                onChange={(e) =>
                                    setData("plan_operador", e.target.value)
                                }
                            />
                            {errors.plan_operador && (
                                <span className="text-sm text-red-600 mt-1">
                                    {errors.plan_operador}
                                </span>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Comentarios" htmlFor="comentarios" />
                            <textarea
                                id="comentarios"
                                className="w-full border rounded p-2"
                                value={data.comentarios}
                                onChange={(e) => setData("comentarios", e.target.value)}
                            />
                            {errors.comentarios && (
                                <span className="text-sm text-red-600 mt-1">
                                    {errors.comentarios}
                                </span>
                            )}
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                {data.id ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {showModal && selectedEquipo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="text-xl font-bold">
                                Detalle completo del equipo
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="ID" value={selectedEquipo.id} />
                            <DetailItem label="ANACOD" value={selectedEquipo.anacod} />
                            <DetailItem label="Licencia" value={selectedEquipo.licencia} />
                            <DetailItem label="Anexo" value={selectedEquipo.anexo} />
                            <DetailItem
                                label="Número teléfono"
                                value={selectedEquipo.numero_telefono}
                            />
                            <DetailItem
                                label="Modelo equipo"
                                value={selectedEquipo.modelo_equipo}
                            />
                            <DetailItem label="IMEI" value={selectedEquipo.imei} />
                            <DetailItem label="IMEI 2" value={selectedEquipo.imei2} />
                            <DetailItem label="SIM" value={selectedEquipo.sim} />
                            <DetailItem label="SIM 2" value={selectedEquipo.sim2} />
                            <DetailItem
                                label="Tipo SIM"
                                value={selectedEquipo.tipo_sim}
                            />

                            <div className="md:col-span-2">
                                <DetailItem
                                    label="Descripción empresa"
                                    value={selectedEquipo.descripcion_empresa}
                                    multiline
                                />
                            </div>

                            <div className="md:col-span-2">
                                <DetailItem
                                    label="Plan operador"
                                    value={selectedEquipo.plan_operador}
                                    multiline
                                />
                            </div>

                            <div className="md:col-span-2">
                                <DetailItem
                                    label="Comentarios"
                                    value={selectedEquipo.comentarios}
                                    multiline
                                />
                            </div>

                            <DetailItem
                                label="Creado"
                                value={selectedEquipo.created_at}
                            />
                            <DetailItem
                                label="Actualizado"
                                value={selectedEquipo.updated_at}
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t px-6 py-4">
                            <button
                                type="button"
                                onClick={() => handleEdit(selectedEquipo)}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputField = ({ name, label, data, setData, error }) => (
    <div className="flex flex-col">
        <InputLabel value={label} htmlFor={name} />
        <TextInput
            name={name}
            id={name}
            value={data[name]}
            onChange={(e) => setData(name, e.target.value)}
        />
        {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
    </div>
);

const DetailItem = ({ label, value, multiline = false }) => (
    <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <div
            className={`mt-1 rounded border bg-gray-50 px-3 py-2 text-sm text-gray-800 ${
                multiline ? "min-h-[80px] whitespace-pre-wrap" : ""
            }`}
        >
            {value !== null && value !== undefined && value !== ""
                ? value
                : "Sin dato"}
        </div>
    </div>
);

export default EquiposEmpleado;