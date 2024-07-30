import BuscarFecha from "@/Components/BuscarFecha";
import BuscarMes from "@/Components/BuscarMes";
import Search from "@/Components/Search";
import SeleccionarMesODia from "@/Components/SeleccionarMesODia";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

function RegistrosNFC({ registros, auth }) {
    const [registrosNFC, setRegistrosNFC] = useState([]);
    const [resultados, setResultados] = useState(registros);
    const [busqueda, setBusqueda] = useState("dia");
    const {fechaActual, anioActual, mesActual} = ManejoFechas();
    const [fecha, setfecha] = useState(fechaActual());
    const [anio, setAnio] = useState(anioActual());
    const [mes, setMes] = useState(mesActual());

    const filters = [
        {
            id: 1,
            name: "Entrada",
            key: "evento",
            value: "ENTRADA",
            checked: false,
        },
        {
            id: 2,
            name: "Salida",
            key: "evento",
            value: "SALIDA",
            checked: false,
        },
    ];

    const columns = [
        {
            name: "Hora",
            selector: (row) => row.hora,
            sortable: true,
        },
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "Evento",
            selector: (row) => row.evento,
            sortable: true,
        },
    ];

    useEffect(() => {
        const datos = [];
        let registro = {};
        registros.map((element) => {
            registro = element;
            const options = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            };

            const fecha_hora = new Date(element.hora);
            registro.hora = fecha_hora.toLocaleString("es-MX", options);
            datos.push(registro);
        });
        setRegistrosNFC(datos);
        setResultados(datos);
    }, []);

    const handleSearchMes = ()=>{
          fetch(`asistencia/nfc?busqueda=mes&anio=${anio}&mes=${mes}`)
        .then((res) => {
            //setloading(true);
            return res.json();
        })
        .then((response) => {
            console.log(response);
            setRegistrosNFC(response);
            setResultados(response);
        })
        .finally((e) => {
            //setloading(false);
            //setFechaVista(` del mes de ${mes} del ${anio}`);
        });

    }
    
    const handleSearchDia = (e) => {
        console.log(fecha);
    };

    const headers = ["hora", "anacod", "evento"];
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Registros NFC
                </h2>
            }
        >
            <div className="mx-10 mt-5">
                <SeleccionarMesODia
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                ></SeleccionarMesODia>
                {busqueda == "dia" ? (
                    <BuscarFecha max={fechaActual()} onChange={(e)=>setfecha(e.target.value)} value={fecha} onClick={handleSearchDia}></BuscarFecha>
                ) : (
                    <BuscarMes anio={anio} setAnio={setAnio} mes={mes} setMes={setMes} onClick={handleSearchMes}></BuscarMes>
                )}

                {registrosNFC.length ? (
                    <div>
                        <Search
                            datos={registrosNFC}
                            setResultados={setResultados}
                            keys={headers}
                        ></Search>
                        <DataTable
                            data={resultados}
                            columns={columns}
                            fixedHeader={true}
                        ></DataTable>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </AuthenticatedLayout>
    );
}

export default RegistrosNFC;
