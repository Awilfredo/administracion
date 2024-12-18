import BuscarFecha from "@/Components/BuscarFecha";
import BuscarMes from "@/Components/BuscarMes";
import DiaRango from "@/Components/DiaRango";
import Search from "@/Components/Search";
import SeleccionarMesODia from "@/Components/SeleccionarMesODia";
import { ExportCSV } from "@/Helpers/ExportCSV";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
function Marcaciones({ auth, marcas }) {
    const keys = ["anacod", "ananam"];
    const [marcas_completas, setMarcas_completas] = useState(marcas);
    const [resultados, setResultados] = useState(marcas);
    const { obtenerHoraDesdeFecha, fechaActual, mesActual, anioActual } = ManejoFechas();
    const { downloadCSV, Export } = ExportCSV();
    const [fecha, setFecha] = useState(fechaActual);
    const [fechaVista, setFechaVista] = useState(fechaActual);
    const [loading, setloading] = useState(false);
    const [mes, setMes] = useState(mesActual);
    const [busqueda, setBusqueda] = useState("dia");
    const [anio, setAnio] = useState(anioActual);

    const [fechas, setFechas] = useState({fecha:fechaActual(), fecha_fin:null});

    useEffect(() => {
        console.log(fechas);
    }, [fechas]);

    const columns = [
        {
            name: "Index",
            selector: (row, index) => index+1,
            sortable: true,
            maxWidth: '5px'
        },        
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,

        },
        {
            name: "Nombre",
            selector: (row) => row.ananam || "Sin marca",
            sortable: true,
            wrap:true,
            minWidth: '200px',
            maxWidth:'300px'
        },
        {
            name: "Jefe",
            selector: (row) => row.anajef || "Sin marca",
            sortable: true,
            wrap:true,
        },
        {
            name: "Fecha",
            selector: (row) => row.fecha || "Sin marca",
            sortable: true,
        },
        {
            name: "NFC entrada",
            selector: (row) => row.nfc_entrada || "Sin marca",
            sortable: true,
        },
        {
            name: "NFC salida",
            selector: (row) => row.nfc_salida || "Sin marca",
            sortable: true,
        },
        {
            name: "Primera Huella",
            selector: (row) => row.huella_1 || "Sin marca",
            sortable: true,
        },
        {
            name: "Segunda Huella",
            selector: (row) => row.huella_2 || "Sin marca",
            sortable: false,
        },
        {
            name: "Tercera Huella",
            selector: (row) => row.huella_3 || "Sin marca",
            sortable: true,
        },
        {
            name: "Cuarta Huella",
            selector: (row) => row.huella_4 || "Sin marca",
            sortable: true,
        },
        {
            name: "Quinta Huella",
            selector: (row) => row.huella_5 || "Sin marca",
            sortable: true,
        },
    ];

    const handleSearchDia = () => {
        fetch(`/asistencia/marcas?fecha=${fecha}`)
            .then((res) => {
                setloading(true);
                return res.json();
            })
            .then((response) => {
                console.log(response);
                setMarcas_completas(response);
                setResultados(response);
            })
            .finally((e) => {
                setloading(false);
                setFechaVista(fecha);
            });
    };

    const handleSearchMes = (e) =>{
        fetch(`/asistencia/marcas?fecha=${anio}-${mes}-01&busqueda=mes`)
            .then((res) => {
                setloading(true);
                return res.json();
            })
            .then((response) => {
                console.log(response);
                setMarcas_completas(response);
                setResultados(response);
            })
            .finally((e) => {
                setloading(false);
                setFechaVista(` del mes de ${mes} del ${anio}`);
            });
    }


    const handleExport = useCallback(() => {
        downloadCSV(
            resultados,
            [
                "anacod",
                "ananam",
                "fecha",
                "nfc_entrada",
                "nfc_salida",
                "huella_1",
                "huella_2",
                "huella_3",
                "huella_4",
                "huella_5",
                "huella_6",
            ],
            `Marcas ${fecha}`
        );
    }, [resultados, fecha]);

    // Memoriza el componente Export para que solo se actualice cuando handleExport cambie
    const descargar = useMemo(
        () => (
            <Export onExport={handleExport} />
        ),
        [handleExport]
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Marcaciones {fechaVista}
                </h2>
            }
        >
            <Head title="Marcaciones" />

            <div className="m-10">
                <DiaRango fechas={fechas} setFechas={setFechas}></DiaRango>
                <SeleccionarMesODia busqueda={busqueda} setBusqueda={setBusqueda}></SeleccionarMesODia>
                {busqueda == "dia" ? (
                    <BuscarFecha
                        max={fechaActual()}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        onClick={handleSearchDia}
                    ></BuscarFecha>
                ) : (
                    <BuscarMes mes={mes} setMes={setMes} onClick={handleSearchMes} anio={anio} setAnio={setAnio}></BuscarMes>
                )}
                <Search
                    datos={marcas_completas}
                    setResultados={setResultados}
                    keys={keys}
                    placeholder="Buscar empleado"
                ></Search>
                {!loading && (
                    <DataTable
                        columns={columns}
                        data={resultados}
                        fixedHeader
                        actions={descargar}
                    ></DataTable>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

export default Marcaciones;
