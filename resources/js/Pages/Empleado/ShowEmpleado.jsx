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
        anaimg: empleado.anacod
            ? `${empleado.anacod.toLocaleLowerCase()}.jpg`
            : "", // Validación con transformación});
    };
    const [data, setData] = useState(defaultData);
    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const [foto, setFoto] = useState([]);
    const [fotoPerfil, setFotoPerfil] = useState(
        `http://san.red.com.sv/img/user/${empleado.anaimg}`
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
            anaimg: data.anacod
                ? `${data.anacod.toLocaleLowerCase()}.jpg`
                : null, // Validación con transformación
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
        fetch("http://san.red.com.sv/empleado/uploadImage", {
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
        setFotoPerfil(`http://san.red.com.sv/img/user/${empleado.anaimg}`);
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
                    <p>Alta de empleado</p>
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
