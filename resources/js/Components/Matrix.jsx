import React, { useEffect, useRef } from 'react';

function Matrix() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Configura el canvas para que ocupe la pantalla entera
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        // Una entrada en el array por columna de texto
        const columns = Array.from({ length: Math.floor(canvas.width / 10) }, () => 1);

        // Define un array de caracteres en español
        const spanishCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúüñÁÉÍÓÚÜÑ';

        function step() {
            // Ligeramente oscurece todo el canvas dibujando un rectángulo negro casi transparente sobre todo el canvas
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Verde
            ctx.fillStyle = '#0F0';
            // Para cada columna
            columns.forEach((value, index) => {
                // Selecciona un carácter al azar del array de caracteres en español
                const character = spanishCharacters.charAt(Math.floor(Math.random() * spanishCharacters.length));
                // Dibuja el carácter
                ctx.fillText(character, index * 10, value);

                // Desplaza hacia abajo el carácter
                // Si el carácter es menor de 758 entonces hay una posibilidad aleatoria de que sea reseteado
                columns[index] = value > 758 + Math.random() * 10000 ? 0 : value + 10;
            });
        }

        // 1000/33 = ~30 veces por segundo
        const intervalId = setInterval(step, 33);

        // Cleanup function to clear interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <canvas ref={canvasRef} className='fixed top-0'></canvas>
    );
}

export default Matrix;
