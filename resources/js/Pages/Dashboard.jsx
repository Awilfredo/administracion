import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import Sparkline from "./Dashboard/Sparkline";
import BarChartMini from "./Dashboard/BarChartMini";
import StackedBarsMini from "./Dashboard/StackedBarsMini";
import LineChartMini from "./Dashboard/LineChartMini";
import CalendarCumple from "./Dashboard/CalendarCumple";

function TrendBadge({ value, lowerIsBetter = true }) {
    if (value === 0 || value == null) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                = sin cambios
            </span>
        );
    }
    const negative = value < 0;
    const arrow = negative ? "▼" : "▲";
    const improved = lowerIsBetter ? negative : !negative;
    const color = improved ? "text-green-600" : "text-red-600";
    const bg = improved ? "bg-green-50" : "bg-red-50";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${color}`}
            title={improved ? "Mejor que el mes pasado" : "Peor que el mes pasado"}
        >
            <span>{arrow}</span>
            <span>{Math.abs(value)}</span>
            <span className="text-gray-500">vs mes anterior</span>
        </span>
    );
}

const Icons = {
    Users: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4zm0 2c-4.1 0-8 2.6-8 5v2h16v-2c0-2.4-3.9-5-8-5zM18 12c1.7 0 3-1.3 3-3s-1.3-3-3-3c-.5 0-.9.1-1.3.3c.8 1 1.3 2.3 1.3 3.7c0 .7-.1 1.4-.3 2c.1 0 .2 0 .3 0zm-12 0c.1 0 .2 0 .3 0c-.2-.6-.3-1.3-.3-2c0-1.4.5-2.7 1.3-3.7C6.9 6.1 6.5 6 6 6c-1.7 0-3 1.3-3 3s1.3 3 3 3z" />
        </svg>
    ),
    Fingerprint: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M7 10c1.1-1 2.5-1.5 4-1.5s2.9.5 4 1.5" />
            <path d="M7 14c1.1 1 2.5 1.5 4 1.5s2.9-.5 4-1.5" />
            <path d="M9.5 12h3" />
        </svg>
    ),
    Clock: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
    ),
    X: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.48 10 10 10 10-4.48 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
        </svg>
    ),
    Early: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-9c.83 0 1.5-.67 1.5-1.5S7.33 8 6.5 8 5 8.67 5 9.5 5.67 11 6.5 11zm3.5-3c.83 0 1.5-.67 1.5-1.5S10.83 5 10 5s-1.5.67-1.5 1.5S9.17 8 10 8zm5 0c.83 0 1.5-.67 1.5-1.5S15.83 5 15 5s-1.5.67-1.5 1.5S14.17 8 15 8zm3 3c.83 0 1.5-.67 1.5-1.5S18.83 7 18 7s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
        </svg>
    ),
    Alert: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
        </svg>
    ),
    Pending: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
    ),
    Check: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    ),
    Link: () => (
        <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
    ),
};

function formatMesLabel(yyyymm) {
    if (!yyyymm) return "";
    const [y, m] = yyyymm.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleDateString("es-SV", {
        month: "long",
        year: "numeric",
    });
}

function Card({ title, value, subtitle, icon, link, trend, color = "gray" }) {
    const colorClasses = {
        gray: "text-gray-400",
        orange: "text-orange-400",
        red: "text-red-400",
        yellow: "text-yellow-500",
        green: "text-green-500",
        blue: "text-blue-400",
    };
    const body = (
        <div className="bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow duration-200 h-full">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                    {trend !== undefined && (
                        <div className="mt-2">
                            <TrendBadge value={trend} />
                        </div>
                    )}
                </div>
                {icon && <div className={colorClasses[color] ?? "text-gray-400"}>{icon}</div>}
            </div>
        </div>
    );
    return link ? (
        <Link href={route(link)} className="block h-full">
            {body}
        </Link>
    ) : (
        body
    );
}

function TopList({ title, rows, link, emptyMessage = "Sin datos en los últimos 30 días" }) {
    return (
        <div className="bg-white shadow-md rounded-lg p-5 h-full">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {title}
                </h4>
                {link && (
                    <Link
                        href={route(link)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                        Ver detalle →
                    </Link>
                )}
            </div>
            {rows.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">{emptyMessage}</p>
            ) : (
                <table className="w-full text-sm">
                    <thead className="text-left text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="pb-1">#</th>
                            <th className="pb-1">Empleado</th>
                            <th className="pb-1 text-right">Eventos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, idx) => (
                            <tr key={r.anacod} className="border-t border-gray-100">
                                <td className="py-1.5 text-gray-500">{idx + 1}</td>
                                <td className="py-1.5">
                                    <div className="font-medium text-gray-800 truncate" title={r.ananam}>
                                        {r.ananam}
                                    </div>
                                    <div className="text-xs text-gray-500">{r.anacod}</div>
                                </td>
                                <td className="py-1.5 text-right">
                                    <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
                                        {r.veces}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {title}
            </h3>
            {children}
        </section>
    );
}

export default function Dashboard({ auth, data }) {
    const safe = data ?? {};
    const hoy = safe.hoy ?? {
        fecha: "",
        empleados_activos: 0,
        registros_nfc: 0,
        eventos: { total: 0, justificados: 0, pendientes: 0 },
        sin_nfc: 0,
    };
    const mes = safe.mes ?? {
        mes: "",
        tarde: 0,
        ausente: 0,
        salidas: 0,
        pendientes: 0,
        justificados: 0,
    };
    const comparativa = safe.comparativa ?? {
        tarde: 0,
        ausente: 0,
        salidas: 0,
        pendientes: 0,
    };
    const tendencia = safe.tendencia ?? { labels: [], tarde: [], ausente: [], salidas: [] };
    const top = safe.top ?? { tarde: [], ausente: [] };
    const extra = safe.extra ?? {
        por_area: [], antiguedad: { anios_promedio: 0, con_ingreso: 0, distribucion: {} },
        por_dia_semana: { labels: [], data: [] }, sin_marcaciones_nfc_3d: [], sin_marcaciones_huella_3d: [], por_pais: [],
        freelance: { activos: 0, total: 0 }, por_jefe: [], por_hora: [],
        tasa_justificacion: { labels: [], tasa: [] }, crecimiento: { labels: [], altas: [], bajas: [] },
        ultimas_altas: [], ultimas_bajas: [],         cumpleanos_mes: { mes: '', items: [] },
        top_posiciones: [], por_horario: [], tasa_puntualidad: {},
        periodo_prueba: 0, periodo_prueba_list: [], top_pendientes: [], antiguedad_por_area: [],
        huerfanos_nfc: [], prox_jubilarse: [], top_antiguedad: [],
        cumpleanos_hoy: [], prox_cumpleanos: [],
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Resumen del día
                    </h2>
                </div>
            }
        >
            <Head title="Dashboard" />
            <div className="mx-10 my-6">
                {/* SECCIÓN 1: HOY */}
                <Section title={`Hoy (${hoy.fecha})`}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card
                            title="Empleados activos"
                            value={hoy.empleados_activos}
                            icon={<Icons.Users />}
                            link="empleados.index"
                            color="blue"
                        />
                        <Card
                            title="Registros NFC"
                            value={hoy.registros_nfc}
                            icon={<Icons.Fingerprint />}
                            color="green"
                        />
                        <Card
                            title="Eventos hoy"
                            value={hoy.eventos.total}
                            subtitle={`${hoy.eventos.pendientes} pendientes · ${hoy.eventos.justificados} justificados`}
                            icon={<Icons.Alert />}
                            color="yellow"
                        />
                        <Card
                            title="Sin NFC vinculado"
                            value={hoy.sin_nfc}
                            icon={<Icons.Link />}
                            color="orange"
                        />
                    </div>
                </Section>

                {/* SECCIÓN 2: ESTE MES */}
                <Section title={`Este mes (${formatMesLabel(mes.mes)}) vs mes anterior`}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card
                            title="Llegadas tarde"
                            value={mes.tarde}
                            trend={comparativa.tarde}
                            icon={<Icons.Clock />}
                            link="resumen"
                        />
                        <Card
                            title="Ausencias"
                            value={mes.ausente}
                            trend={comparativa.ausente}
                            icon={<Icons.X />}
                            link="resumen"
                            color="red"
                        />
                        <Card
                            title="Salidas antes de hora"
                            value={mes.salidas}
                            trend={comparativa.salidas}
                            icon={<Icons.Early />}
                            link="resumen"
                            color="yellow"
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <Card
                            title="Eventos pendientes de justificar"
                            value={mes.pendientes}
                            trend={comparativa.pendientes}
                            icon={<Icons.Pending />}
                            color="orange"
                        />
                        <Card
                            title="Acciones personales justificadas"
                            value={mes.justificados}
                            icon={<Icons.Check />}
                            color="green"
                        />
                    </div>
                </Section>

                {/* SECCIÓN 3: TENDENCIAS Y CRECIMIENTO */}
                <Section title="Tendencias y crecimiento (6 meses)">
                    <div className="bg-white shadow-md rounded-lg p-5 mb-4">
                        <p className="text-sm text-gray-500 mb-2">Tendencia diaria (30 días)</p>
                        <Sparkline data={tendencia} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">Tasa de justificación</p>
                            <LineChartMini
                                data={(extra?.tasa_justificacion?.labels ?? []).map((l, i) => ({
                                    label: l,
                                    Justificados: extra.tasa_justificacion.tasa[i] ?? 0,
                                }))}
                                lines={["Justificados"]}
                                unit="%"
                                xKey="label"
                            />
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">Eventos por día de la semana</p>
                            <StackedBarsMini
                                data={(extra?.por_dia_semana?.data ?? []).map((d, i) => ({
                                    label: extra.por_dia_semana.labels[i],
                                    ...d,
                                }))}
                                series={["tarde", "ausente", "salidas"]}
                                xKey="label"
                            />
                        </div>
                    </div>
                </Section>

                {/* SECCIÓN 6: ALERTAS NFC Y HUELLA */}
                <Section title="Alertas NFC y huella (3 días)">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Sin marca NFC</span>
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">NFC</span>
                            </p>
                            {(extra?.sin_marcaciones_nfc_3d ?? []).length === 0 ? (
                                <p className="text-sm text-gray-500">Sin alertas.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 uppercase border-b">
                                        <tr>
                                            <th className="pb-1">Empleado</th>
                                            <th className="pb-1">Área</th>
                                            <th className="pb-1 text-right">Última marca</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(extra.sin_marcaciones_nfc_3d).map(r => (
                                            <tr key={r.anacod} className="border-b border-gray-100">
                                                <td className="py-1.5">
                                                    <Link href={route("empleados.show", { anacod: r.anacod })} className="text-indigo-600 hover:text-indigo-800">
                                                        {r.ananam}
                                                    </Link>
                                                    <div className="text-xs text-gray-500">{r.anacod}</div>
                                                </td>
                                                <td className="py-1.5 text-gray-600 text-xs">{r.anarea ?? "—"}</td>
                                                <td className="py-1.5 text-right text-gray-600 text-xs">
                                                    {r.ultima_marca ?? "(nunca)"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Sin marca huella</span>
                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Huella</span>
                            </p>
                            {(extra?.sin_marcaciones_huella_3d ?? []).length === 0 ? (
                                <p className="text-sm text-gray-500">Sin alertas.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 uppercase border-b">
                                        <tr>
                                            <th className="pb-1">Empleado</th>
                                            <th className="pb-1">Área</th>
                                            <th className="pb-1 text-right">Última marca</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(extra.sin_marcaciones_huella_3d).map(r => (
                                            <tr key={r.anacod} className="border-b border-gray-100">
                                                <td className="py-1.5">
                                                    <Link href={route("empleados.show", { anacod: r.anacod })} className="text-indigo-600 hover:text-indigo-800">
                                                        {r.ananam}
                                                    </Link>
                                                    <div className="text-xs text-gray-500">{r.anacod}</div>
                                                </td>
                                                <td className="py-1.5 text-gray-600 text-xs">{r.anarea ?? "—"}</td>
                                                <td className="py-1.5 text-right text-gray-600 text-xs">
                                                    {r.ultima_marca ?? "(nunca)"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </Section>

                {/* SECCIÓN 4: TOP LISTAS */}
                <Section title="Quién más acumula (30 días)">
                    <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                        <TopList
                            title="Top 5 con más llegadas tarde"
                            rows={top.tarde}
                            link="resumen"
                        />
                        <TopList
                            title="Top 5 con más ausencias"
                            rows={top.ausente}
                            link="resumen"
                        />
                    </div>
                </Section>

                {/* SECCIÓN 5: CRECIMIENTO NETO */}
                <Section title="Crecimiento neto (6 meses)">
                    <div className="bg-white shadow-md rounded-lg p-5">
                        <StackedBarsMini
                            data={(extra?.crecimiento?.labels ?? []).map((l, i) => ({
                                label: l,
                                altas: extra.crecimiento.altas[i] ?? 0,
                                bajas: extra.crecimiento.bajas[i] ?? 0,
                            }))}
                            series={["bajas", "altas"]}
                            xKey="label"
                        />
                    </div>
                </Section>
                                    {/* Sub-grupo 7.4: Movimiento de personal */}
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-6">
                        Movimiento de personal
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Últimas altas</span>
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">ING</span>
                            </p>
                            {(extra?.ultimas_altas ?? []).length === 0 ? (
                                <p className="text-sm text-gray-500">Sin altas recientes.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 uppercase border-b">
                                        <tr>
                                            <th className="pb-1">Empleado</th>
                                            <th className="pb-1">País</th>
                                            <th className="pb-1">Área</th>
                                            <th className="pb-1 text-right">Ingreso</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extra.ultimas_altas.map(r => (
                                            <tr key={r.anacod} className="border-b border-gray-100">
                                                <td className="py-1.5">
                                                    <Link href={route("empleados.show", { anacod: r.anacod })} className="text-indigo-600 hover:text-indigo-800">
                                                        {r.ananam}
                                                    </Link>
                                                    <div className="text-xs text-gray-500 font-mono">{r.anacod}</div>
                                                </td>
                                                <td className="py-1.5">
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.anapai === 'SV' ? 'bg-blue-50 text-blue-700' : r.anapai === 'GT' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'}`}>
                                                        {r.anapai ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="py-1.5 text-gray-600 text-xs">{r.anarea ?? "—"}</td>
                                                <td className="py-1.5 text-right text-gray-600 text-xs">{r.fecha_ingreso}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Últimas bajas</span>
                                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">BAJ</span>
                            </p>
                            {(extra?.ultimas_bajas ?? []).length === 0 ? (
                                <p className="text-sm text-gray-500">Sin bajas recientes.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 uppercase border-b">
                                        <tr>
                                            <th className="pb-1">Empleado</th>
                                            <th className="pb-1">País</th>
                                            <th className="pb-1">Área</th>
                                            <th className="pb-1 text-right">Fecha baja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extra.ultimas_bajas.map(r => (
                                            <tr key={r.anacod} className="border-b border-gray-100">
                                                <td className="py-1.5">
                                                    <Link href={route("empleados.show", { anacod: r.anacod })} className="text-indigo-600 hover:text-indigo-800">
                                                        {r.ananam}
                                                    </Link>
                                                    <div className="text-xs text-gray-500 font-mono">{r.anacod}</div>
                                                </td>
                                                <td className="py-1.5">
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.anapai === 'SV' ? 'bg-blue-50 text-blue-700' : r.anapai === 'GT' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'}`}>
                                                        {r.anapai ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="py-1.5 text-gray-600 text-xs">{r.anarea ?? "—"}</td>
                                                <td className="py-1.5 text-right text-gray-600 text-xs">{r.fecha_baja}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                {/* SECCIÓN 5B: EMPLEADOS EN PERIODO DE PRUEBA */}
                <Section title={`Empleados en periodo de prueba (${(extra?.periodo_prueba_list ?? []).length})`}>
                    <div className="bg-white shadow-md rounded-lg p-5">
                        {(extra?.periodo_prueba_list ?? []).length === 0 ? (
                            <p className="text-sm text-gray-500">No hay empleados en periodo de prueba.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="pb-1">Código</th>
                                        <th className="pb-1">Nombre</th>
                                        <th className="pb-1">Área</th>
                                        <th className="pb-1">País</th>
                                        <th className="pb-1 text-right">Fecha ingreso</th>
                                        <th className="pb-1 text-right">Meses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(extra.periodo_prueba_list).map(r => (
                                        <tr key={r.anacod} className="border-b border-gray-100">
                                            <td className="py-1.5 font-mono text-xs text-gray-600">{r.anacod}</td>
                                            <td className="py-1.5">
                                                <Link href={route("empleados.show", { anacod: r.anacod })} className="text-indigo-600 hover:text-indigo-800">
                                                    {r.ananam}
                                                </Link>
                                            </td>
                                            <td className="py-1.5 text-gray-600 text-xs">{r.anarea ?? "—"}</td>
                                            <td className="py-1.5">
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.anapai === 'SV' ? 'bg-blue-50 text-blue-700' : r.anapai === 'GT' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'}`}>
                                                    {r.anapai ?? '—'}
                                                </span>
                                            </td>
                                            <td className="py-1.5 text-right text-gray-600 text-xs">{r.fecha_ingreso}</td>
                                            <td className="py-1.5 text-right">
                                                <span className="text-xs font-semibold text-amber-600">{r.meses}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Section>

                {/* SECCIÓN 7: DISTRIBUCIÓN */}
                <Section title="Distribución">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">Por área (top 10)</p>
                            <BarChartMini
                                data={(extra?.por_area ?? []).map(r => ({ label: r.area, value: r.empleados }))}
                                xKey="label"
                                dataKey="value"
                                color="#2563eb"
                                layout="horizontal"
                            />
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">SV vs GT</p>
                            <BarChartMini
                                data={(extra?.por_pais ?? []).map(r => ({ label: r.pais, value: r.activos }))}
                                xKey="label"
                                dataKey="value"
                                color="#06b6d4"
                                layout="horizontal"
                            />
                        </div>
                    </div>
                </Section>

                {/* SECCIÓN 8: ORGANIZACIÓN Y ALERTAS */}
                <Section title="Organización y alertas">
                    {/* Sub-grupo 7.1: Organización */}
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-2">
                        Organización
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
                        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col">
                            <p className="text-sm text-gray-500">Antigüedad del personal</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {(extra?.antiguedad?.anios_promedio ?? 0).toFixed(1)} <span className="text-base text-gray-500 font-normal">años</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {extra?.antiguedad?.con_ingreso ?? 0} empleados con fecha de ingreso
                            </p>
                            <div className="mt-3 space-y-1 text-xs flex-1">
                                {Object.entries(extra?.antiguedad?.distribucion ?? {}).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="text-gray-600">{k}</span>
                                        <span className="font-semibold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-2">Por jefe (top 5)</p>
                            <BarChartMini
                                data={(extra?.por_jefe ?? []).map(r => ({ label: r.anajef, value: r.reportes }))}
                                xKey="label"
                                dataKey="value"
                                color="#8b5cf6"
                                layout="horizontal"
                            />
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5 flex flex-col">
                            <p className="text-sm text-gray-500">Empleados freelance</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">
                                {extra?.freelance?.activos ?? 0} <span className="text-base text-gray-500 font-normal">/ {extra?.freelance?.total ?? 0}</span>
                            </p>
                        </div>
                    </div>

                    {/* Sub-grupo 7.2: Top antiguedad */}
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-6">
                        Top 10 con más antigüedad
                    </h4>
                    <div className="bg-white shadow-md rounded-lg p-5">
                        {(extra?.top_antiguedad ?? []).length === 0 ? (
                            <p className="text-sm text-gray-500">Sin datos de antigüedad.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="pb-1">Empleado</th>
                                        <th className="pb-1">Área</th>
                                        <th className="pb-1">País</th>
                                        <th className="pb-1 text-right">Antigüedad</th>
                                        <th className="pb-1 text-right">Fecha ingreso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(extra.top_antiguedad).map(r => (
                                        <tr key={r.anacod} className="border-b border-gray-100">
                                            <td className="py-1.5">
                                                <Link href={route("empleados.show", { anacod: r.anacod })} className="text-indigo-600 hover:text-indigo-800">
                                                    {r.ananam}
                                                </Link>
                                                <div className="text-xs text-gray-500 font-mono">{r.anacod}</div>
                                            </td>
                                            <td className="py-1.5 text-gray-600 text-xs">{r.anarea ?? "—"}</td>
                                            <td className="py-1.5">
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${r.anapai === 'SV' ? 'bg-blue-50 text-blue-700' : r.anapai === 'GT' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'}`}>
                                                    {r.anapai ?? '—'}
                                                </span>
                                            </td>
                                            <td className="py-1.5 text-right text-gray-600 text-xs">{r.anios} años</td>
                                            <td className="py-1.5 text-right text-gray-600 text-xs">{r.fecha_ingreso}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>



                    {/* Sub-grupo 7.5: Cumpleaños */}
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-6">
                        Cumpleaños
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Próximos (7 días)</span>
                                <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">7d</span>
                            </p>
                            {(extra?.prox_cumpleanos ?? []).length === 0 ? (
                                <p className="text-sm text-gray-500">Nadie cumple años en los próximos 7 días.</p>
                            ) : (
                                <div className="space-y-1">
                                    {(extra.prox_cumpleanos).map(r => (
                                        <Link
                                            key={r.anacod}
                                            href={route("empleados.show", { anacod: r.anacod })}
                                            className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-pink-50 text-sm"
                                        >
                                            <span className="truncate">
                                                <span className="font-medium text-pink-700">{r.ananam}</span>
                                                <span className="ml-1 text-xs text-gray-500 font-mono">{r.anacod}</span>
                                            </span>
                                            <span className="text-xs text-gray-600 whitespace-nowrap">
                                                {r.fecha?.slice(5)} · {r.anarea ?? "—"}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Del mes</span>
                                <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">mes</span>
                            </p>
                            <p className="text-xs text-gray-400">
                                {(extra?.cumpleanos_mes?.items ?? []).length} empleado(s) cumplen este mes
                            </p>
                        </div>
                    </div>
                    <CalendarCumple data={extra?.cumpleanos_mes ?? { mes: '', items: [] }} />
                </Section>
            </div>
        </AuthenticatedLayout>
    );
}
