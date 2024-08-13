import React, { useState, useEffect } from 'react';

export const TempPage = () => {
  // Estado para manejar el contador
  const [countdown, setCountdown] = useState(5);

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
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'black', 
      color: 'white', 
      fontSize: '20px' 
    }}>
      Esta página se va a cerrar en {countdown}
    </div>
  );
};

export default TempPage;
