import { DeleteIcon } from "@/Components/DeleteIcon";
import EditIcon from "@/Components/EditIcon";
import Table from "@/Components/Table";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useId, useState } from "react";
import DataTable from "react-data-table-component";

export default function Eventos({ auth, asistencias, date = "" }) {
    const { fechaActual } = ManejoFechas();
    const [fecha, setFecha] = useState(fechaActual());
    console.log(asistencias);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const idInputAccion = useId();
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
                console.log(errors);
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Debes seleccionar uno o mas usuarios y agregar una accion de personal",
                    showConfirmButton: false,
                    timer: 1500,
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

    const options = () => {
        const handleClickEdit = () => {
            alert();
        };
        return (
            <div>
                <button>
                    <EditIcon className="text-green-500 hover:text-green-700"></EditIcon>
                </button>
                <button onClick={handleClickEdit}>
                    <DeleteIcon className="text-red-500 hover:text-red-700"></DeleteIcon>
                </button>
            </div>
        );
    };
    const columns = [
        {
            name: "FECHA",
            selector: (row) => row.fecha,
            sortable: true,
        },
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "NOMBRE",
            selector: (row) => row.ananam,
            sortable: true,
        },
        {
            name: "Evento",
            selector: (row) => row.evento,
            sortable: true,
        },

        {
            name: "OPCIONES",
            selector: options,
        },
    ];

    const handleChangeSelected = ({ selectedRows }) => {
        setSelectedRows(selectedRows);
        console.log(selectedRows);
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
                                    Agregar o seleccionar una accion de personal
                                    para los empleados seleccionador
                                </p>
                                <div className="lg:grid lg:grid-cols-3">
                                    <input
                                        list={idInputAccion}
                                        type="text"
                                        className="rounded-xl h-10"
                                        value={data.accion_personal}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                accion_personal: e.target.value,
                                            })
                                        }
                                    />
                                    <datalist id={idInputAccion}>
                                        <option value="">
                                            Acciones de personal
                                        </option>
                                        <option value="Vacaciones">
                                            Vacaciones
                                        </option>
                                        <option value="Asueto">Asueto</option>
                                        <option value="Incapacidad">
                                            Incapacidad
                                        </option>
                                    </datalist>

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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg rounded-xl">
                        <DataTable
                            data={asistencias}
                            columns={columns}
                            fixedHeader={true}
                            title={"Evento de " + fecha}
                            selectableRows
                            onSelectedRowsChange={handleChangeSelected}
                        ></DataTable>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
