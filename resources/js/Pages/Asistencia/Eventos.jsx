import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { ExportCSV } from "@/Helpers/ExportCSV";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import MarcasFiltro from "@/Components/MarcasFiltro";
import Search from "@/Components/Search";
import LoadingF from "@/Components/LoadingF";

export default function Eventos({ auth, tiposAccion = [] }) {
    const { props } = usePage();
    const { fechaActual } = ManejoFechas();
    const { downloadCSV, Export } = ExportCSV();

    const initialAsistencias = props.asistencias ?? [];
    const initialFilters = props.filters ?? {};

    const [preset, setPreset] = useState("hoy");
    const [fechaIni, setFechaIni] = useState(initialFilters.fecha ?? fechaActual());
    const [fechaFin, setFechaFin] = useState(initialFilters.fecha_fin ?? fechaActual());
    const [usuario, setUsuario] = useState(initialFilters.usuario ?? "");
    const [resultados, setResultados] = useState(initialAsistencias);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setResultados(props.asistencias ?? []);
    }, [props.asistencias]);

    const handleExport = useCallback(() => {
        downloadCSV(
            resultados,
            ["id", "anacod", "ananam", "evento", "fecha", "accion_personal"],
            `Eventos ${fechaActual()}`
        );
    }, [resultados, fechaActual, downloadCSV]);

    const descargar = useMemo(
        () => <Export onExport={handleExport} />,
        [handleExport, Export]
    );

    const handleSearch = () => {
        setLoading(true);
        router.reload({
            data: {
                fecha: fechaIni,
                fecha_fin: fechaIni === fechaFin ? null : fechaFin,
                usuario: usuario || null,
            },
            only: ["asistencias", "filters"],
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const columns = [
        {
            name: "FECHA",
            selector: (row) => row.fecha,
            sortable: true,
        },
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "NOMBRE",
            selector: (row) => row.ananam,
            sortable: true,
            wrap: true,
            minWidth: "200px",
            maxWidth: "300px",
        },
        {
            name: "Evento",
            selector: (row) => row.evento,
            sortable: true,
        },
        {
            name: "Accion",
            selector: (row) =>
                row.accion_personal
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                          {row.accion_personal}
                      </span>
                    : <span className="text-gray-400">—</span>,
            sortable: true,
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Eventos de asistencia
                </h2>
            }
        >
            <Head title="Eventos de asistencia" />

            <div className="py-2 px-5">
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
                <p className="text-xs text-gray-500 mb-3">
                    Las acciones de personal se asignan automáticamente
                    desde el módulo de Acciones de personal. Esta vista es
                    de solo lectura.
                </p>
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg rounded-xl">
                    <Search
                        datos={props.asistencias ?? []}
                        setResultados={setResultados}
                        keys={["anacod", "ananam"]}
                        placeholder="Filtrar en resultados..."
                    />
                    <DataTable
                        data={resultados}
                        columns={columns}
                        fixedHeader
                        actions={descargar}
                    />
                </div>
                <LoadingF loading={loading} />
            </div>
        </AuthenticatedLayout>
    );
}
