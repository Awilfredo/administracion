import Search from "@/Components/Search";
import MarcasFiltro from "@/Components/MarcasFiltro";
import LoadingF from "@/Components/LoadingF";
import { ExportCSV } from "@/Helpers/ExportCSV";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

function Marcaciones({ auth, marcas }) {
    const keys = ["anacod", "ananam"];
    const { props } = usePage();
    const filters = props.filters || {};
    const { fechaActual } = ManejoFechas();
    const { downloadCSV, Export } = ExportCSV();

    const [preset, setPreset] = useState(filters.preset ?? "hoy");
    const [fechaIni, setFechaIni] = useState(filters.fecha ?? fechaActual());
    const [fechaFin, setFechaFin] = useState(filters.fecha_fin ?? fechaActual());
    const [usuario, setUsuario] = useState(filters.usuario ?? "");
    const [resultados, setResultados] = useState(marcas);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setResultados(marcas);
    }, [marcas]);

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
            only: ["marcas", "filters"],
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, [fechaIni, fechaFin, usuario, preset]);

    const columns = useMemo(
        () => [
            {
                name: "Index",
                selector: (row, index) => index + 1,
                sortable: true,
                maxWidth: "5px",
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
                wrap: true,
                minWidth: "200px",
                maxWidth: "300px",
            },
            {
                name: "Jefe",
                selector: (row) => row.anajef || "Sin marca",
                sortable: true,
                wrap: true,
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
        ],
        []
    );

    const handleExport = useCallback(() => {
        downloadCSV(
            resultados,
            [
                "anacod",
                "ananam",
                "anajef",
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
            `Marcas ${fechaActual()}`
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
                    Marcaciones
                </h2>
            }
        >
            <Head title="Marcaciones" />

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
                    datos={marcas}
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

export default Marcaciones;
