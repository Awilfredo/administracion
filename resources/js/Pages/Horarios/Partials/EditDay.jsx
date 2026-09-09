import DangerButton from "@/Components/DangerButton";
import { DeleteIcon } from "@/Components/DeleteIcon";
import Modal from "@/Components/Modal";
import { SaveIcon } from "@/Components/SaveIcon";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { CompareObject } from "@/Helpers/CompareObject";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useEffect, useState } from "react";

function EditDay({ dia, handleDeleteDay, handleSave}) {
    const [data, setData] = useState(dia);
    const { obtenerNombreDia } = ManejoFechas();
    const [showModal, setShowModal] = useState(false);
    const [showSave, setShowSave] = useState(false);
    const { areValuesEqual } = CompareObject();

    useEffect(() => {
        setData(dia);
    }, [dia]);

    const handleDelete = (e) => {
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmDelete = (e) => {
        setShowModal(false);
        handleDeleteDay(dia.id);
    };

    useEffect(() => {
        setShowSave(!areValuesEqual(dia, data));
    }, [data]);



    return (
        <div className="bg-white sm:100  mt-5 p-5 rounded-xl">
            <div className="relative w-100">
                <div className="absolute right-0">
                    {showSave ? (
                            <button className="mx-4 text-green-600 hover:text-green-900" onClick={()=>handleSave(data)}>
                                <SaveIcon></SaveIcon>
                            </button>
                    ) : (
                        ""
                    )}
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={handleDelete}
                    >
                        <DeleteIcon
                            width="32px"
                            height="32px"
                            className=""
                        ></DeleteIcon>
                    </button>
                </div>
            </div>
            <strong className="text-xl">
                {obtenerNombreDia(dia.numero_dia)}
            </strong>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                <div className="">
                    <div>
                        <label htmlFor={dia.numero_dia + "entrada"}>
                            Entrada
                        </label>
                    </div>
                    <TextInput
                        type="time"
                        className="max-w-40"
                        id={data.numero_dia + "entrada"}
                        value={data.entrada}
                        onChange={(e) =>
                            setData({
                                ...data,
                                entrada: e.target.value,
                            })
                        }
                    ></TextInput>
                </div>
                <div>
                    <div>
                        <label htmlFor={dia.numero_dia + "salida_receso"}>
                            Salida receso
                        </label>
                    </div>
                    <TextInput
                        type="time"
                        className="max-w-40"
                        id={dia.numero_dia + "salida_receso"}
                        value={data.salida_almuerzo}
                        onChange={(e) =>
                            setData({
                                ...data,
                                salida_almuerzo: e.target.value,
                            })
                        }
                    ></TextInput>
                </div>
                <div>
                    <div>
                        <label htmlFor={dia.numero_dia + "entrada_receso"}>
                            Entrada receso
                        </label>
                    </div>
                    <TextInput
                        type="time"
                        className="max-w-40"
                        id={dia.numero_dia + "entrada_receso"}
                        value={data.entrada_almuerzo}
                        onChange={(e) =>
                            setData({
                                ...data,
                                entrada_almuerzo: e.target.value,
                            })
                        }
                    ></TextInput>
                </div>
                <div>
                    <div>
                        <label htmlFor={dia.numero_dia + "salida"}>
                            Salida
                        </label>
                    </div>
                    <TextInput
                        type="time"
                        className="max-w-40"
                        id={data.numero_dia + "salida"}
                        value={data.salida}
                        onChange={(e) =>
                            setData({ ...data, salida: e.target.value })
                        }
                    ></TextInput>
                </div>
            </div>

            <Modal show={showModal} onClose={handleCloseModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Estas seguro que desea eliminar el dia
                        {" " + obtenerNombreDia(dia.numero_dia)}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Si continuas, los datos no se podran recuperar y todos
                        los empleados que estaban vinculados a este horario se
                        veran afectados por el cambio
                    </p>

                    <div className="mt-6"></div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={handleCloseModal}>
                            Cancelar
                        </SecondaryButton>

                        <DangerButton
                            className="ms-3"
                            onClick={handleConfirmDelete}
                        >
                            Eliminar este dia
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default EditDay;
