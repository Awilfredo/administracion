import DangerButton from "@/Components/DangerButton";
import { DeleteIcon } from "@/Components/DeleteIcon";
import EditIcon from "@/Components/EditIcon";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import PrimaryButtonBlue from "@/Components/PrimaryButtonBlue";
import Search from "@/Components/Search";
import TextInput from "@/Components/TextInput";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useId, useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { router } from "@inertiajs/react";
import DiaRango from "@/Components/DiaRango";

export default function Eventos({ auth }) {
    const [asistencias, setAsistencias] = useState([]);
    const { fechaActual } = ManejoFechas();
    const [fechas, setFechas] = useState({
        fecha: fechaActual(),
        fecha_fin: null,
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const idInputAccion = useId();
    const [resultados, setResultados] = useState([...asistencias]);
    const [showModal, setShowModal] = useState(false);
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            id: null,
            anacod: "",
            ananam: "",
            accion_personal: "",
            fecha: fechas.fecha,
        });

    const handleClickEditMultiActions = (e) => {
        e.preventDefault();
        if (selectedRows.length) {
            setData({ ...data, ids: selectedRows.map((objeto) => objeto.id) });

            patch(route("acciones.update"), {
                data: {
                    ids: selectedRows.map((objeto) => objeto.id).join(","),
                    accion_personal: data.accion_personal,
                    fecha: fechas.fecha,
                },
                preserveScroll: true,
                onSuccess: (response) => {
                    getData();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Se ha cambiado la accion de personal",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
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
        }
    };

    useEffect(() => {
        getData();
        console.log(fechas);
    }, [fechas]);

    useEffect(() => {
        setResultados(asistencias);
    }, [asistencias]);

    const getData = () => {
        let url = route("eventos") + `?fecha=${fechas.fecha}`;
        if (fechas.fecha != fechas.fecha_fin && fechas.fecha_fin) {
            url =
                route("eventos") +
                `?fecha=${fechas.fecha}` +
                (fechas.fecha_fin ? `&fecha_fin=${fechas.fecha_fin}` : "");
        }

        console.log(url);

        fetch(url)
            .then((response) => response.json())
            .then((res) => {
                setAsistencias(res.data);
            });
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
            wrap:true,
            minWidth: '200px',
            maxWidth:'300px'
        },
        {
            name: "Evento",
            selector: (row) => row.evento,
            sortable: true,
        },
        {
            name: "Accion",
            selector: (row) =>
                row.accion_personal ? row.accion_personal : "Sin accion",
            sortable: true,
        },

        {
            name: "OPCIONES",
            selector: (row) => {
                return (
                    <div>
                        <button
                            onClick={() =>
                                handleClickEdit(
                                    row.id,
                                    row.anacod,
                                    row.ananam,
                                    row.accion_personal
                                )
                            }
                        >
                            <EditIcon className="text-blue-500 hover:text-blue-700"></EditIcon>
                        </button>
                        <button
                            onClick={() =>
                                handleClickDelete(row.id, row.accion_personal)
                            }
                        >
                            <DeleteIcon className="text-red-500 hover:text-red-700"></DeleteIcon>
                        </button>
                    </div>
                );
            },
        },
    ];

    const handleClickEdit = (id, anacod, ananam, accion_personal) => {
        setData({ id, anacod, ananam, accion_personal });
        setShowModal(true);
    };

    const handleClickDelete = async (id, accion_personal) => {
        setData({ ...data, id });
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (accion_personal) {
            Swal.fire({
                title: "Seguro?",
                text: "Deseas eliminar esta accion de personal?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Si, eliminar!",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    router.patch(
                        route("asistencia.delete"),
                        { id },
                        {
                            preserveScroll: true,
                            onSuccess: (response) => {
                                getData();
                                Swal.fire({
                                    position: "center",
                                    icon: "success",
                                    title: "Se ha cambiado la accion de personal",
                                    showConfirmButton: false,
                                    timer: 1500,
                                });
                            },
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
                        }
                    );
                }
            });
            //asistencia.delete
        } else {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: "Este usuario no tiene accion de personal para este evento",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };
    const handleChangeSelected = ({ selectedRows }) => {
        setSelectedRows(selectedRows);
    };

    const handleSaveAction = () => {
        if (data.accion_personal.trim()) {
            patch(route("asistencia.update"), {
                preserveScroll: true,
                onSuccess: (response) => {
                    getData();
                    setShowModal(false);
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Se ha cambiado la accion de personal",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
                onError: (errors) => {
                    console.log(errors);
                    Swal.fire({
                        position: "center",
                        icon: "warning",
                        title: "Error al actualizar la accion de personal",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
            });
        } else {
            Swal.fire({
                position: "center",
                icon: "warning",
                title: "Debes escribir una accion valida",
                showConfirmButton: false,
                timer: 1500,
            });
        }
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

            <div className="py-2 px-5">
                <div className="grid grid-cols-2 my-5">
                    <DiaRango fechas={fechas} setFechas={setFechas}></DiaRango>

                    {selectedRows.length ? (
                        <div>
                            <div className="px-10">
                                <p className="mb-5 text-wrap">
                                    Agregar accion de personal para los
                                    empleados seleccionador
                                </p>
                                <div className="flex justify-between flex-wrap">
                                    <div>
                                        <input
                                            list={idInputAccion}
                                            type="text"
                                            className="rounded-xl h-10"
                                            value={data.accion_personal}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    accion_personal:
                                                        e.target.value
                                                            .trim()
                                                            .toUpperCase(),
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
                                            <option value="Asueto">
                                                Asueto
                                            </option>
                                            <option value="Incapacidad">
                                                Incapacidad
                                            </option>
                                        </datalist>
                                    </div>

                                    <button
                                        onClick={handleClickEditMultiActions}
                                        className="bg-blue-500 px-5 py-2 rounded-xl text-white hover:bg-blue-700"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg rounded-xl">
                    <Search
                        datos={asistencias}
                        setResultados={setResultados}
                        keys={["anacod"]}
                        placeholder="Filtrar usuarios"
                    ></Search>
                    <DataTable
                        data={resultados}
                        columns={columns}
                        fixedHeader={true}
                        title={"Eventos del " + fechas.fecha + (fechas.fecha_fin ? `  HASTA  ${fechas.fecha_fin}`: '')}
                        selectableRows
                        onSelectedRowsChange={handleChangeSelected}
                    ></DataTable>
                </div>
            </div>

            <Modal show={showModal}>
                <div>
                    <p className="mx-5 text-lg mt-5">
                        EDITAR ACCION DE PERSONAL PARA {data.ananam}
                    </p>
                    <div>
                        <div className="flex mt-5 flex-wrap justify-around">
                            <div>
                                <InputLabel value={"Usuario:"}></InputLabel>
                                <TextInput
                                    label="Usuario:"
                                    placeholder="Digita el usuario de SAN"
                                    value={data.anacod}
                                    disabled
                                ></TextInput>
                            </div>
                            <div>
                                <InputLabel value={"Accion:"}></InputLabel>
                                <TextInput
                                    value={
                                        data.accion_personal
                                            ? data.accion_personal
                                            : ""
                                    }
                                    placeholder="Incapacidad"
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            accion_personal:
                                                e.target.value.toUpperCase(),
                                        })
                                    }
                                ></TextInput>
                            </div>
                        </div>
                        <div className="my-5 flex gap-4 justify-end mx-5">
                            <PrimaryButtonBlue onClick={handleSaveAction}>
                                Guardar
                            </PrimaryButtonBlue>
                            <DangerButton onClick={() => setShowModal(false)}>
                                Cancelar
                            </DangerButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
