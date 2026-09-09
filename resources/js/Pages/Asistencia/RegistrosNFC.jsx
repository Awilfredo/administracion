import moment from "moment";
import DiaRango from "@/Components/DiaRango";
import LoadingF from "@/Components/LoadingF";
import Search from "@/Components/Search";
import { ExportCSV } from "@/Helpers/ExportCSV";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

function RegistrosNFC({ auth }) {
    const [registros, setRegistros] = useState([]);
    const [resultados, setResultados] = useState([]);
    const { fechaActual } = ManejoFechas();
    const [loading, setLoading] = useState(false);
    const [fechas, setFechas] = useState({
        fecha: fechaActual(),
        fecha_fin: null,
    });

    const { downloadCSV, Export } = ExportCSV();

    useEffect(() => {
        setLoading(true);
        let url = route("asistencia.nfc") + `?fecha=${fechas.fecha}`;
        if (fechas.fecha != fechas.fecha_fin && fechas.fecha_fin) {
            url =
                route("asistencia.nfc") +
                `?fecha=${fechas.fecha}` +
                (fechas.fecha_fin ? `&fecha_fin=${fechas.fecha_fin}` : "");
        }
        fetch(url)
            .then((res) => {
                return res.json();
            })
            .then((response) => {
                setRegistros(response);
                setResultados(response);
                console.log(response);
            })
            .finally((e) => {
                setLoading(false);
            });
    }, [fechas]);

    const columns = [
        {
            name: "Fecha",
            //            selector: (row) => row.hora.toLocaleTimeString(),
            selector: (row) => {
                const date = new Date(row.hora);
                return date.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                });
            },
            sortable: true,
            wrap: true,
            minWidth: "110px",
            maxWidth: "110px",
        },
        {
            name: "Hora",
            //            selector: (row) => row.hora.toLocaleTimeString(),
            selector: (row) => {
                const date = new Date(row.hora); // Convertir la cadena en un objeto Date
                return date.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });
            },
            sortable: true,
            wrap: true,
            minWidth: "110px",
            maxWidth: "110px",
        },
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "Nombre",
            selector: (row) => row.ananam,
            sortable: true,
            wrap: true,
            minWidth: "200px",
            maxWidth: "300px",
        },
        {
            name: "Jefe",
            selector: (row) => row.anajef,
            sortable: true,
        },
        {
            name: "Evento",
            selector: (row) => row.evento,
            sortable: true,
        },
    ];

    const handleExport = useCallback(() => {
        downloadCSV(
            resultados,
            ["anacod", "ananam", "anajef", "evento", "hora"],
            `Registros NFC ${fechas.fecha}`
        );
    }, [resultados, fechas.fecha]);

    const descargar = useMemo(
        () => <Export onExport={handleExport} />,
        [handleExport]
    );
    const headers = ["hora", "anacod", "ananam", "anajef", "evento"];
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
                <DiaRango fechas={fechas} setFechas={setFechas}></DiaRango>
                {registros.length ? (
                    <div>
                        <Search
                            datos={registros}
                            setResultados={setResultados}
                            keys={headers}
                        ></Search>
                        <DataTable
                            data={resultados}
                            columns={columns}
                            fixedHeader={true}
                            actions={descargar}
                        ></DataTable>
                    </div>
                ) : (
                    ""
                )}
            </div>

            <LoadingF loading={loading}></LoadingF>
        </AuthenticatedLayout>
    );
}

export default RegistrosNFC;
