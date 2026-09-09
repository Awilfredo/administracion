import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import PrimaryButtonBlue from "@/Components/PrimaryButtonBlue";
import { Link, router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const san = [
    { sistema: "SAN", modulo: "Directorio", subModulos: [] },
    { sistema: "SAN", modulo: "Reportes", subModulos: [] },
    { sistema: "SAN", modulo: "Indicadores", subModulos: ["Flash"] },
    { sistema: "SAN", modulo: "HelpDesk", subModulos: [] },
    { sistema: "SAN", modulo: "Tele gestion", subModulos: [] },
    { sistema: "SAN", modulo: "Pre-oferta", subModulos: [] },
    { sistema: "SAN", modulo: "Oferta", subModulos: [] },
    {
        sistema: "SAN",
        modulo: "Cliente",
        subModulos: ["Consulta integral", "Consulta cliente", "Consulta anexo"],
    },
    { sistema: "SAN", modulo: "Reclamos", subModulos: [] },
    { sistema: "SAN", modulo: "Presupuesto", subModulos: [] },
    { sistema: "SAN", modulo: "Facturacion y refacturacion", subModulos: [] },
    { sistema: "SAN", modulo: "Activo fijo", subModulos: [] },
    { sistema: "SAN", modulo: "Facturacion especial", subModulos: [] },
    { sistema: "SAN", modulo: "Flash", subModulos: [] },
    { sistema: "SAN", modulo: "Reclamos/Gest Post Venta", subModulos: [] },
    { sistema: "SAN", modulo: "Prospeccion comercial", subModulos: [] },
    { sistema: "SAN", modulo: "Retencion/Migracion", subModulos: [] },
    { sistema: "SAN", modulo: "Financiero", subModulos: ["Aplicar pagos"] },
    {
        sistema: "SAN",
        modulo: "RRHH",
        subModulos: [
            "Requisicion de personal",
            "Acciones de personal",
            "Uso de vehiculo",
        ],
    },
];

const control = [
    {
        sistema: "RED CONTROL",
        modulo: "Supervisor",
        subModulos: [
            "Resumen General",
            "Resumen Individual",
            "Eventos",
            "Ruta Online",
            "Organigrama",
            "Ubicacion general",
        ],
    },
    {
        sistema: "RED CONTROL",
        modulo: "Agenda",
        subModulos: ["Mi agenda", "Administrar", "Ruta", "Cita masiva"],
    },
    {
        sistema: "RED CONTROL",
        modulo: "Cartera",
        subModulos: [
            "Mi cartera",
            "Administrar",
            "Asignar clientes",
            "Carga masiva",
        ],
    },
    {
        sistema: "RED CONTROL",
        modulo: "Indicadores",
        subModulos: ["Lider", "Ejecutivo"],
    },
    {
        sistema: "RED CONTROL",
        modulo: "ForeCast",
        subModulos: ["Clientes", "Servicio", "Visita", "Ventas"],
    },
    {
        sistema: "RED CONTROL",
        modulo: "Paquetes",
        subModulos: [
            "Ingreso masivo",
            "Asignar masivo",
            "Paquetes finalizado",
            "Ingreso",
            "Asignar",
            "Seguimiento",
            "Cobertura",
            "Zona",
        ],
    },
    {
        sistema: "RED CONTROL",
        modulo: "Ubica",
        subModulos: ["Resumen", "Geocercas", "Grupo Geocerca"],
    },
    { sistema: "RED CONTROL", modulo: "Reportes", subModulos: [] },
    { sistema: "RED CONTROL", modulo: "Acme", subModulos: [] },
    {
        sistema: "RED CONTROL",
        modulo: "Mantenimiento",
        subModulos: ["Configurar", "Usuario", "Cita", "Paquete"],
    },
];

const Formulario = ({ anacod }) => {
    const [sanOptions, setSanOptions] = useState({});
    const [controlOptions, setControlOptions] = useState({});
    const [mensajeria, setIsMensajeria] = useState(false);
    const [administracion, setIsAdministracion] = useState(false);
    const [miRed, setIsMiRed] = useState(false);
    const [jarvisTools, setIsJarvisTools] = useState(false);
    const [payback, setIsPayback] = useState(false);
    const [botTelegram, setBotTelegram] = useState(false);
    const [sap, setSap] = useState(false);
    const [otros, setOtros] = useState("");

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSanOptions((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const handleCheckboxControlChange = (e) => {
        const { name, checked } = e.target;
        setControlOptions((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const [puesto, setPuesto] = useState("");
    useEffect(() => {
        console.log(sanOptions, controlOptions);
    }, [sanOptions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (puesto != "") {
            const send_data = {
                anacod,
                puesto,
                modulos: JSON.stringify({
                    sanOptions,
                    controlOptions,
                    mensajeria,
                    sap,
                    administracion,
                    miRed,
                    jarvisTools,
                    payback,
                    botTelegram,
                    otros,
                }),
            };
            router.post(route("formulario.store"),send_data, {
                preserveScroll: true,
                onFinish:()=>{
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Formulario enviado correctamente, gracias por su colaboracion",
                        showConfirmButton: false,
                        timer: 3000,
                }).then(e=>{
                    window.location.href='http://san.red.com.sv'

                })
            }
            });
            console.log("Selected options:", send_data);
        } else {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: "Debes seleccionar la posicion en la que te desempeñas",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    };

    const handleClosePage = (e) => {
        window.close();
    };

    return (
        <div className="px-5 mt-10">
            <div className="flex text-2xl mb-10">
                <strong>USUARIO:</strong>
                <p className="mx-5">{anacod}</p>
            </div>
            <div>
                <label for="puestos" className="mr-10 text-2xl">
                    <strong>SELECCIONA TU PUESTO:</strong>
                </label>
                <select
                    id="puestos"
                    name="puestos"
                    className="rounded mb-10"
                    value={puesto}
                    onChange={(e) => setPuesto(e.target.value)}
                >
                    <option value=""></option>
                    <option value="lider sac">LÍDER SAC</option>
                    <option value="gerente it rrhh mso">
                        GERENTE IT Y RRHH - IT. RRHH Y MSO
                    </option>
                    <option value="jefe legal data red">
                        JEFE LEGAL - DATA RED
                    </option>
                    <option value="lider operaciones finanzas cobro activaciones y bodega">
                        LÍDER DE OPERACIONES - FINANZAS, COBRO, ACTIVACIONES Y
                        BODEGA
                    </option>
                    <option value="ejecutivo sac">Ejecutivo SAC</option>
                    <option value="ejecutivo cac">Ejecutivo CAC</option>
                    <option value="tecnico de campo sac">
                        Técnico de campo SAC
                    </option>
                    <option value="auxiliar de operaciones (taller sac)">
                        Auxiliar de Operaciones (Taller SAC)
                    </option>
                    <option value="auxiliar de rrhh reclutamiento">
                        Auxiliar de RRHH Reclutamiento
                    </option>
                    <option value="auxiliar de rrhh planilla">
                        Auxiliar de RRHH Planilla
                    </option>
                    <option value="auxiliar administrativo recepcion">
                        Auxiliar administrativo Recepción
                    </option>
                    <option value="tecnico de soporte it">
                        Técnico de soporte IT
                    </option>
                    <option value="especialista de redes y servidores it">
                        Especialista de redes y servidores IT
                    </option>
                    <option value="especialista sap">Especialista SAP</option>
                    <option value="analista programador">
                        Analista programador
                    </option>
                    <option value="tecnico mso">Técnico MSO</option>
                    <option value="contador">Contador</option>
                    <option value="auxiliar contable tesoreria">
                        Auxiliar contable Tesorería
                    </option>
                    <option value="auxiliar contable cuenta x pagar y facturacion">
                        Auxiliar contable Cuenta x Pagar y Facturación
                    </option>
                    <option value="ejecutivo de cobros">
                        Ejecutivo de cobros
                    </option>
                    <option value="ejecutivo de activaciones">
                        Ejecutivo de activaciones
                    </option>
                    <option value="supervisor de bodega">
                        Supervisor de bodega
                    </option>
                    <option value="tecnico refurbished">
                        Técnico refurbished
                    </option>
                    <option value="tecnico taller">Técnico Taller</option>
                    <option value="ejecutivo de ventas datared">
                        Ejecutivo de ventas Datared
                    </option>
                    <option value="ejecutivo de ventas">
                        Ejecutivo de ventas
                    </option>
                    <option value="ejecutivo de retenciones">
                        Ejecutivo de retenciones
                    </option>
                    <option value="analista de mercadeo">
                        Analista de mercadeo
                    </option>
                    <option value="auxiliar de logistica">
                        Auxiliar de logística
                    </option>
                    <option value="especialista de plataformas">
                        Especialista de Plataformas
                    </option>
                    <option value="supervisor de bodega y produccion refurbished">
                    Supervisor de Bodega y Producción Refurbished
                    </option>
                    <option value="analista de creditos y activaciones">
                    Analista de Créditos y Activaciones  - Activaciones
                    </option>
                </select>
            </div>

            <form onSubmit={handleSubmit}>
                <h3 className="text-4xl text-center mb-5 text-gray-800">
                    Selecciona los módulos de <strong>SAN</strong> o sub-módulos
                    que usas
                </h3>
                <div className="grid grid-cols-2 bg-gray-200 p-5 rounded-xl gap-1">
                    {san.map((item, index) => (
                        <div key={index}>
                            <fieldset className="flex mt-5 flex-wrap">
                                <legend className="text-xl">
                                    {item.modulo}
                                </legend>
                                <label>
                                    <input
                                        type="checkbox"
                                        name={item.modulo}
                                        checked={
                                            sanOptions[item.modulo] || false
                                        }
                                        onChange={handleCheckboxChange}
                                    />
                                    {item.modulo}
                                </label>
                                {item.subModulos.map((subModulo, subIndex) => (
                                    <div
                                        key={subIndex}
                                        style={{ marginLeft: "20px" }}
                                    >
                                        <label>
                                            <input
                                                type="checkbox"
                                                name={`${item.modulo}-${subModulo}`}
                                                checked={
                                                    sanOptions[
                                                        `${item.modulo}-${subModulo}`
                                                    ] || false
                                                }
                                                onChange={handleCheckboxChange}
                                            />
                                            {subModulo}
                                        </label>
                                    </div>
                                ))}
                            </fieldset>
                        </div>
                    ))}
                </div>

                <div className="mt-10">
                    <h3 className="text-4xl text-center text-gray-800">
                        Selecciona los módulos de <strong>RED CONTROL</strong> o
                        sub-módulos que usas
                    </h3>
                    <div className="grid grid-cols-2 bg-gray-200 p-5 rounded-xl">
                        {control.map((item, index) => (
                            <div key={index}>
                                <fieldset className="flex mt-10 flex-wrap mx-4">
                                    <legend className="text-xl">
                                        {item.modulo}
                                    </legend>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name={item.modulo}
                                            checked={
                                                controlOptions[item.modulo] ||
                                                false
                                            }
                                            onChange={
                                                handleCheckboxControlChange
                                            }
                                        />
                                        {item.modulo}
                                    </label>
                                    {item.subModulos.map(
                                        (subModulo, subIndex) => (
                                            <div
                                                key={subIndex}
                                                style={{ marginLeft: "20px" }}
                                                className=" "
                                            >
                                                <label className="mx-1">
                                                    <input
                                                        type="checkbox"
                                                        name={`${item.modulo}-${subModulo}`}
                                                        checked={
                                                            controlOptions[
                                                                `${item.modulo}-${subModulo}`
                                                            ] || false
                                                        }
                                                        onChange={
                                                            handleCheckboxControlChange
                                                        }
                                                    />
                                                    {subModulo}
                                                </label>
                                            </div>
                                        )
                                    )}
                                </fieldset>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl mt-10">
                        Selecciona otras plataformas que usas:
                    </h2>
                    <div className="text-xl ms-3">
                        <label>
                            <input
                                type="checkbox"
                                name="mensajeria"
                                checked={mensajeria}
                                onChange={(e) => setIsMensajeria(!mensajeria)}
                            />
                            Mensajería
                        </label>
                        <br />

                        <label>
                            <input
                                type="checkbox"
                                name="mensajeria"
                                checked={sap}
                                onChange={(e) => setSap(!sap)}
                            />
                            SAP
                        </label>
                        <br />

                        <label>
                            <input
                                type="checkbox"
                                name="administracion"
                                checked={administracion}
                                onChange={(e) =>
                                    setIsAdministracion(!administracion)
                                }
                            />
                            Administración
                        </label>
                        <br />

                        <label>
                            <input
                                type="checkbox"
                                name="miRed"
                                checked={miRed}
                                onChange={(e) => setIsMiRed(!miRed)}
                            />
                            Mi Red
                        </label>
                        <br />

                        <label>
                            <input
                                type="checkbox"
                                name="jarvisTools"
                                checked={jarvisTools}
                                onChange={() => setIsJarvisTools(!jarvisTools)}
                            />
                            JarvisTools
                        </label>
                        <br />

                        <label>
                            <input
                                type="checkbox"
                                name="payback"
                                checked={payback}
                                onChange={() => setIsPayback(!payback)}
                            />
                            Payback
                        </label>
                        <br />
                        <label>
                            <input
                                type="checkbox"
                                name="telegram"
                                checked={botTelegram}
                                onChange={() => setBotTelegram(!botTelegram)}
                            />
                            Bot Telegram
                        </label>
                        <br />
                    </div>
                </div>
                <br />
                <label htmlFor="otros">
                    Digita otros sistemas que uses separados por coma
                </label>
                <br />
                <textarea
                    name=""
                    id=""
                    value={otros}
                    onChange={(e) => setOtros(e.target.value)}
                    className="w-full h-20"
                ></textarea>
                <br />
                <br />
                <button
                    type="submit"
                    className="bg-blue-500 p-2 mt-10 text-white hover:bg-gray-500 rounded w-20 mb-10"
                >
                    Enviar
                </button>
            </form>

            <Modal show={!anacod}>
                <div className="p-5">
                    <strong>
                        Debes loguearte en san y seguir el link que se ha
                        colocado en el inicio para poder realizar este
                        formulario{" "}
                    </strong>

                    <div className="mt-20 flex justify-end mr-20 text-blue-500">
                        <a
                            className="p-2 text-white bg-blue-500 px-5 rounded hover:bg-blue-700 "
                            href="http://san.red.com.sv"
                        >
                            IR A SAN
                        </a>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Formulario;
