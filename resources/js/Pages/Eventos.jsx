import Table from "@/Components/Table";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Eventos({ auth, asistencias, date = "" }) {
    const [fecha, setFecha] = useState(date);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            accion_personal: "",
            users_id: selectedUsers,
        });

    const handleCheck = (e, id) => {
        e.target.checked
            ? setSelectedUsers([...selectedUsers, id])
            : selectedUsers.includes(id) &&
              setSelectedUsers(selectedUsers.filter((item) => item !== id));

        setData({ ...data, users_id: selectedUsers });
    };

    const handleClickAccion = (e) => {
        e.preventDefault();
        patch(route("acciones.update"), {
            preserveScroll: true,
            onSuccess: () => console.log("actualizados"),
            onError: (errors) => {

                console.log(errors)
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: 'Debes seleccionar uno o mas usuarios y agregar una accion de personal',
                   showConfirmButton: false,
                    timer: 1500
                  });
            },
        });



    };

    const handleChange = (e) => {
        setFecha(e.target.value);
    };

    const handleChangeAccion = (e) => {
        setData({ ...data, accion_personal: e.target.value });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Asistencia
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="flex justify-between mt-10 mb-5">
                            <div className="flex justify-between mx-20 my-5">
                                <div>
                                    <input
                                        type="date"
                                        name=""
                                        id=""
                                        className="rounded-xl"
                                        value={fecha}
                                        onChange={handleChange}
                                    />
                                    <Link
                                        className="mx-5 py-2 bg-blue-500 px-5 rounded-xl text-white hover:bg-blue-700"
                                        href={route("asistencia.fecha", fecha)}
                                        id="inp_fecha"
                                    >
                                        Buscar
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <div className="px-10">
                                    <p className="mb-5 text-wrap">
                                        Agregar o seleccionar una accion de
                                        personal para los empleados
                                        seleccionador
                                    </p>
                                    <div className="lg:grid lg:grid-cols-3">
                                        <input
                                            type="text"
                                            className="rounded-xl h-10"
                                            value={data.accion_personal}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    accion_personal:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <select
                                            name=""
                                            id=""
                                            className="rounded-xl mr-5 h-10"
                                            onChange={handleChangeAccion}
                                        >
                                            <option value="">
                                                Acciones de personal
                                            </option>
                                            <option value="Vacaciones">
                                                Vacaciones
                                            </option>
                                            <option value="Asueto">
                                                Asueto
                                            </option>
                                            <option value="Incapacidad">
                                                Incapacidad
                                            </option>
                                        </select>

                                            <button
                                                onClick={handleClickAccion}
                                                className="bg-blue-500 px-5 py-2 rounded-xl text-white hover:bg-blue-700"
                                            >
                                                Agregar
                                            </button>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <Table
                            asistencias={asistencias}
                            handleCheck={handleCheck}
                        ></Table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
