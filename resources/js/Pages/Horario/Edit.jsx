import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import EditDay from "./Partials/EditDay";
import { useEffect, useState } from "react";
import CardAdd from "@/Components/CardAdd";
import Modal from "@/Components/Modal";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import DangerButton from "@/Components/DangerButton";
function Edit({ auth, horario }) {
    const [dias, setdias] = useState([...horario.dias]);
    const [showSelectDay, setshowSelectDay] = useState(false);
    const [diasDisponibles, setDiasDisponibles] = useState([]);
    const { diasDeLaSemana } = ManejoFechas();
    useEffect(() => {
        const dias_ocupados = [];
        dias.forEach((element) => {
            dias_ocupados.push(element.numero_dia);
        });
        const resultados = diasDeLaSemana.filter(
            (obj) => !dias_ocupados.includes(obj.value)
        );
        setDiasDisponibles(resultados);
    }, [dias]);

    const handleAddDay = () => {
        setshowSelectDay(true);
        // if(dias.length<6){
        //     setshowSelectDay(true);

        // }
    };

    const handleCreateDay = (dia) => {
        setdias([
            ...dias,
            {
                numero_dia: dia,
                entrada: "",
                salida: "",
                entrada_almuerzo: "",
                salida_almuerzo: "",
            },
        ]);

        setshowSelectDay(false);
    };
    const CancelSelectDay = (e) => {
        setshowSelectDay(false);
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
                    <EditDay dia={element} key={index}></EditDay>
                ))}

                {dias.length < 7 ? (
                    <CardAdd onClick={handleAddDay}>
                        <p className="mt-5">Agregar nuevo dia al horario</p>
                    </CardAdd>
                ) : (
                    ""
                )}
            </div>

            <Modal
                show={showSelectDay}
                closeable={true}
                onClose={CancelSelectDay}
            >
                <div className="p-5">
                    <strong>Selecciona un dia disponible:</strong>
                    <div className="flex mt-5 justify-around flex-wrap">
                        {diasDisponibles.map((element, index) => (
                            <button
                                onClick={()=>handleCreateDay(element.value)}
                                className="mx-2 bg-gray-200 px-5 py-2 mt-5 rounded hover:bg-gray-500 hover:text-white"
                                key={index}
                            >
                                {element.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full flex justify-end p-5">
                    <DangerButton type="button" onClick={CancelSelectDay}>
                        Cancelar
                    </DangerButton>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

export default Edit;
