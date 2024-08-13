import Matrix from "@/Components/Matrix";
import React, { useState, useEffect } from "react";

export const TempPage = () => {
    // Estado para manejar el contador
    const [countdown, setCountdown] = useState(8);

    useEffect(() => {
        // Crea un intervalo que actualiza el contador cada segundo
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        // Limpiar el intervalo cuando el componente se desmonta
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Cuando el contador llegue a 0, cerrar la página
        if (countdown === 0) {
            window.close();
        }
    }, [countdown]);

    return (
        <div className="relative">
            <Matrix />
            <style>
                {`
                    @keyframes blinking {
                        0% { border-color: lime; }
                        50% { border-color: transparent; }
                        100% { border-color: lime; }
                    }
                `}
            </style>
            <div
                className="fixed top-0 w-full h-screen flex justify-center items-center z-50"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly see-through black
                    padding: '20px',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        color: 'white',
                        fontSize: '20px',
                        border: '3px solid lime',
                        animation: 'blinking 2s infinite',
                        padding: '10px',
                        backgroundColor: 'rgba(0, 255, 0, 0.2)',
                    }}
                >
                    Esta página se va a cerrar en {countdown}
                </div>
            </div>
        </div>
    );
};

export default TempPage;
