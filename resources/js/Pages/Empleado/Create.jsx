import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useEffect, useState } from "react";
import { CrearEmpleado } from "@/Helpers/CrearEmpleado";
import SanForm from "./Partials/SanForm";
import BackEmpleados from "./components/BackEmpleados";

function Create({ auth, anacods, jefes, areas, posiciones, horarios }) {
    const { fechaActual } = ManejoFechas();
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({
        anacod: "", //
        nombres: "", //
        apellidos: "", //
        anamai: "", //
        anasta: "A",
        anapai: "SV", //
        anatel: "", //
        anarad: "",
        anajef: "",
        anarea: "",
        folcod: null, // Valor numérico
        anaext: "",
        anaimg: "",
        anapos: "",
        anames: null, // Valor numérico
        anadia: null, // Valor numérico
        fecha_ingreso: fechaActual(), // Fechas como string
        lider_area: "",
        folcodreal: null, // Valor numérico
        horario_id: 2, // Valor numérico
        isBoss: false,
        jefaturas: [],
    });

    const { generatePassword, makeAnacod } = CrearEmpleado();

    const handleSubmit = (e) => {
        router.visit(route("empleados.store"), {
            method: "post",
            data: data,
            preserveState: true,
            onError: (errors) => {
                setErrors(errors);
                console.log(errors);
            },
        });
    };
    

    useEffect(() => {
        console.log("use effect");
        console.log(data?.nombres + " " + data?.apellidos);
        try {
            let anastasio = makeAnacod({ ...data, anacods: anacods });
            let amamai = anastasio.toLowerCase() + (data.anapai === "SV" ? "@red.com.sv" : "@red.com.gt");
            let usuario_mensajeria =
                anastasio.toLowerCase() + "@mensajeria.red";
            let usuario_red_control =
                anastasio.toLowerCase() + "@redcontrol.com." + (data.anapai === "SV" ? "sv" : "gt");
            setData({
                ...data,
                anacod: anastasio,
                anamai: amamai,
                usuario_mensajeria,
                usuario_red_control,
                ananam: data?.nombres + " " + data?.apellidos,
            });
        } catch (e) {
            console.log(e);
        }
    }, [data.nombres, data.apellidos, data.anapai]);



    return (
        <AuthenticatedLayout user={auth.user} header={
        <div className="flex justify-between w-full">
            <BackEmpleados/>    
        <p>Alta de empleado</p>
        </div>
        }
        >
            <Head title="Alta" />

            <SanForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                errors={errors}
                areas={areas}
                posiciones={posiciones}
                jefes={jefes}
                horarios={horarios}
            >
                <div>
                    <div className="flex w-full justify-center">
                        <button
                            className="my-10 bg-blue-500 text-white px-5 py-4 hover:bg-blue-700 rounded-xl"
                            onClick={handleSubmit}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </SanForm>
        </AuthenticatedLayout>
    );
}

export default Create;
