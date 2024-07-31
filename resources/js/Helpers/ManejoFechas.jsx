export const ManejoFechas = () => {
    const compararDias = (timestamp1, timestamp2) => {
        //Recibe 2 timestamp y compara si la fecha es la misma
        // Convertir timestamps a objetos Date
        const date1 = convertirTimestampADate(timestamp1);
        const date2 = convertirTimestampADate(timestamp2);
        // Comparar si son del mismo día
        return date1 == date2;
    };

    const convertirTimestampADate = (timestamp) => {
        //recibe un timestam y retorna la fecha en string
        const partes = timestamp.split(" ");
        const fecha = partes[0];
        return partes[0];
    };

    function obtenerHoraDesdeFecha(fechaStr) {
        // Usa el objeto Date para analizar la cadena de fecha en formato ISO 8601
        if (fechaStr) {
            const fecha = new Date(fechaStr);
            // Extrae las horas, minutos y segundos en formato local
            const horas = String(fecha.getHours()).padStart(2, "0");
            const minutos = String(fecha.getMinutes()).padStart(2, "0");
            const segundos = String(fecha.getSeconds()).padStart(2, "0");
            // Devuelve la hora en formato HH:mm:ss
            return `${horas}:${minutos}:${segundos}`;
        } else {
            return "sin marca";
        }
    }

    function obtenerHoraDesdeTimestamp(timestamp) {
        // Crea un objeto Date usando el timestamp (en milisegundos)
        const fecha = new Date(timestamp * 1000);
        // Extrae las horas, minutos y segundos
        const horas = String(fecha.getUTCHours()).padStart(2, "0");
        const minutos = String(fecha.getUTCMinutes()).padStart(2, "0");
        const segundos = String(fecha.getUTCSeconds()).padStart(2, "0");
        // Devuelve la hora en formato HH:mm:ss
        return `${horas}:${minutos}:${segundos}`;
    }

    const obtenerHoras = (tiempo) => {
        //recibe horas en segundos y retorna las horas en format hh:mm eje 27:52
        let horas = Math.floor(tiempo / (60 * 60)); // Obtener solo las horas
        let minutos = Math.floor((tiempo % (60 * 60)) / 60);
        // Formatear los resultados para asegurar que tengan dos dígitos
        if (horas < 10) {
            horas = `0${horas}`;
        }
        if (minutos < 10) {
            minutos = `0${minutos}`;
        }
        // Concatenar horas y minutos en formato hh:mm
        const horaFormateada = `${horas}:${minutos}`;
        console.log(horaFormateada);
        return horaFormateada;
    };

    const diasLaboralesEnMes = (mes, anio) => {
        //recibe el año y el mes y retorna los dias lavorales de ese mes suponiendo que se trabaja de lunes a viernes
        //y retorna el numero de horas que se trabajan en el mes suponiendo que de lunes a jueves 9
        // y los viernes 8 haciendo 44 a la semana
        // Obtener el número de días en el mes y año dados
        const diasEnMes = new Date(anio, mes, 0).getDate();
        let diasLaborales = 0;
        let horasLaborales = 0;

        // Iterar sobre cada día del mes
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fecha = new Date(anio, mes - 1, dia);
            const diaSemana = fecha.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado

            // Si es lunes a jueves (de 1 a 4) se cuentan 9 horas
            if (diaSemana >= 1 && diaSemana <= 4) {
                diasLaborales += 1;

                horasLaborales += isAsueto(mes, diaSemana) ? 0 : 9;
            }
            // Si es viernes (5) se cuentan 8 horas
            else if (diaSemana === 5) {
                diasLaborales += 1;
                horasLaborales += isAsueto(mes, diaSemana) ? 0 : 8;
            }
            // Otros días (sábados y domingos) no se cuentan como laborales
        }

        return { horasLaborales, diasLaborales };
    };

    const isAsueto = (mes, dia)=>{
        console.log(dia, mes)
        let asueto = true;
        let obj = diasAsueto.filter(obj => (obj.dia == dia && obj.mes ==mes))
        console.log('DIA ASUETO', obj[0]);
    }

    function getTimezoneOffset(date) {
        // Función auxiliar para obtener el offset de la zona horaria en formato "-ZZ"
        const offsetMinutes = date.getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
        const offsetMinutesAbs = Math.abs(offsetMinutes % 60);
        const offsetSign = offsetMinutes >= 0 ? "-" : "+";

        return `${offsetSign}${formatTwoDigits(offsetHours)}${formatTwoDigits(
            offsetMinutesAbs
        )}`;
    }

    function daysInMonth(year, month) {
        // Función auxiliar para obtener la cantidad de días en un mes específico
        return new Date(year, month + 1, 0).getDate();
    }

    function formatTwoDigits(num) {
        // Función auxiliar para formatear números de un solo dígito con cero inicial
        return num.toString().padStart(2, "0");
    }

    function formatMilliseconds(ms) {
        // Función auxiliar para formatear los milisegundos en 6 dígitos
        return ms.toString().padStart(6, "0");
    }

    function obtenerTimestampsMes(anio, mes) {
        let year = parseInt(anio);
        let month= parseInt(mes)-1;
        //recibe el año y el mes y retorna un array con las fechas de los dias en formato timestamp

        // Crear un array para almacenar los timestamps formateados
        let timestamps = [];

        // Iterar sobre cada día del mes
        for (let day = 1; day <= daysInMonth(year, month); day++) {
            // Construir la fecha y hora en formato ISO 8601 para el día actual
            const fechaHoraISO = `${year}-${formatTwoDigits(
                month + 1
            )}-${formatTwoDigits(day)}T00:00:00`;

            // Crear un objeto Date a partir de la fecha y hora ISO
            const fechaHoraObj = new Date(fechaHoraISO);

            // Formatear la fecha y hora según el formato deseado
            const fechaHoraFormateada = `${fechaHoraObj.getFullYear()}-${formatTwoDigits(
                fechaHoraObj.getMonth() + 1
            )}-${formatTwoDigits(fechaHoraObj.getDate())} ${formatTwoDigits(
                fechaHoraObj.getHours()
            )}:${formatTwoDigits(fechaHoraObj.getMinutes())}:${formatTwoDigits(
                fechaHoraObj.getSeconds()
            )}.${formatMilliseconds(
                fechaHoraObj.getMilliseconds()
            )}${getTimezoneOffset(fechaHoraObj)}`;

            // Agregar la fecha y hora formateada al array
            timestamps.push(fechaHoraFormateada);
        }

        // Devolver el array de timestamps formateados
        return timestamps;
    }
    const fechaActual = () => {
        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        const mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2); // Los meses van de 0 a 11
        const dia = ("0" + fechaActual.getDate()).slice(-2);

        return `${anio}-${mes}-${dia}`;
    };

    const mesActual = () => {
        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        const mes = fechaActual.getMonth() + 1; // Los meses van de 0 a 11
        return `${mes}`;
    };

    const anioActual = () => {
        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        return `${anio}`;
    };

    const meses = [
        { name: "Enero", value: 1 },
        { name: "Febrero", value: 2 },
        { name: "Marzo", value: 3 },
        { name: "Abril", value: 4 },
        { name: "Mayo", value: 5 },
        { name: "Junio", value: 6 },
        { name: "Julio", value: 7 },
        { name: "Agosto", value: 8 },
        { name: "Septiembre", value: 9 },
        { name: "Octubre", value: 10 },
        { name: "Noviembre", value: 11 },
        { name: "Diciembre", value: 12 },
    ];

    const diasAsueto= [
        { "mes": 1,  "dia": 1 },   // 1 de enero
        { "mes": 5,  "dia": 1 },   // 1 de mayo
        { "mes": 5,  "dia": 10 },  // 10 de mayo
        { "mes": 6,  "dia": 17 },  // 17 de junio
        { "mes": 8,  "dia": 5 }, 
        { "mes": 8,  "dia": 6 },   // 6 de agosto
        { "mes": 9,  "dia": 15 },  // 15 de septiembre
        { "mes": 11, "dia": 2 },   // 2 de noviembre
        { "mes": 12, "dia": 25 }   // 25 de diciembre
      ]

    function convertirHorasAFloat(time) {
        // Separar minutos y segundos usando ':' como delimitador
        const [horas, minutos] = time.split(':').map(Number);
        
        // Convertir minutos a horas
        const hoursFromMinutes = minutos / 60;
        
        // Convertir segundos a horas

        
        // Sumar las horas obtenidas
        const totalHours = horas + hoursFromMinutes;
        
        return parseFloat(totalHours.toFixed(2));
    }
    

    return {
        compararDias,
        convertirTimestampADate,
        obtenerHoras,
        diasLaboralesEnMes,
        getTimezoneOffset,
        daysInMonth,
        formatTwoDigits,
        formatMilliseconds,
        obtenerTimestampsMes,
        fechaActual,
        meses,
        diasAsueto,
        mesActual,
        anioActual,
        obtenerHoraDesdeTimestamp,
        obtenerHoraDesdeFecha,
        convertirHorasAFloat
    };
};
