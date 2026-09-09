import moment from "moment";
import LoadingF from "@/Components/LoadingF";
import MarcasFiltro from "@/Components/MarcasFiltro";
import Search from "@/Components/Search";
import { ExportCSV } from "@/Helpers/ExportCSV";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

function RegistrosNFC({ auth, registros: registrosIniciales }) {
    const keys = ["anacod", "ananam", "anajef", "evento"];
    const { props } = usePage();
    const filters = props.filters || {};
    const { fechaActual } = ManejoFechas();
    const { downloadCSV, Export } = ExportCSV();

    const [preset, setPreset] = useState(filters.preset ?? "hoy");
    const [fechaIni, setFechaIni] = useState(filters.fecha ?? fechaActual());
    const [fechaFin, setFechaFin] = useState(filters.fecha_fin ?? fechaActual());
    const [usuario, setUsuario] = useState(filters.usuario ?? "");
    const [registros, setRegistros] = useState(registrosIniciales ?? []);
    const [resultados, setResultados] = useState(registrosIniciales ?? []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setRegistros(registrosIniciales ?? []);
        setResultados(registrosIniciales ?? []);
    }, [registrosIniciales]);

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleSearch = useCallback(() => {
        setLoading(true);
        router.reload({
            data: {
                fecha: fechaIni,
                fecha_fin: fechaFin && fechaFin !== fechaIni ? fechaFin : null,
                usuario: usuario || null,
                preset,
            },
            only: ["registros", "filters"],
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, [fechaIni, fechaFin, usuario, preset]);

    const columns = useMemo(
        () => [
            {
                name: "Fecha",
                selector: (row) => {
                    const date = new Date(row.hora);
                    return date.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    });
                },
                sortable: true,
                wrap: true,
                minWidth: "110px",
                maxWidth: "110px",
            },
            {
                name: "Hora",
                selector: (row) => {
                    const date = new Date(row.hora);
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
        ],
        []
    );

    const handleExport = useCallback(() => {
        downloadCSV(
            resultados,
            ["anacod", "ananam", "anajef", "evento", "hora"],
            `Registros NFC ${fechaActual()}`
        );
    }, [resultados, fechaActual, downloadCSV]);

    const descargar = useMemo(
        () => <Export onExport={handleExport} />,
        [handleExport, Export]
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Registros NFC
                </h2>
            }
        >
            <Head title="Registros NFC" />

            <div className="m-10">
                <MarcasFiltro
                    preset={preset}
                    setPreset={setPreset}
                    fechaIni={fechaIni}
                    setFechaIni={setFechaIni}
                    fechaFin={fechaFin}
                    setFechaFin={setFechaFin}
                    usuario={usuario}
                    setUsuario={setUsuario}
                    onSearch={handleSearch}
                    loading={loading}
                />
                <Search
                    datos={registros}
                    setResultados={setResultados}
                    keys={keys}
                    placeholder="Buscar en resultados..."
                />
                <DataTable
                    columns={columns}
                    data={resultados}
                    fixedHeader
                    actions={descargar}
                />
            </div>

            <LoadingF loading={loading} />
        </AuthenticatedLayout>
    );
}

export default RegistrosNFC;
