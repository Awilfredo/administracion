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
import GraficaCircular from "@/Components/GraficaCircular";
import { ManejoFechas } from "@/Helpers/ManejoFechas";

function Estadisticas({ data, auth, empleados }) {
    const fechas = ManejoFechas();
    const headers = ["Usuario", "Nombre", "Horas dentro de la empresa"];
    const keys = ["anacod", "nombre", "horas"];
    const [estadisticas, setEstadisticas] = useState([]);
    const [grafica, setgrafica] = useState([]);
    const [graficaEmpleado, setGraficaEmpleado] = useState();
    const [circularG, setCircularG] = useState({ name: "AWCRUZ" });
    const [mes, setmes] = useState(5);
    const [anio, setanio] = useState(2024);
    /*
    const test = [
        { name: "Page A", uv: 400, pv: 400, amt: 2400 },
        { name: "Page A", uv: 200, pv: 300, amt: 2400 },
        { name: "Page A", uv: 400, pv: 378, amt: 2400 },
        { name: "Page A", uv: 200, pv: 50, amt: 50 },
    ];
*/
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
                            horas: fechas.obtenerHoras(suma),
                        });
                        anacod = element.anacod;
                        nombre = element.nombre;
                        suma = parseFloat(element.sum);
                    }
                }
            });
            datos.push({ anacod, nombre, horas: fechas.obtenerHoras(suma) });
        }

        const data_empleados_grafica = { name: "" };
        const array_empleados_grafica = [];

        console.log(data_empleados_grafica);
        const timestampsJunio2024 = fechas.obtenerTimestampsMes(anio, mes);
        const datos_grafica = [];
        let dia_elemnto = { name: "", horas: 0 };

        timestampsJunio2024.forEach((e) => {
            data_empleados_grafica.name = fechas
                .convertirTimestampADate(e)
                .split("-")[2];
            empleados.forEach((emp) => {
                data_empleados_grafica[emp.anacod] = null;
            });

            dia_elemnto.name = fechas.convertirTimestampADate(e);
            let suma_horas = null;
            let suma_elementos = 0;
            data.map((element) => {
                if (fechas.compararDias(e, element.fecha)) {
                    data_empleados_grafica[element.anacod] = (
                        element.sum / 3600
                    ).toFixed(2);
                    suma_horas += parseFloat(element.sum);
                    suma_elementos++;
                    console.log(suma_elementos);
                }
            });

            if (suma_elementos > 0) {
                dia_elemnto.horas = (
                    suma_horas /
                    suma_elementos /
                    3600
                ).toFixed(2);
                datos_grafica.push({
                    name: dia_elemnto.name,
                    horas: dia_elemnto.horas,
                });
            }

            array_empleados_grafica.push({ ...data_empleados_grafica });
            console.log(datos_grafica);
        });
        setGraficaEmpleado(array_empleados_grafica);
        setgrafica(datos_grafica);
        setEstadisticas(datos);
    }, []);

    const diasLaborales = fechas.diasLaboralesEnMes(mes, anio);
    console.log(diasLaborales);

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

            <div className="flex justify-center flex-wrap">
                <div className="mt-20 bg-white px-5 rounded-xl">
                    <p className="text-center text-xl my-5">
                        Resumen promedio de Junio
                    </p>
                    {grafica && (
                        <LineChart
                            width={1000}
                            height={500}
                            data={grafica}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                            <Line
                                type="monotone"
                                dataKey="horas"
                                stroke="red"
                            />
                            <CartesianGrid
                                stroke="#ccc"
                                strokeDasharray="5 5"
                            />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                        </LineChart>
                    )}
                </div>

                {estadisticas.length && (
                    <TablaGenerica
                        data={estadisticas}
                        headers={headers}
                        keys={keys}
                    ></TablaGenerica>
                )}

                <div className="flex w-full justify-center">
                    <GraficaCircular data={[]}></GraficaCircular>
                </div>
                <div className="mt-20 bg-white rounded-xl px-5">
                    <p className="text-center text-xl my-5">
                        Resumen por empleado de Junio
                    </p>
                    {grafica && (
                        <LineChart
                            width={1000}
                            height={500}
                            data={graficaEmpleado}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                            <Line
                                type="monotone"
                                dataKey="AWCRUZ"
                                stroke="red"
                            />
                            <Line
                                type="monotone"
                                dataKey="TCASTILLO"
                                stroke="black"
                            />
                            <Line
                                type="monotone"
                                dataKey="EDLOPEZ"
                                stroke="blue"
                            />

                            <CartesianGrid
                                stroke="#ccc"
                                strokeDasharray="5 5"
                            />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                        </LineChart>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Estadisticas;
