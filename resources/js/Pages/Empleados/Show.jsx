import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import { useState } from "react";
import SanForm from "./Partials/SanForm";
import EditIcon from "@/Components/EditIcon";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import BackEmpleados from "./components/BackEmpleados";
import PerfilAplicaciones from "@/Components/PerfilAplicaciones";
import Nav from "./Partials/Nav";

const ShowEmpleado = ({
    auth,
    empleado,
    anacods,
    jefes,
    areas,
    posiciones,
    horarios,
    redControl,
    mensajeria,
    presupuesto = null,
    presupuestoLive = null,
    presupuestosCentrosCosto = [],
    presupuestosCuentas = [],
    presupuestosWarning = null,
}) => {
    const [disabled, setDisabled] = useState(true);
    const defaultData = {
        anacod: empleado.anacod ? empleado.anacod : "", // Validación
        ananam: empleado.ananam ? empleado.ananam : "",
        anapas: empleado.anapas ? empleado.anapas : "",
        anapai: empleado.anapai ? empleado.anapai : "",
        anamai: empleado.anamai ? empleado.anamai : "",
        anatel: empleado.anatel ? empleado.anatel : "",
        anarea: empleado.anarea ? empleado.anarea : "",
        anarad: empleado.anarad ? empleado.anarad : "",
        anajef: empleado.anajef ? empleado.anajef : "",
        folcod: empleado.folcod ? empleado.folcod : "",
        folcodreal: empleado.folcodreal ? empleado.folcodreal : "",
        anaext: empleado.anaext ? empleado.anaext : "",
        anapos: empleado.anapos ? empleado.anapos : "",
        anames: empleado.anames ? empleado.anames : "",
        anadia: empleado.anadia ? empleado.anadia : "",
        fecha_ingreso: empleado.fecha_ingreso ? empleado.fecha_ingreso : "",
        horario_id: empleado.horario_id ? empleado.horario_id : "",
        lider_area: empleado.lider_area ? empleado.lider_area : "",
        freelance: empleado.freelance ? empleado.freelance : "",
    };
    const [data, setData] = useState(defaultData);
    const [errors, setErrors] = useState({});
    const [presupuestosCcCuentas, setPresupuestosCcCuentas] = useState(() => {
        const live = Array.isArray(presupuestoLive?.cc_cuentas) ? presupuestoLive.cc_cuentas : null;
        const local = Array.isArray(presupuesto?.cc_cuentas) ? presupuesto.cc_cuentas : null;
        return (live && live.length > 0) ? live : (local || []);
    });
    const [preview, setPreview] = useState(null);
    const [foto, setFoto] = useState([]);
    const [fotoPerfil, setFotoPerfil] = useState(
        `http://172.17.10.31/img/user/${empleado.anaimg}?${Date.now()}`
    );
    const { fechaActual } = ManejoFechas();
    const [fechaBaja, setFechaBaja] = useState(fechaActual());
    const [showBaja, setShowBaja] = useState(false);
    console.log(redControl);
    console.log(mensajeria);

    // Función para manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    // Función para guardar cambios
    const handleSave = () => {
        const postData = {
            ...empleado,
            anacod: data.anacod ? data.anacod : null, // Validación
            ananam: data.ananam ? data.ananam : null,
            anapas: data.anapas ? data.anapas : null,
            anapai: data.anapai ? data.anapai : null,
            anamai: data.anamai ? data.anamai : null,
            anatel: data.anatel ? data.anatel : null,
            anarea: data.anarea ? data.anarea : null,
            anarad: data.anarad ? data.anarad : null,
            anajef: data.anajef ? data.anajef : null,
            folcod: data.folcod ? data.folcod : null,
            folcodreal: data.folcodreal ? data.folcodreal : null,
            anaext: data.anaext ? data.anaext : null,
            anapos: data.anapos ? data.anapos : null,
            anames: data.anames ? data.anames : null,
            anadia: data.anadia ? data.anadia : null,
            fecha_ingreso: data.fecha_ingreso ? data.fecha_ingreso : null,
            horario_id: data.horario_id ? data.horario_id : null,
            lider_area: data.lider_area ? data.lider_area : null,
            freelance: data.freelance ? data.freelance : null,
            presupuestos_cc_cuentas: presupuesto?.presupuestos_user_id ? presupuestosCcCuentas : undefined,
        };
        console.log(postData);
        router.patch(
            route("empleados.update", { anacod: empleado.anacod }),
            postData,
            {
                preserveState: false,
                onError: (errors) => {
                    setErrors(errors);
                    console.log(errors);
                },
                onSuccess: () => {
                    setDisabled(true);
                    Swal.fire({
                        title: "¡Éxito!",
                        text: "Se ha actualizado el empleado con éxito",
                        icon: "success",
                        timmer: 2500,
                    });
                },
            }
        );
    };

    const handleRetryPresupuesto = () => {
        if (!presupuesto) return;
        const ccCuentas = (presupuesto.cc_cuentas && presupuesto.cc_cuentas.length > 0)
            ? presupuesto.cc_cuentas
            : presupuestosCcCuentas;
        if (!ccCuentas || ccCuentas.length === 0) {
            Swal.fire({
                title: "Sin combinaciones",
                text: "Este empleado no tiene combinaciones cc/cuenta almacenadas. Edite el empleado para asignarlas y vuelva a intentarlo.",
                icon: "warning",
            });
            return;
        }
        router.post(
            route("empleados.presupuesto.retry", { anacod: empleado.anacod }),
            { presupuestos_cc_cuentas: ccCuentas },
            {
                preserveState: false,
                onSuccess: () => {
                    Swal.fire({
                        title: "Reintento enviado",
                        text: "Se intentó crear el usuario en Presupuestos nuevamente.",
                        icon: "success",
                        timer: 2500,
                    });
                },
                onError: (errors) => {
                    const msg = errors?.presupuesto?.[0] || errors?.message || "No se pudo reintentar.";
                    Swal.fire({ title: "Error", text: msg, icon: "error" });
                },
            }
        );
    };

    const renderPresupuestoCard = () => {
        if (!presupuesto) return null;
        const status = presupuesto.sync_status;
        const isError = status === "error";
        const isOk = status === "ok";
        const userId = presupuesto.presupuestos_user_id;
        const liveRoles = Array.isArray(presupuestoLive?.roles) ? presupuestoLive.roles : [];
        const liveCcCuentas = Array.isArray(presupuestoLive?.cc_cuentas) ? presupuestoLive.cc_cuentas : [];

        return (
            <div className="bg-white p-5 mt-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <p className="text-lg font-semibold">Presupuestos</p>
                        <hr className="h-1 mt-2 bg-blue-800" />
                    </div>
                    <span
                        className={
                            "px-3 py-1 rounded-full text-xs font-semibold " +
                            (isOk
                                ? "bg-green-100 text-green-700"
                                : isError
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700")
                        }
                    >
                        {isOk ? "Sincronizado" : isError ? "Con error" : "Pendiente"}
                    </span>
                </div>

                {userId && (
                    <p className="text-sm text-gray-600 mb-2">
                        ID Presupuestos: <span className="font-mono">{userId}</span>
                        {presupuestoLive?.email && (
                            <span className="ml-3">· Email: <span className="font-mono">{presupuestoLive.email}</span></span>
                        )}
                    </p>
                )}

                {liveRoles.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                        Rol: <span className="font-semibold">{liveRoles.map((r) => r.name).join(", ")}</span>
                    </p>
                )}

                {liveCcCuentas.length > 0 && (
                    <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Asignaciones:</p>
                        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                            {liveCcCuentas.map((c, i) => (
                                <li key={i}>
                                    CC #{c.centro_costo_id} · Cuenta #{c.cuenta_id}
                                    {c.is_aprobador && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                            Aprobador
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {presupuesto.last_synced_at && (
                    <p className="text-xs text-gray-400 mt-2">
                        Última sincronización: {new Date(presupuesto.last_synced_at).toLocaleString()}
                    </p>
                )}

                {isError && presupuesto.last_error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded">
                        <p className="text-sm text-red-800 font-semibold">Error:</p>
                        <p className="text-sm text-red-700">{presupuesto.last_error}</p>
                    </div>
                )}

                {isError && !presupuesto.hasCodeConflict && (
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleRetryPresupuesto}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Reintentar creación
                        </button>
                    </div>
                )}

                {isError && presupuesto.hasCodeConflict && (
                    <p className="mt-3 text-xs text-red-600 italic">
                        Conflicto de código en Presupuestos. Contacte al administrador para reasignar.
                    </p>
                )}
            </div>
        );
    };

    const handleClickBaja = (e) => {
        Swal.fire({
            title: `Estas seguro?`,
            text: `Quieres dar de baja a ${empleado.anacod}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            customClass: {
                actions: "flex gap-4",
                confirmButton:
                    "bg-blue-500 hover:bg-blue-700 text-white p-2 rounded",
                cancelButton:
                    "bg-red-500 text-white p-2 rounded hover:bg-red-700",
            },
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(
                    route("empleados.baja", { anacod: empleado.anacod }),
                    {
                        data: { anacod: empleado.anacod, fechaBaja: fechaBaja },
                    }
                );
                Swal.fire({
                    title: "Exito!",
                    text: "Se ha dado de baja exitosamente.",
                    icon: "success",
                    timer: 2500,
                }).then(() => router.visit(route("empleados.index")));
            }
        });
    };

    const handleCancel = (e) => {
        setDisabled(true);
        setData(empleado);
    };

    const handleChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result); // Guardar la URL generada en el estado
                setFotoPerfil(reader.result);
            };
            reader.readAsDataURL(file);
            setFoto(file);
        }
    };

    const handleSaveImagen = (e) => {
        const formData = new FormData();
        formData.append("image", foto);
        formData.append("anacod", empleado.anacod);
        fetch("http://172.17.10.31/empleado/uploadImage", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    catchError(response);
                }
            })
            .then((data) => {
                console.log(data);
                swal.fire({
                    title: "¡Éxito!",
                    text: "Se ha guardado la imagen con éxito",
                    icon: "success",
                    timer: 2500,
                });
                setPreview();
            });
    };

    const handleCancelSaveImagen = (e) => {
        setPreview(null);
        setFoto([]);
        setFotoPerfil(`http://172.17.10.31/img/user/${empleado.anaimg}`);
    };

    const handleCancelBaja = (e) => {
        setShowBaja(false);
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
            <Modal show={preview ? true : false}>
                <div className="m-5">
                    <h1 className="text-xl text-wrap text-gray-900 mb-10">
                        Quieres guardar esta imagen como foto de perfil para
                        este usuario?
                    </h1>
                    <div className="w-full flex justify-center my-5">
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-64 object-cover border border-gray-300 rounded-lg"
                            />
                        )}
                    </div>
                    <div className="flex justify-end space-x-4 mt-5">
                        <button
                            onClick={handleSaveImagen}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={handleCancelSaveImagen}
                            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* modal de baja */}
            <Modal show={showBaja}>
                <div className="p-5">
                    <div className="mb-10">
                        <label htmlFor="fecha_baja" className="text-lg">
                            Selecciona la fecha de baja del empleado
                        </label>
                        <div className="mt-5">
                            <TextInput
                                type="date"
                                id="fecha_baja"
                                value={fechaBaja}
                                onChange={(e) => setFechaBaja(e.target.value)}
                                max={fechaActual()}
                            ></TextInput>
                        </div>
                    </div>
                    <div className="flex justify-center w-full gap-4">
                        <DangerButton onClick={handleClickBaja}>
                            Dar de baja
                        </DangerButton>
                        <SecondaryButton onClick={handleCancelBaja}>
                            Cancelar
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Información del Empleado
                </h1>

                {/* Imagen del empleado */}
                <div className="flex flex-wrap justify-between items-center space-x-4 mb-6 gap-4">
                    <div className="relative w-32 h-32">
                        <img
                            src={fotoPerfil}
                            alt={empleado.anacod.toLowerCase()}
                            className="w-32 h-32 rounded-xl object-cover border-4 border-blue-500"
                        />
                        <label
                            className="absolute bottom-0 right-0 rounded-full bg-gray-200 p-2 hover:bg-gray-400"
                            htmlFor="foto"
                        >
                            <EditIcon className="h-6 w-6"></EditIcon>
                        </label>
                        <input
                            type="file"
                            name="foto"
                            id="foto"
                            className="hidden"
                            onChange={handleChangeImage}
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">
                            {data.ananam}
                        </h2>
                        <p className="text-gray-500">
                            {data.anapos} - {data.anarea}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {disabled && (
                            <button
                                onClick={() => setDisabled(false)}
                                className="text-blue-500 hover:text-white hover:bg-blue-500 rounded-full h-12 w-12 flex justify-center items-center"
                            >
                                <EditIcon></EditIcon>
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex">
                    <PerfilAplicaciones
                        aplicacion={"Red Control"}
                        usuario={redControl?.idusuario}
                        estado={redControl?.estado}
                        id={redControl?.id}
                        anacod={empleado.anacod}
                    ></PerfilAplicaciones>
                    <PerfilAplicaciones
                        aplicacion={"Mensajeria"}
                        usuario={mensajeria?.idusuario}
                        estado={mensajeria?.estado}
                        id={mensajeria?.id}
                        anacod={empleado.anacod}
                    ></PerfilAplicaciones>
                </div>

                {renderPresupuestoCard()}

                {data.anacod ? (
                    <SanForm
                        data={data}
                        setData={setData}
                        disabled={disabled}
                        errors={errors}
                        areas={areas}
                        posiciones={posiciones}
                        jefes={jefes}
                        horarios={horarios}
                        tipo="editar"
                        presupuestos={presupuesto?.presupuestos_user_id ? {
                            mode: "edit",
                            anacod: empleado.anacod,
                            centrosCosto: presupuestosCentrosCosto,
                            cuentas: presupuestosCuentas,
                            value: presupuestosCcCuentas,
                            onChange: setPresupuestosCcCuentas,
                            errors,
                            warning: presupuestosWarning,
                        } : null}
                    >
                        <div className="flex justify-end space-x-4 mt-6">
                            {!disabled && (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                    </SanForm>
                ) : (
                    ""
                )}

                <div className="flex w-full justify-center">
                    <DangerButton onClick={() => setShowBaja(true)}>
                        DAR DE BAJA
                    </DangerButton>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ShowEmpleado;
