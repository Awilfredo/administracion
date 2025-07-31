import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import BackEmpleados from "./components/BackEmpleados";
import Nav from "./Partials/Nav";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";

const CreateDatos = ({ empleado }) => {
    const { data, setData, post, processing, errors } = useForm({
        cod_empleado: "",
        cc: "",
        genero: "",
        padre_madre: "",
        hijos: "",
        hijos_menores: "",
        nombres_edades_hijos: "",
        dui: "",
        nit: "",
        isss: "",
        tipo_afp: "",
        afp: "",
        tel_casa: "",
        cel_personal: "",
        direccion: "",
        modelo_red_ptt: "",
        imei: "",
        imei2: "",
        simcard: "",
        tipo_sim: "",
        observacion_equipo: "",
        tarjeta_acceso: "",
        dui_adjunto: null,
        comentarios: "",
    });
    const auth = usePage().props.auth;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("empleado.guardar")); // Ajusta al nombre de tu ruta
    };

    return (
        <AuthenticatedLayout
        user={auth.user}
        header={
            <div className="flex justify-between w-full">
                <BackEmpleados></BackEmpleados>
                <Nav user={empleado}></Nav>
                <div> </div>
            </div>
        }
    >
            <div className="w-full flex flex-col m-5">
                <h2 className="text-2xl font-bold text-center mb-5">Crear datos personales</h2>
                <div className="">
                    <p><span className="font-bold">Usuario:</span> {empleado.anacod}</p>
                    <p><span className="font-bold">Nombre:</span> {empleado.ananam}</p>
                </div>
            </div>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 p-6 bg-white rounded shadow-md m-5"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full flex flex-col">
                        <InputLabel value="CC" />
                        <TextInput
                            name="cc"
                            value={data.cc}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="GENERO" />
                        <TextInput
                            name="genero"
                            value={data.genero}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="PADRE / MADRE" />
                        <TextInput
                            name="padre_madre"
                            value={data.padre_madre}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# HIJOS" />
                        <TextInput
                            name="hijos"
                            value={data.hijos}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# HIJOS MENORES DE EDAD" />
                        <TextInput
                            name="hijos_menores"
                            value={data.hijos_menores}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="NOMBRE Y EDADES DE HIJOS MENORES" />
                        <TextInput
                            name="nombres_edades_hijos"
                            value={data.nombres_edades_hijos}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# DUI" />
                        <TextInput
                            name="dui"
                            value={data.dui}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# NIT" />
                        <TextInput
                            name="nit"
                            value={data.nit}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# ISSS" />
                        <TextInput
                            name="isss"
                            value={data.isss}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="TIPO AFP" />
                        <TextInput
                            name="tipo_afp"
                            value={data.tipo_afp}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# AFP" />
                        <TextInput
                            name="afp"
                            value={data.afp}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="TEL CASA O EMERGENCIA" />
                        <TextInput
                            name="tel_casa"
                            value={data.tel_casa}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="CEL PERSONAL" />
                        <TextInput
                            name="cel_personal"
                            value={data.cel_personal}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="DIRECCION" />
                        <TextInput
                            name="direccion"
                            value={data.direccion}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="MODELO DE EQUIPO RED PTT" />
                        <TextInput
                            name="modelo_red_ptt"
                            value={data.modelo_red_ptt}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="IMEI" />
                        <TextInput
                            name="imei"
                            value={data.imei}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="IMEI2" />
                        <TextInput
                            name="imei2"
                            value={data.imei2}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="SIMCARD" />
                        <TextInput
                            name="simcard"
                            value={data.simcard}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="TIPO DE SIM" />
                        <TextInput
                            name="tipo_sim"
                            value={data.tipo_sim}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="OBSERVACION DE EQUIPO RED PTT" />
                        <TextInput
                            name="observacion_equipo"
                            value={data.observacion_equipo}
                            onChange={setData}
                        />
                    </div>
                    <div className="w-full flex flex-col">
                        <InputLabel value="# DE TARJETA DE ACCESO AREA RESTRINGIDA" />
                        <TextInput
                            name="tarjeta_acceso"
                            value={data.tarjeta_acceso}
                            onChange={setData}
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-semibold">ADJUNTAR DUI</label>
                    <input
                        type="file"
                        onChange={(e) =>
                            setData("dui_adjunto", e.target.files[0])
                        }
                        className="block mt-1"
                    />
                </div>

                <div>
                    <label className="block font-semibold">COMENTARIOS</label>
                    <textarea
                        className="w-full border rounded p-2"
                        value={data.comentarios}
                        onChange={(e) => setData("comentarios", e.target.value)}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Guardar
                </button>
            </form>
        </AuthenticatedLayout>
    );
};

export default CreateDatos;
