import CardAdd from "@/Components/CardAdd";
import DangerButton from "@/Components/DangerButton";
import { DeleteIcon } from "@/Components/DeleteIcon";
import EditIcon from "@/Components/EditIcon";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import PrimaryButtonBlue from "@/Components/PrimaryButtonBlue";
import SecondaryButton from "@/Components/SecondaryButton";
import { Select } from "@/Components/Select";
import TextInput from "@/Components/TextInput";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
function Horario({ auth, horarios }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [confirmCreate, setConfirmCreate] = useState(false);
    const [horarioSeleccionado, sethorarioSeleccionado] = useState({
        nombre: "",
        id: null,
    });

    const { data, setData, post, reset, errors } = useForm({
        nombre: "",
        dia_libre1: null,
        dia_libre2: null,
    });

    useEffect(() => {
        console.log(data);
    }, [data]);

    const columns = [
        {
            name: "Dia",
            selector: (row) => {
                if (row.numero_dia == 1) return "Lunes";
                if (row.numero_dia == 2) return "Martes";
                if (row.numero_dia == 3) return "Miercoles";
                if (row.numero_dia == 4) return "Jueves";
                if (row.numero_dia == 5) return "Viernes";
                if (row.numero_dia == 6) return "Sabado";
                if (row.numero_dia == 7) return "Domingo";
            },
            sortable: true,
        },
        { name: "Entrada", selector: (row) => row.entrada, sortable: true },
        {
            name: "Salida receso",
            selector: (row) => row.salida,
            sortable: true,
        },
        {
            name: "Entrada receso",
            selector: (row) => row.entrada_almuerzo,
            sortable: true,
        },
        { name: "Salida", selector: (row) => row.salida, sortable: true },
    ];

    const handleCreate = (e) => {
        e.preventDefault();
        post(route("horario.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setConfirmingDeletion(false);
            },
            onError: (errors) => {},
        });
    };

    const closeModalCreate = (e) => {
        setConfirmCreate(false);
        reset();
    };

    const { diasDeLaSemana } = ManejoFechas();
    const closeModal = () => {
        setConfirmingDeletion(false);
        //reset();
    };

    const handleDeleteHorario = (nombre, id) => {
        sethorarioSeleccionado({ nombre: nombre, id: id });
        console.log(horarioSeleccionado);
        setConfirmingDeletion(true);
    };

    const submitDeleteHorario = (e) => {
        e.preventDefault();
        router.delete(
            route("horario.destroy", { horario: horarioSeleccionado.id }),
            { only: ["horarios"], onFinish: () => {setConfirmingDeletion(false);}, preserveScroll:true }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Horarios
                </h2>
            }
        >
            <Head title="Horarios" />

            <div className="flex justify-center w-full">
                <div className="w-full max-w-5xl">
                    <CardAdd onClick={(e) => setConfirmCreate(true)}>
                        <p className="mt-2 text-gray-800">
                            Crear nuevo horario
                        </p>
                    </CardAdd>
                    {horarios.map((element) => (
                        <div className="mt-7">
                            {/*
                            <GenericTable
                            data={element.dias}
                            nombre={element.nombre}
                            headers={headers}
                            keys={keys}
                            ></GenericTable>
                        */}

                            <DataTable
                                actions={
                                    <div>
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => router.visit(route('horario.edit', {horario:element.id}))}
                                        >
                                            <EditIcon
                                                height="32px"
                                                width="32px"
                                            ></EditIcon>
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() =>
                                                handleDeleteHorario(
                                                    element.nombre,
                                                    element.id
                                                )
                                            }
                                        >
                                            <DeleteIcon
                                                width="32px"
                                                height="32px"
                                            ></DeleteIcon>
                                        </button>
                                    </div>
                                }
                                title={element.nombre + element.id}
                                columns={columns}
                                data={element.dias}
                            ></DataTable>
                        </div>
                    ))}

                    {horarioSeleccionado.nombre ? (
                        <Modal show={confirmingDeletion} onClose={closeModal}>
                            <form
                                onSubmit={submitDeleteHorario}
                                className="p-6"
                            >
                                <h2 className="text-lg font-medium text-gray-900">
                                    Estas seguro que desea eliminar el horario{" "}
                                    {horarioSeleccionado.nombre}
                                </h2>

                                <p className="mt-1 text-sm text-gray-600">
                                    Si continuas, los datos no se podran
                                    recuperar y se debera asignar manualmente un
                                    horario a todos los empleados que estaban
                                    vinculados a este
                                </p>

                                <div className="mt-6"></div>

                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeModal}>
                                        Cancelar
                                    </SecondaryButton>

                                    <DangerButton className="ms-3">
                                        Eliminar este horario
                                    </DangerButton>
                                </div>
                            </form>
                        </Modal>
                    ) : (
                        ""
                    )}

                    <Modal show={confirmCreate} onClose={closeModalCreate}>
                        <div>
                            <form onSubmit={handleCreate} className="p-6">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Crear nuevo horario
                                </h2>

                                <div className="my-6  grid grid-cols-1 gap-4">
                                    <div className="">
                                        <div className="mb-2">
                                            <label>
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                                Nombre del horario
                                            </label>
                                        </div>
                                        <TextInput
                                            value={data.nombre}
                                            onChange={(e) =>
                                                setData(
                                                    "nombre",
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            className="w-full"
                                            placeholder="HORARIO DE MENSAJERIA"
                                        ></TextInput>
                                        <InputError
                                            className="mt-2"
                                            message={errors.nombre}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="">
                                        <div className="mb-2">
                                            <label>Dia libre 1</label>
                                        </div>
                                        <Select
                                            value={data.dia_libre1}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    dia_libre1:
                                                        e.target.value != 0
                                                            ? e.target.value
                                                            : null,
                                                })
                                            }
                                            options={[
                                                {
                                                    name: "Selecciona un dia",
                                                    value: 0,
                                                },
                                                ...diasDeLaSemana,
                                            ]}
                                        ></Select>
                                    </div>

                                    <div className="">
                                        <div className="mb-2">
                                            <label>Dia libre 2</label>
                                        </div>
                                        <Select
                                            value={data.dia_libre2}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    dia_libre2:
                                                        e.target.value != 0
                                                            ? e.target.value
                                                            : null,
                                                })
                                            }
                                            options={[
                                                {
                                                    name: "Selecciona un dia",
                                                    value: 0,
                                                },
                                                ...diasDeLaSemana,
                                            ]}
                                        ></Select>
                                        <InputError
                                            className="mt-2"
                                            message={errors.dia_libre2}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-10">
                                    <DangerButton
                                        type="button"
                                        onClick={closeModalCreate}
                                    >
                                        Cancelar
                                    </DangerButton>

                                    <PrimaryButtonBlue className="ms-3">
                                        Crear Horario
                                    </PrimaryButtonBlue>
                                </div>
                            </form>
                        </div>
                    </Modal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Horario;
