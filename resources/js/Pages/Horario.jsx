import DangerButton from "@/Components/DangerButton";
import { DeleteIcon } from "@/Components/DeleteIcon";
import EditIcon from "@/Components/EditIcon";
import GenericTable from "@/Components/GenericTable";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import DataTable from "react-data-table-component";
function Horario({ auth, horarios }) {
    console.log(horarios);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [horarioSeleccionado, sethorarioSeleccionado] = useState({nombre:'', id:null});

    const headers = [
        "Dia",
        "Hora entrada",
        "Hora salida receso",
        "Hora entrada receso",
        "hora salida",
    ];
    const keys = [
        "numero_dia",
        "entrada",
        "salida_almuerzo",
        "entrada_almuerzo",
        "salida",
    ];

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

    const closeModal = () => {
        setConfirmingDeletion(false);
        //reset();
    };

    const handleDeleteHorario = (nombre, id) => {
        sethorarioSeleccionado({nombre:nombre, id:id});
        console.log(horarioSeleccionado)
        setConfirmingDeletion(true);
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
                                            onClick={() => alert()}
                                        >
                                            <EditIcon
                                                height="32px"
                                                width="32px"
                                            ></EditIcon>
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() =>
                                                handleDeleteHorario(element.nombre, element.id)
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

                    {horarioSeleccionado.nombre ? 
                    <Modal show={confirmingDeletion} onClose={closeModal}>
                        <form onSubmit={true} className="p-6">
                            <h2 className="text-lg font-medium text-gray-900">
                                Estas seguro que desea eliminar el horario {horarioSeleccionado.nombre}
 
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                                Si continuas, los datos no se podran recuperar y
                                se debera asignar manualmente un horario a todos
                                los empleados que estaban vinculados a este
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
            :''}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Horario;
