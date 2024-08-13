import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import EditDay from "./Partials/EditDay";
import { useState } from "react";
import AddIcon from "@/Components/Icons/AddIcon";
import CardAdd from "@/Components/CardAdd";
import Modal from "@/Components/Modal";
function Edit({ auth, horario }) {
    const [dias, setdias] = useState([...horario.dias]);
    const [showSelectDay, setshowSelectDay] = useState(false);
    console.log(dias);
    const handleAddDay = () => {
        if(dias.length<6){
            setshowSelectDay(true);

        }
        setdias([
            ...dias,
            {
                numero_dia: dias.length + 1,
                entrada: "",
                salida: "",
                entrada_almuerzo: "",
                salida_almuerzo: "",
            },
        ]);
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Editar horario: {horario.nombre}
                </h2>
            }
        >
            <Head title="Editar horario" />

            <div className="w-full sm:px-2 md:px-10 justify-center pb-10">
                {dias.map((element, index) => (
                    <EditDay dia={element}></EditDay>
                ))}

                {dias.length < 7 ? (
                    <CardAdd onClick={handleAddDay}><p className="mt-5">Agregar nuevo dia al horario</p></CardAdd>
                ) : (
                    ""
                )}
            </div>

            <Modal show={showSelectDay} closeable={true}>
                <div className="p-5">
                    <strong>Selecciona un dia:</strong>
                    <div className="flex"></div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}

export default Edit;
