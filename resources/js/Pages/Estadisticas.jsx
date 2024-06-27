import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TablaGenerica from "@/Components/TablaGenerica";
import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

function Estadisticas({ data, auth }) {
    const headers = ["Usuario", "Nombre", "Horas dentro de la empresa"];
    const keys = ["anacod", "nombre", "horas"];
    const [estadisticas, setEstadisticas] = useState([]);
    const [grafica, setgrafica] = useState([]);

    const test = [
        { name: "Page A", uv: 400, pv: 400, amt: 2400 },
        { name: "Page A", uv: 200, pv: 300, amt: 2400 },
        { name: "Page A", uv: 400, pv: 378, amt: 2400 },
        { name: "Page A", uv: 200, pv: 50, amt: 50 },
    ];

    function obtenerTimestampsMes(year, month) {
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

    // Función auxiliar para obtener la cantidad de días en un mes específico
    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Función auxiliar para formatear números de un solo dígito con cero inicial
    function formatTwoDigits(num) {
        return num.toString().padStart(2, "0");
    }

    // Función auxiliar para formatear los milisegundos en 6 dígitos
    function formatMilliseconds(ms) {
        return ms.toString().padStart(6, "0");
    }

    // Función auxiliar para obtener el offset de la zona horaria en formato "-ZZ"
    function getTimezoneOffset(date) {
        const offsetMinutes = date.getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
        const offsetMinutesAbs = Math.abs(offsetMinutes % 60);
        const offsetSign = offsetMinutes >= 0 ? "-" : "+";

        return `${offsetSign}${formatTwoDigits(offsetHours)}${formatTwoDigits(
            offsetMinutesAbs
        )}`;
    }

    // Función auxiliar para obtener la cantidad de días en un mes específico
    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Función auxiliar para formatear números de un solo dígito con cero inicial
    function formatTwoDigits(num) {
        return num.toString().padStart(2, "0");
    }

    // Ejemplo de uso: obtener timestamps para junio de 2024

    function mismoDia(timestamp1, timestamp2) {
        // Convertir timestamps a objetos Date
        const date1 = convertirTimestampADate(timestamp1);
        const date2 = convertirTimestampADate(timestamp2);

        // Comparar si son del mismo día
        return date1 == date2;
    }

    // Función para convertir un timestamp en objeto Date
    function convertirTimestampADate(timestamp) {
        const partes = timestamp.split(" ");
        const fecha = partes[0];
        console.log(fecha);

        return partes[0];
    }

    useEffect(() => {
        const datos = [];
        let anacod = "";
        let nombre = "";
        let suma = 0;
        if (data.length) {
            anacod = data[0].anacod;
            nombre = data[0].nombre;
            data.forEach((element) => {
                const h = parseFloat(element.sum);
                if (h > 0) {
                    if (element.anacod == anacod) {
                        suma += parseFloat(element.sum);
                    } else {
                        datos.push({
                            anacod,
                            nombre,
                            horas: mostrarHoras(suma),
                        });
                        anacod = element.anacod;
                        nombre = element.nombre;
                        suma = parseFloat(element.sum);
                    }
                }
            });
            datos.push({ anacod, nombre, horas: mostrarHoras(suma) });
        }

        const year = 2024;
        const month = 5; // Meses en JavaScript van de 0 a 11 (junio es 5)
        const timestampsJunio2024 = obtenerTimestampsMes(year, month);
        console.log(timestampsJunio2024);
        const datos_grafica = [];
        let dia_elemnto = { name: "", horas: 0 };

        timestampsJunio2024.forEach((e) => {
            dia_elemnto.name = convertirTimestampADate(e);

            let suma_horas = 0;
            let suma_elementos = 0;
            data.forEach((element) => {
                if (mismoDia(e, element.fecha)) {
                    suma_horas += parseFloat(element.sum);
                    suma_elementos++;
                }
            });

            if (suma_elementos > 0) {
                dia_elemnto.horas = suma_horas / suma_elementos / 3600;
                datos_grafica.push({
                    name: dia_elemnto.name,
                    horas: dia_elemnto.horas,
                });
            }

            console.log(datos_grafica);
        });

        setgrafica(datos_grafica);

        setEstadisticas(datos);
    }, []);

    const mostrarHoras = (tiempo) => {
        //recibe hora en segundos
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Estadisticas
                </h2>
            }
        >
            <Head title="Estadisticas" />

            {estadisticas.length && (
                <TablaGenerica
                    data={estadisticas}
                    headers={headers}
                    keys={keys}
                ></TablaGenerica>
            )}

            <div className="mt-20"></div>

            {grafica && (
                <LineChart
                    width={1000}
                    height={500}
                    data={grafica}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                    <Line type="monotone" dataKey="horas" stroke="red" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            )}
        </AuthenticatedLayout>
    );
}

export default Estadisticas;
