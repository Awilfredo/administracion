import { useState } from "react";

export default function PerfilAplicaciones({ aplicacion, usuario }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="max-w-md mx-auto p-4 bg-gray-200 rounded-md">
            <div className="pt-2 bg-white rounded shadow-md p-4 mb-4 h-40">
                <h2 className="text-lg font-bold mb-2">{aplicacion}</h2>
                {usuario && <p className="text-gray-600">Usuario: {usuario}</p>}
                <p
                    className={
                        usuario
                            ? "text-green-500 font-bold"
                            : "text-red-500 font-bold"
                    }
                >
                    {usuario
                        ? "El usuario tiene un perfil creado"
                        : "El usuario no tiene un perfil creado"}
                </p>
                {!usuario ? (
                    <div className="w-full flex justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                            onClick={() => setShowModal(true)}
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
