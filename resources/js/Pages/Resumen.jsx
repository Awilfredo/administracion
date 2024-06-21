import CloseButton from "@/Components/CloseButton";
import { DeleteIcon } from "@/Components/DeleteIcon";
import EditIcon from "@/Components/EditIcon";
import Modal from "@/Components/Modal";
import TablaResumen from "@/Components/TablaResumen";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";
import { useState } from "react";
function Resumen({ auth, ausencias, llegadas_tarde }) {
    const [state, setstate] = useState();
    const [showModal, setShowModal] = useState(false);
    const [resumenUsuario, setResumenUsuario] = useState([]);

    const closeModal = () => {
        setResumenUsuario([]);
        setShowModal(false);
    };

    const hadleClick = (anacod, evento) => {
        console.log(evento)
        axios
            .get(route("usuario.resumen", [anacod, evento]))
            .then((res) => res.data)
            .then((response) => setResumenUsuario(response));
        setShowModal(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Resumen de los ultimos 30 dias
                </h2>
            }
        >
            <div className="">
                <div class="flex justify-around mt-10 flex-wrap ">
                    {llegadas_tarde.length ? (
                        <TablaResumen
                            resumen={llegadas_tarde}
                            tipo="Tarde"
                            handleClick={hadleClick}
                        ></TablaResumen>
                    ) : (
                        ""
                    )}
                    {ausencias.length ? (
                        <TablaResumen
                            resumen={ausencias}
                            tipo="Ausencia"
                            handleClick={hadleClick}
                        ></TablaResumen>
                    ) : (
                        ""
                    )}
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal}>
                {resumenUsuario.length ? (
                    <div>
                        <div className="flex mt-3 mx-5 justify-between">
                            <h2 className="text-xl text-gray-700">
                                {resumenUsuario[0].ananam}
                            </h2>
                            <CloseButton onClick={closeModal}></CloseButton>
                        </div>

                        <div className="my-5 mx-10">
                            {resumenUsuario.map((element, index)=><div className="grid grid-cols-3 w-full gap-4">
                                <p className="text-gray-700">{element.anacod}</p>
                                <p>{element.fecha}</p>
                                <p>{element.evento}</p>
                                <br></br>
                            </div>)}
                            
                        </div>
                    </div>
                ):''}
            </Modal>
        </AuthenticatedLayout>
    );
}

export default Resumen;
