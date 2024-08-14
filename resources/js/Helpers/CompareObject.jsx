export const CompareObject = ()=>{
    function areValuesEqual(obj1, obj2) {
        // Verificar si ambos objetos son el mismo objeto
        if (obj1 === obj2) return true;
      
        // Verificar si alguno de los objetos es nulo o no es un objeto
        if (obj1 == null || obj2 == null || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
      
        // Obtener las claves de ambos objetos
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
      
        // Comparar la longitud de las claves
        if (keys1.length !== keys2.length) return false;
      
        // Comparar cada clave y su valor correspondiente
        for (const key of keys1) {
          if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
          }
        }
      
        return true;
      }
      
      // Función auxiliar para comparar valores profundamente
      function deepEqual(value1, value2) {
        // Comparar valores primitivos
        if (value1 === value2) return true;
      
        // Comparar objetos y arrays profundamente
        if (typeof value1 === 'object' && value1 !== null && typeof value2 === 'object' && value2 !== null) {
          if (Array.isArray(value1) && Array.isArray(value2)) {
            if (value1.length !== value2.length) return false;
            for (let i = 0; i < value1.length; i++) {
              if (!deepEqual(value1[i], value2[i])) return false;
            }
            return true;
          }
      
          const keys1 = Object.keys(value1);
          const keys2 = Object.keys(value2);
      
          if (keys1.length !== keys2.length) return false;
      
          for (const key of keys1) {
            if (!keys2.includes(key) || !deepEqual(value1[key], value2[key])) {
              return false;
            }
          }
      
          return true;
        }
      
        return false;
      }
            

    return {areValuesEqual};
}