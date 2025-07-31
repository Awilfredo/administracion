import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import BackEmpleados from "./components/BackEmpleados";
import Nav from "./Partials/Nav";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import EmpleadoHijos from "./EmpleadoHijos";
import Archivos from "./Archivos";

const Datos = ({ datos, empleado}) => {
    const auth = usePage().props.auth;
    const [disabled, setDisabled] = useState(true);
    
    console.log(datos);

    const { data, setData, post, patch, processing, errors } = useForm({
        id: datos?.id || null,
        anacod: empleado?.anacod || "",
        cc: datos?.cc || "",
        genero: datos?.genero || "",
        padre: datos?.padre || "",
        madre: datos?.madre || "",
        dui: datos?.dui || "",
        nit: datos?.nit || "",
        isss: datos?.isss || "",
        tipo_afp: datos?.tipo_afp || "",
        afp: datos?.afp || "",
        tel_casa: datos?.tel_casa || "",
        cel_personal: datos?.cel_personal || "",
        direccion: datos?.direccion || "",
        modelo_red_ptt: datos?.modelo_red_ptt || "",
        imei: datos?.imei || "",
        imei2: datos?.imei2 || "",
        simcard: datos?.simcard || "",
        tipo_sim: datos?.tipo_sim || "",
        observacion_equipo: datos?.observacion_equipo || "",
        tarjeta_acceso: datos?.tarjeta_acceso || "",
        dui_adjunto: null,
        comentarios: datos?.comentarios || "",
        asegurado: datos?.asegurado || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.id) {
            patch(route("datos.update", data.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDisabled(true);
                    Swal.fire({
                        icon: "success",
                        title: "Datos actualizados correctamente",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
            });
        } else {
            post(route("datos.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    setDisabled(true);
                    Swal.fire({
                        icon: "success",
                        title: "Datos guardados correctamente",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
            });
        }
    };

    const handleCancel = () => {
        setData({
            id: empleado?.id || null,
            anacod: empleado?.anacod || "",
            cc: empleado?.cc || "",
            genero: empleado?.genero || "",
            padre: empleado?.padre || "",
            madre: empleado?.madre || "",
            dui: empleado?.dui || "",
            nit: empleado?.nit || "",
            isss: empleado?.isss || "",
            tipo_afp: empleado?.tipo_afp || "",
            afp: empleado?.afp || "",
            tel_casa: empleado?.tel_casa || "",
            cel_personal: empleado?.cel_personal || "",
            direccion: empleado?.direccion || "",
            modelo_red_ptt: empleado?.modelo_red_ptt || "",
            imei: empleado?.imei || "",
            imei2: empleado?.imei2 || "",
            simcard: empleado?.simcard || "",
            tipo_sim: empleado?.tipo_sim || "",
            observacion_equipo: empleado?.observacion_equipo || "",
            tarjeta_acceso: empleado?.tarjeta_acceso || "",
            dui_adjunto: null,
            comentarios: empleado?.comentarios || "",
            asegurado: empleado?.asegurado || false,
        });
        setDisabled(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between w-full">
                    <BackEmpleados />
                    <Nav user={empleado} />
                    <div></div>
                </div>
            }
        >
            <div className="m-5">
                <div className="flex justify-between align-top">
                    <div className="mb-4">
                        <p>
                            <strong>Usuario:</strong> {empleado.anacod}
                        </p>
                        <p>
                            <strong>Nombre:</strong> {empleado.ananam}
                        </p>
                    </div>
                    {disabled && (
                        <button
                            onClick={() => setDisabled(false)}
                            className="bg-blue-500 h-10 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Editar
                        </button>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 p-6 bg-white rounded shadow-md"
                >

                    <div>
                        <h2 className="text-xl font-bold mb-4">Datos del Empleado</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            name="cc"
                            label="CC"
                            value={data.cc}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="genero"
                            label="Género"
                            value={data.genero}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="padre"
                            label="Nombre del padre"
                            value={data.padre}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="madre"
                            label="Nombre de la madre"
                            value={data.madre}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="dui"
                            label="DUI"
                            value={data.dui}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="nit"
                            label="NIT"
                            value={data.nit}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="isss"
                            label="ISSS"
                            value={data.isss}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="tipo_afp"
                            label="Tipo AFP"
                            value={data.tipo_afp}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="afp"
                            label="AFP"
                            value={data.afp}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="tel_casa"
                            label="Teléfono Casa/Emergencia"
                            value={data.tel_casa}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="cel_personal"
                            label="Celular Personal"
                            value={data.cel_personal}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="direccion"
                            label="Dirección"
                            value={data.direccion}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="modelo_red_ptt"
                            label="Modelo Red PTT"
                            value={data.modelo_red_ptt}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="imei"
                            label="IMEI"
                            value={data.imei}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="imei2"
                            label="IMEI 2"
                            value={data.imei2}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="simcard"
                            label="SIM Card"
                            value={data.simcard}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="tipo_sim"
                            label="Tipo de SIM"
                            value={data.tipo_sim}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="observacion_equipo"
                            label="Observaciones del equipo"
                            value={data.observacion_equipo}
                            setData={setData}
                            disabled={disabled}
                        />
                        <InputField
                            name="tarjeta_acceso"
                            label="Tarjeta de Acceso"
                            value={data.tarjeta_acceso}
                            setData={setData}
                            disabled={disabled}
                        />
                        <div>
                            <InputLabel value="Asegurado" htmlFor="asegurado" />
                            <input
                                type="checkbox"
                                name="asegurado"
                                id="asegurado"
                                checked={data.asegurado}
                                onChange={(e) =>
                                    setData("asegurado", e.target.checked)
                                }
                                disabled={disabled}
                            />
                        </div>
                    </div>
                    <div>
                        <InputLabel value="Comentarios" />
                        <textarea
                            className="w-full border rounded p-2"
                            value={data.comentarios}
                            onChange={(e) =>
                                setData("comentarios", e.target.value)
                            }
                            disabled={disabled}
                        ></textarea>
                    </div>

                    {!disabled && (
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleCancel()}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                        </div>
                    )}
                </form>

                <div className="hidden">
                    <InputLabel value="Adjuntar DUI" />
                    <input
                        type="file"
                        onChange={(e) =>
                            setData("dui_adjunto", e.target.files[0])
                        }
                        disabled={disabled}
                        className="block mt-1"
                    />
                </div>
            </div>

            {
                datos?.id &&
                <div className="mt-4 w-full">

                <EmpleadoHijos empleado_id={datos.id} hijos={datos.hijos} />
                <Archivos empleadoId={datos.id} archivos={datos.archivos} />
                </div>
            

            }
        </AuthenticatedLayout>
    );
};

// Reutilizable
const InputField = ({
    name,
    label,
    value,
    setData,
    disabled,
    type = "text",
    className = "",
}) => (
    <div className="w-full flex flex-col ">
        <InputLabel value={label} htmlFor={name} />
        <TextInput
            className={disabled ? "bg-gray-200 " : " " + className}
            name={name}
            id={name}
            value={value}
            onChange={(e) => setData(name, e.target.value)}
            disabled={disabled}
            type={type}
        />
    </div>
);

export default Datos;
