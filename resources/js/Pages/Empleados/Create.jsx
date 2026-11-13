import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useEffect, useState } from "react";
import { CrearEmpleado } from "@/Helpers/CrearEmpleado";
import SanForm from "./Partials/SanForm";
import BackEmpleados from "./components/BackEmpleados";

function Create({
    auth,
    anacods,
    jefes,
    areas,
    posiciones,
    horarios,
    presupuestosCentrosCosto = [],
    presupuestosCuentas = [],
    presupuestosWarning = null,
}) {
    const { fechaActual } = ManejoFechas();
    const [errors, setErrors] = useState({});
    const [crearEnPresupuestos, setCrearEnPresupuestos] = useState(false);
    const [presupuestosCcCuentas, setPresupuestosCcCuentas] = useState([]);
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
        freelance: false,
        jefaturas: [],
    });

    const { generatePassword, makeAnacod } = CrearEmpleado();

    // Errores que ya se muestran junto a su campo dentro de SanForm.
    const erroresDeCampo = [
        "anacod", "ananam", "anapai", "anamai", "anasta", "anatel", "anarea",
        "anarad", "anajef", "folcod", "folcodreal", "anaext", "anapos",
        "anames", "anadia", "fecha_ingreso", "horario_id", "isBoss",
        "lider_area", "anaimg", "usuario_mensajeria", "usuario_red_control",
        "salario", "cuenta", "imei", "imei_real", "sim", "sim_real",
        "anapas", "direccion", "anatel_real",
    ];

    const erroresGenerales = Object.entries(errors || {}).filter(
        ([key]) => !erroresDeCampo.includes(key),
    );

    const handleSubmit = (e) => {
        const payload = {
            ...data,
            crear_en_presupuestos: crearEnPresupuestos,
        };
        // Solo se envia el array de combinaciones cuando el checkbox esta marcado.
        // Si se manda vacio, el backend lo interpreta como "sin combinaciones".
        if (crearEnPresupuestos) {
            payload.presupuestos_cc_cuentas = presupuestosCcCuentas;
        }
        router.visit(route("empleados.store"), {
            method: "post",
            data: payload,
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

            {erroresGenerales.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-semibold text-sm mb-1">
                        Hay errores en el formulario:
                    </p>
                    <ul className="list-disc pl-5 text-xs space-y-0.5">
                        {erroresGenerales.map(([key, msgs]) => (
                            <li key={key}>
                                <strong>{key}:</strong>{" "}
                                {Array.isArray(msgs) ? msgs[0] : msgs}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <SanForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                errors={errors}
                areas={areas}
                posiciones={posiciones}
                jefes={jefes}
                horarios={horarios}
                presupuestos={{
                    mode: "create",
                    anacod: data.anacod,
                    centrosCosto: presupuestosCentrosCosto,
                    cuentas: presupuestosCuentas,
                    value: presupuestosCcCuentas,
                    onChange: setPresupuestosCcCuentas,
                    enabled: crearEnPresupuestos,
                    onEnabledChange: setCrearEnPresupuestos,
                    errors,
                    warning: presupuestosWarning,
                }}
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
