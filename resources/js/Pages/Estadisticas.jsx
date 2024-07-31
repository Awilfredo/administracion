import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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
import DataTable from "react-data-table-component";
import Search from "@/Components/Search";
import BuscarMes from "@/Components/BuscarMes";

function Estadisticas({ datos, auth, empleados }) {
    const [data, setData] = useState(datos);
    const headers = ["Usuario", "Nombre", "Horas dentro de la empresa"];
    const keys = ["anacod", "nombre", "horas"];
    const [estadisticas, setEstadisticas] = useState([]);
    const [grafica, setgrafica] = useState([]);
    const [graficaEmpleado, setGraficaEmpleado] = useState();
    const [circularG, setCircularG] = useState({ name: "AWCRUZ" });
    const [resultados, setResultados] = useState([]);
    const { obtenerHoras ,anioActual, mesActual, meses, convertirTimestampADate, obtenerTimestampsMes, diasLaboralesEnMes, compararDias, convertirHorasAFloat} = ManejoFechas();
    const [mes, setmes] = useState(mesActual());
    const [anio, setanio] = useState(anioActual());
    const [horasLaborales, setHorasLaborales] = useState(0);
    const [showDated, setShowDated] = useState("");

    useEffect(() => {
        setHorasLaborales(diasLaboralesEnMes(mes,anio).horasLaborales);
        console.log(diasLaboralesEnMes(mes,anio).horasLaborales);
        meses.map(element=>{
            if(element.value == mes){
                setShowDated(`${element.name} del ${anio}`)
            }
        })
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
                            horas: obtenerHoras(suma),
                        });
                        anacod = element.anacod;
                        nombre = element.nombre;
                        suma = parseFloat(element.sum);
                    }
                }
            });
            datos.push({ anacod, nombre, horas: obtenerHoras(suma) });
        }

        const data_empleados_grafica = { name: "" };
        const array_empleados_grafica = [];

        console.log(data_empleados_grafica);
        const timestampsJunio2024 = obtenerTimestampsMes(anio, mes);
        const datos_grafica = [];
        let dia_elemnto = { name: "", horas: 0 };

        timestampsJunio2024.forEach((e) => {
            data_empleados_grafica.name = convertirTimestampADate(e)
                .split("-")[2];
            empleados.forEach((emp) => {
                data_empleados_grafica[emp.anacod] = null;
            });

            dia_elemnto.name = convertirTimestampADate(e);
            let suma_horas = null;
            let suma_elementos = 0;
            data.map((element) => {
                if (compararDias(e, element.fecha)) {
                    data_empleados_grafica[element.anacod] = (
                        element.sum / 3600
                    ).toFixed(2);
                    suma_horas += parseFloat(element.sum);
                    suma_elementos++;
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
        setResultados(datos);
    }, [data]);

    const handleSearchMonth = (e) => {
         console.log(mes, anio)
         fetch(`/estadisticas?mes=${mes}&anio=${anio}`).then((res)=>res.json()).then((response)=>setData(response));
    };

    const diasLaborales = diasLaboralesEnMes(mes, anio);
    console.log(diasLaborales);
    const columns = [
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "Nombre",
            selector: (row) => row.nombre,
            sortable: true,
        },
        {
            name: "Horas",
            selector: (row) => row.horas,
            sortable: true,
        },

        {name:"Porcentaje NFC",
            selector: (row)=> (((1-parseFloat(((horasLaborales- convertirHorasAFloat(row.horas))/horasLaborales)))*100).toFixed(2)  + ' %') 
        }
    ];

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
                <div className="w-full mx-10 mt-5">
                    <BuscarMes anio={anio} mes={mes} setAnio={setanio} setMes={setmes} onClick={handleSearchMonth}></BuscarMes>
                </div>
                <div className="mt-20 bg-white px-5 rounded-xl">
                    <p className="text-center text-xl my-5">
                        Resumen promedio del mes de {showDated}
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
                    <div className="sm:w-full lg:w-4/5 mt-10">
                        <Search
                            placeholder="Buscar empleado"
                            datos={estadisticas}
                            setResultados={setResultados}
                            keys={keys}
                        ></Search>
                        <DataTable
                            title={`Horas dentro de la empresa por empleado - ${showDated}`}
                            data={resultados}
                            columns={columns}
                            fixedHeader
                        ></DataTable>
                    </div>
                )}

                <div className="flex w-full justify-center">
                    { resultados.length &&

                        <GraficaCircular data={[{name:resultados[0].anacod, value:convertirHorasAFloat(resultados[0].horas)},{name:'Horas restantes', value: parseFloat((horasLaborales- convertirHorasAFloat(resultados[0].horas)).toFixed(2)) }]}></GraficaCircular>
                    }
                </div>
                    {(grafica && resultados.length) && (
                <div className="mt-20 bg-white rounded-xl px-5">
                    <p className="text-center text-xl my-5">
                    {resultados[0].anacod} - Resumen  de {showDated} 
                    </p>
                        <LineChart
                            width={1000}
                            height={500}
                            data={graficaEmpleado}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                            <Line
                                type="monotone"
                                dataKey={resultados[0].anacod}
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
                </div>
                    )}
            </div>
        </AuthenticatedLayout>
    );
}

export default Estadisticas;
