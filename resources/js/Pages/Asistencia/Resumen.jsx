import CloseButton from "@/Components/CloseButton";
import EmptyState from "@/Components/EmptyState";
import GraficaCircular from "@/Components/GraficaCircular";
import LoadingF from "@/Components/LoadingF";
import Modal from "@/Components/Modal";
import ResumenKPIs from "@/Components/Resumen/ResumenKPIs";
import TendenciaChart from "@/Components/Resumen/TendenciaChart";
import TopList from "@/Components/Resumen/TopList";
import Search from "@/Components/Search";
import { ExportCSV } from "@/Helpers/ExportCSV";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiCalendar, HiX } from "react-icons/hi";
import DataTable from "react-data-table-component";

function Resumen({
    auth,
    eventos,
    kpis,
    tendencia,
    porJefe,
    topImpuntuales,
    topPontuales,
}) {
    const { props } = usePage();
    const filters = props.filters || {};
    const { downloadCSV, Export } = ExportCSV();
    const { meses, mesActual, anioActual } = ManejoFechas();

    const [mes, setMes] = useState(filters.mes ?? mesActual());
    const [anio, setAnio] = useState(filters.anio ?? anioActual());
    const [resultados, setResultados] = useState(eventos ?? []);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [eventosUsuario, setEventosUsuario] = useState([]);
    const [usuarioDetalle, setUsuarioDetalle] = useState(null);

    useEffect(() => {
        setResultados(eventos ?? []);
    }, [eventos]);

    useEffect(() => {
        setLoading(false);
    }, []);

    const aniosDisponibles = useMemo(() => {
        const actual = parseInt(anioActual());
        return Array.from({ length: 5 }, (_, i) => String(actual - 2 + i));
    }, [anioActual]);

    const cambiarPeriodo = useCallback((nuevoMes, nuevoAnio) => {
        setLoading(true);
        router.reload({
            data: { mes: nuevoMes, anio: nuevoAnio },
            only: [
                "eventos",
                "kpis",
                "tendencia",
                "porJefe",
                "topImpuntuales",
                "topPontuales",
                "filters",
            ],
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    }, []);

    useEffect(() => {
        if (filters.mes && filters.mes !== mes) setMes(filters.mes);
        if (filters.anio && filters.anio !== anio) setAnio(filters.anio);
    }, [filters.mes, filters.anio]);

    const handleChangeMes = (e) => {
        const nuevoMes = e.target.value;
        setMes(nuevoMes);
        cambiarPeriodo(nuevoMes, anio);
    };

    const handleChangeAnio = (e) => {
        const nuevoAnio = e.target.value;
        setAnio(nuevoAnio);
        cambiarPeriodo(mes, nuevoAnio);
    };

    const handleVerDetalle = useCallback(async (anacod) => {
        try {
            const response = await fetch(
                route("usuario.resumen", [anacod, "Tarde"])
            );
            const data = await response.json();
            const empleado = (eventos ?? []).find((e) => e.anacod === anacod);
            setUsuarioDetalle(empleado);
            const otrosEventos = (eventos ?? []).find((e) => e.anacod === anacod);
            setEventosUsuario(otrosEventos || []);
            setShowModal(true);
        } catch (err) {
            console.error(err);
        }
    }, [eventos]);

    const handleTopItemClick = useCallback((item) => {
        const resultado = (eventos ?? []).find((e) => e.anacod === item.anacod);
        if (resultado) {
            setUsuarioDetalle(resultado);
            setEventosUsuario(resultado);
            setShowModal(true);
        }
    }, [eventos]);

    const closeModal = () => {
        setShowModal(false);
        setUsuarioDetalle(null);
        setEventosUsuario([]);
    };

    const dataCircular = useMemo(() => {
        const suma = eventos?.reduce(
            (acc, e) => ({
                Tarde: acc.Tarde + (parseInt(e.veces_tarde) || 0),
                Ausencia: acc.Ausencia + (parseInt(e.veces_ausente) || 0),
                "Salida antes": acc["Salida antes"] + (parseInt(e.veces_salidas_antes) || 0),
                "Sin nfc": acc["Sin nfc"] + (parseInt(e.veces_sin_nfc) || 0),
            }),
            { Tarde: 0, Ausencia: 0, "Salida antes": 0, "Sin nfc": 0 }
        );

        return [
            { name: "Llegadas tarde", value: suma.Tarde },
            { name: "Ausencias", value: suma.Ausencia },
            { name: "Salidas Antes", value: suma["Salida antes"] },
            { name: "Sin NFC", value: suma["Sin nfc"] },
        ].filter((d) => d.value > 0);
    }, [eventos]);

    const columns = useMemo(
        () => [
            {
                name: "USUARIO",
                selector: (row) => row.anacod,
                sortable: true,
                width: "120px",
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
                name: "JEFE",
                selector: (row) => row.anajef,
                sortable: true,
            },
            {
                name: "TARDE",
                selector: (row) => row.veces_tarde,
                sortable: true,
                right: true,
                cell: (row) => (
                    <span
                        className={`font-semibold ${
                            row.veces_tarde > 3
                                ? "text-red-600"
                                : row.veces_tarde > 0
                                ? "text-amber-600"
                                : "text-gray-400"
                        }`}
                    >
                        {row.veces_tarde}
                    </span>
                ),
            },
            {
                name: "AUSENCIA",
                selector: (row) => row.veces_ausente,
                sortable: true,
                right: true,
                cell: (row) => (
                    <span
                        className={`font-semibold ${
                            row.veces_ausente > 0 ? "text-red-600" : "text-gray-400"
                        }`}
                    >
                        {row.veces_ausente}
                    </span>
                ),
            },
            {
                name: "SIN NFC",
                selector: (row) => row.veces_sin_nfc,
                sortable: true,
                right: true,
                cell: (row) => (
                    <span
                        className={`font-semibold ${
                            row.veces_sin_nfc > 0 ? "text-purple-600" : "text-gray-400"
                        }`}
                    >
                        {row.veces_sin_nfc}
                    </span>
                ),
            },
            {
                name: "SALIDA ANTES",
                selector: (row) => row.veces_salidas_antes,
                sortable: true,
                right: true,
                cell: (row) => (
                    <span
                        className={`font-semibold ${
                            row.veces_salidas_antes > 0 ? "text-blue-600" : "text-gray-400"
                        }`}
                    >
                        {row.veces_salidas_antes}
                    </span>
                ),
            },
            {
                name: "TOTAL",
                selector: (row) =>
                    (parseInt(row.veces_tarde) || 0) +
                    (parseInt(row.veces_ausente) || 0) +
                    (parseInt(row.veces_sin_nfc) || 0) +
                    (parseInt(row.veces_salidas_antes) || 0),
                sortable: true,
                right: true,
                cell: (row) => {
                    const total =
                        (parseInt(row.veces_tarde) || 0) +
                        (parseInt(row.veces_ausente) || 0) +
                        (parseInt(row.veces_sin_nfc) || 0) +
                        (parseInt(row.veces_salidas_antes) || 0);
                    return (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 font-semibold text-sm">
                            {total}
                        </span>
                    );
                },
            },
            {
                name: "ACCIÓN",
                sortable: false,
                width: "110px",
                cell: (row) => (
                    <button
                        onClick={() => handleVerDetalle(row.anacod)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white rounded-lg transition-all font-medium"
                    >
                        Ver detalle
                    </button>
                ),
            },
        ],
        [handleVerDetalle]
    );

    const conditionalRowStyles = useMemo(
        () => [
            {
                when: (row) => {
                    const total =
                        (parseInt(row.veces_tarde) || 0) +
                        (parseInt(row.veces_ausente) || 0) +
                        (parseInt(row.veces_sin_nfc) || 0) +
                        (parseInt(row.veces_salidas_antes) || 0);
                    return total > 5;
                },
                style: {
                    backgroundColor: "#fee2e2",
                    "&:hover": { cursor: "pointer", backgroundColor: "#fecaca" },
                },
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
                "veces_tarde",
                "veces_ausente",
                "veces_sin_nfc",
                "veces_salidas_antes",
            ],
            `Resumen ${mes}-${anio}`
        );
    }, [resultados, mes, anio, downloadCSV]);

    const descargar = useMemo(
        () => <Export onExport={handleExport} />,
        [handleExport, Export]
    );

    const mesNombre = meses.find((m) => String(m.value) === String(mes))?.name ?? mes;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Resumen mensual
                </h2>
            }
        >
            <Head title={`Resumen ${mesNombre} ${anio}`} />

            <div className="m-10 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HiCalendar className="w-4 h-4" />
                        <span>
                            Período: <strong>{mesNombre} {anio}</strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="relative">
                            <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                onChange={handleChangeMes}
                                value={mes}
                                disabled={loading}
                                className="pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50"
                            >
                                {meses.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <select
                            onChange={handleChangeAnio}
                            value={anio}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50"
                        >
                            {aniosDisponibles.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <ResumenKPIs kpis={kpis} tendencia={tendencia} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TendenciaChart data={tendencia} />

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-pink-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">
                                    Distribución por tipo
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Total de eventos del mes
                                </p>
                            </div>
                        </div>
                        {dataCircular.length > 0 ? (
                            <GraficaCircular data={dataCircular} />
                        ) : (
                            <EmptyState
                                icon={HiCalendar}
                                title="Sin eventos"
                                description="No hay eventos registrados este mes"
                                color="green"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopList
                        items={topImpuntuales}
                        tipo="impuntuales"
                        onItemClick={handleTopItemClick}
                    />
                    <TopList
                        items={topPontuales}
                        tipo="pontuales"
                        onItemClick={handleTopItemClick}
                    />
                </div>

                {porJefe && porJefe.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">
                            Eventos por jefe
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {porJefe.map((j) => (
                                <div
                                    key={j.jefe}
                                    className="p-4 rounded-xl bg-gray-50 border border-gray-200"
                                >
                                    <p className="font-medium text-gray-800 truncate">
                                        {j.jefe}
                                    </p>
                                    <div className="grid grid-cols-4 gap-1 mt-2 text-xs">
                                        <div>
                                            <p className="text-amber-600 font-semibold">
                                                {j.tardes}
                                            </p>
                                            <p className="text-gray-500">Tarde</p>
                                        </div>
                                        <div>
                                            <p className="text-red-600 font-semibold">
                                                {j.ausencias}
                                            </p>
                                            <p className="text-gray-500">Ausen</p>
                                        </div>
                                        <div>
                                            <p className="text-purple-600 font-semibold">
                                                {j.sin_nfc}
                                            </p>
                                            <p className="text-gray-500">NFC</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-600 font-semibold">
                                                {j.salidas_antes}
                                            </p>
                                            <p className="text-gray-500">S.Ants</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">Total eventos</p>
                                        <p className="text-xl font-bold text-gray-800">
                                            {j.total}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                        Detalle por empleado
                    </h3>
                    <Search
                        datos={eventos ?? []}
                        placeholder="Buscar empleado..."
                        keys={["anacod", "ananam", "anajef"]}
                        setResultados={setResultados}
                    />
                    <DataTable
                        columns={columns}
                        data={resultados}
                        fixedHeader
                        conditionalRowStyles={conditionalRowStyles}
                        actions={descargar}
                        pagination
                        paginationPerPage={20}
                    />
                </div>
            </div>

            <Modal show={showModal} maxWidth="lg" closeable onClose={closeModal}>
                {usuarioDetalle ? (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {usuarioDetalle.ananam}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {usuarioDetalle.anacod} · {usuarioDetalle.anajef}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                <p className="text-xs text-amber-700 font-medium">Llegadas tarde</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">
                                    {usuarioDetalle.veces_tarde}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-xs text-red-700 font-medium">Ausencias</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {usuarioDetalle.veces_ausente}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                                <p className="text-xs text-purple-700 font-medium">Sin NFC</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">
                                    {usuarioDetalle.veces_sin_nfc}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                <p className="text-xs text-blue-700 font-medium">Salida antes</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    {usuarioDetalle.veces_salidas_antes}
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-4 text-center">
                            Período: {mesNombre} {anio}
                        </p>
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-400">
                        <p>Cargando detalle...</p>
                    </div>
                )}
            </Modal>

            <LoadingF loading={loading} />
        </AuthenticatedLayout>
    );
}

export default Resumen;
