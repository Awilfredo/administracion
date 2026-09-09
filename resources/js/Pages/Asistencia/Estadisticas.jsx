import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState, useRef } from "react";

import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import GraficaCircular from "@/Components/GraficaCircular";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import DataTable from "react-data-table-component";
import Search from "@/Components/Search";
import BuscarMes from "@/Components/BuscarMes";
import Loading from "@/Components/Loading";
import { EstadisticasHelper } from "@/Helpers/EstadisticasHelper";

function Estadisticas({ datos, auth, empleados }) {
    const {
        obtenerHoras,
        fechasDelMes,
        anioActual,
        mesActual,
        meses,
        convertirTimestampADate,
        obtenerTimestampsMes,
        diasLaboralesEnMes,
        compararDias,
        convertirHorasAFloat,
    } = ManejoFechas();
    const [horasLaborales, setHorasLaborales] = useState(
        diasLaboralesEnMes(mesActual(), anioActual()).horasLaborales
    );
    const [data, setData] = useState([]);
    const keys = ["anacod", "nombre", "horas"];
    const [estadisticas_table, setEstadisticas_table] = useState([]);
    const [grafica, setgrafica] = useState([]);
    const [graficaEmpleado, setGraficaEmpleado] = useState();
    const [resultados, setResultados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mes, setmes] = useState(mesActual());
    const [anio, setanio] = useState(anioActual());
    const [showDated, setShowDated] = useState("");
    const { sumarDatosPorDia } = EstadisticasHelper();
    const [width, setWidth] = useState(null);

    useEffect(() => {
        setData(datos);
    }, []);

    useEffect(() => {
        if (resultados.length) {
            let grafica_data = [];
            let objetos = data.filter(
                (obj) => obj.anacod === resultados[0].anacod
            );
            console.log(anio, mes, objetos);
            const fechas_mes = fechasDelMes(anio, mes);
            fechas_mes.forEach((fecha) => {
                let obj_dia = {
                    name: fecha.split("-")[2],
                    NFC: null,
                    HUELLA: null,
                };

                const element = objetos.filter((obj) => obj.fecha === fecha);
                if (element.length) {
                    obj_dia.NFC = (element[0].sum / 3600).toFixed(2);
                    obj_dia.HUELLA = (element[0].sum_huella / 3600).toFixed(2);
                }
                grafica_data.push(obj_dia);
            });
            console.log(grafica_data);
            setGraficaEmpleado(grafica_data);
        }
    }, [resultados]);

    useEffect(() => {
        if (data.length > 0) {
            setHorasLaborales(diasLaboralesEnMes(mes, anio).horasLaborales);
            meses.map((element) => {
                if (element.value == mes) {
                    setShowDated(`${element.name} del ${anio}`);
                }
            });

            const timestamps = fechasDelMes(anio, mes);
            const datos_grafica = [];
            const datos_sumados = sumarDatosPorDia(
                data,
                horasLaborales,
                empleados
            );

            timestamps.forEach((fecha) => {
                let dia_elemnto = { name: "", horas: 0 };
                dia_elemnto.name = fecha;

                let suma_elementos = 0;
                let suma_horas = 0;
                let suma_huella = 0;

                data.map((element) => {
                    if (fecha == element.fecha) {
                        suma_horas += parseFloat(element.sum);
                        suma_huella += parseFloat(element.sum_huella);
                        suma_elementos++;
                    }
                });

                if (suma_elementos > 0) {
                    dia_elemnto.horas =
                        suma_horas > 0
                            ? (suma_horas / suma_elementos / 3600).toFixed(2)
                            : null;
                    dia_elemnto.horas_huella =
                        suma_huella > 0
                            ? (suma_huella / suma_elementos / 3600).toFixed(2)
                            : null;
                    datos_grafica.push({
                        name: dia_elemnto.name,
                        horas: dia_elemnto.horas,
                        horas_huella: dia_elemnto.horas_huella,
                    });
                } else {
                    datos_grafica.push({
                        name: dia_elemnto.name,
                        horas: null,
                        horas_huella: null,
                    });
                }
            });
            setgrafica(datos_grafica);
            setEstadisticas_table(datos_sumados);
            setResultados(datos_sumados);
        }
    }, [data]);

    const handleSearchMonth = (e) => {
        console.log(mes, anio);
        setIsLoading(true);
        setHorasLaborales(diasLaboralesEnMes(mes, anio).horasLaborales);
        fetch(`/estadisticas?mes=${mes}&anio=${anio}`)
            .then((res) => res.json())
            .then((response) => setData(response))
            .finally(() => {
                setIsLoading(false);
            });
    };

    const diasLaborales = diasLaboralesEnMes(mes, anio);
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
            wrap: true,
            minWidth: "200px",
            maxWidth: "300px",
        },
        {
            name: "Horas",
            selector: (row) => row.horas,
            sortable: true,
        },

        {
            name: "Porcentaje NFC",
            selector: (row) => row.porcentaje_nfc,
        },
        {
            name: "Porcentaje HUELLA",
            selector: (row) => row.porcentaje_huella,
        },
    ];

    const container = useRef(null);
    useEffect(() => {
        console.log(
            "width",
            container.current ? container.current.offsetWidth : 0
        );
        setWidth(container.current ? container.current.offsetWidth : 0);
    }, [container.current]);
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

            <div className="w-full px-10">
                <div
                    className="flex justify-center flex-wrap w-full"
                    ref={container}
                >
                    <div className="w-full mx-10 mt-5">
                        <BuscarMes
                            anio={anio}
                            mes={mes}
                            setAnio={setanio}
                            setMes={setmes}
                            onClick={handleSearchMonth}
                        ></BuscarMes>
                    </div>

                    {isLoading && <Loading></Loading>}

                    {!isLoading ? (
                        <div>
                            <div className="mt-20 bg-white px-5 rounded-xl">
                                <p className="text-center text-xl my-5">
                                    Resumen promedio del mes de {showDated}
                                </p>

                                {grafica && (
                                    <LineChart
                                        width={width}
                                        height={500}
                                        data={grafica}
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            bottom: 5,
                                            left: 0,
                                        }}
                                    >
                                        <Line
                                            type="monotone"
                                            dataKey="horas"
                                            stroke="red"
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="horas_huella"
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

                            {estadisticas_table.length && (
                                <div className="mt-10">
                                    <p className="text-lg">
                                        {showDated} - Horas Laborales:{" "}
                                        {horasLaborales} H
                                    </p>
                                    <Search
                                        placeholder="Buscar empleado"
                                        datos={estadisticas_table}
                                        setResultados={setResultados}
                                        keys={keys}
                                    ></Search>
                                    <div>
                                        <DataTable
                                            title={`Horas dentro de la empresa por empleado - ${showDated}`}
                                            data={resultados}
                                            columns={columns}
                                            fixedHeader
                                        ></DataTable>
                                    </div>
                                </div>
                            )}

                            <div className="flex w-full justify-center">
                                {resultados.length && (
                                    <div>
                                        <GraficaCircular
                                            width={width}
                                            title={"Grafica de NFC"}
                                            data={[
                                                {
                                                    name: resultados[0].anacod,
                                                    value: parseFloat(
                                                        resultados[0].suma_nfc.toFixed(
                                                            2
                                                        )
                                                    ),
                                                },
                                                {
                                                    name: "Horas restantes",
                                                    value: parseFloat(
                                                        (
                                                            horasLaborales -
                                                            resultados[0]
                                                                .suma_nfc
                                                        ).toFixed(2)
                                                    ),
                                                },
                                            ]}
                                        ></GraficaCircular>

                                        <GraficaCircular
                                            width={width}
                                            title={"Grafica de Huella"}
                                            data={[
                                                {
                                                    name: resultados[0].anacod,
                                                    value: parseFloat(
                                                        resultados[0].suma_huella.toFixed(
                                                            2
                                                        )
                                                    ),
                                                },
                                                {
                                                    name: "Horas restantes",
                                                    value: parseFloat(
                                                        (
                                                            horasLaborales -
                                                            resultados[0]
                                                                .suma_huella
                                                        ).toFixed(2)
                                                    ),
                                                },
                                            ]}
                                        ></GraficaCircular>
                                    </div>
                                )}
                            </div>
                            {grafica && resultados.length && (
                                <div className="mt-20 bg-white rounded-xl">
                                    <p className="text-center text-xl my-5">
                                        {resultados[0].anacod} - Resumen de{" "}
                                        {showDated}
                                    </p>
                                    <LineChart
                                        width={width}
                                        height={500}
                                        data={graficaEmpleado}
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            bottom: 5,
                                            left: 0,
                                        }}
                                    >
                                        <Line
                                            type="monotone"
                                            dataKey="NFC"
                                            stroke="red"
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="HUELLA"
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
                                </div>
                            )}
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Estadisticas;
