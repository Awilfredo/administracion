import { router } from "@inertiajs/react";
import { useState } from "react";

export default function PerfilAplicaciones({ aplicacion, usuario, estado, id, anacod}) {
    const [showModal, setShowModal] = useState(false);
    const handleActivate = (activar) => {
        router.patch(route('empleados.update.control'), {id, anacod, activar});
    };

    const handleCreate = ()=>{
        router.post(route('empleado.create.control'), {anacod, aplicacion});
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-gray-200 rounded-md">
            <div className="pt-2 bg-white rounded shadow-md p-4 mb-4 h-48 relative">
                <h2 className="text-lg font-bold mb-2">{aplicacion}</h2>
                {usuario && <p className="text-gray-600">Usuario: {usuario}</p>}
                <p className={"text-gray-600"}>
                    {usuario
                        ? "El usuario tiene un perfil creado"
                        : "El usuario no tiene un perfil creado"}
                </p>

                <p
                    className={
                        "absolute top-0 right-0 font-bold px-1 rounded-lg text-white m-1 " +
                        (usuario
                            ? estado == 2
                                ? "bg-green-500"
                                : "bg-red-500"
                            : "")
                    }
                >
                    {usuario ? (estado == 2 ? "Activo" : "Inactivo") : ""}
                </p>

                <div className="w-full flex justify-center">
                    {usuario && estado == 2 ? (
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                        onClick={()=>handleActivate(false)}
                        >
                            Desactivar
                        </button>
                    ) : usuario && estado == 1 ? (
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
                        onClick={()=>handleActivate(true)}
                        >
                            Activar
                        </button>
                    ) : (
                        ""
                    )}
                </div>

                {!usuario ? (
                    <div className="w-full flex justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                            onClick={handleCreate}
                        >
                            Crear perfil
                        </button>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
