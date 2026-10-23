import { useCallback, useEffect, useRef, useState } from "react";
import {
    HiOutlineCalendar,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlineInbox,
    HiOutlineOfficeBuilding,
    HiOutlineRefresh,
    HiOutlineSun,
    HiOutlineUsers,
    HiOutlineXCircle,
} from "react-icons/hi";
import { apiFetch } from "@/Helpers/apiFetch";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import GraficaCircular from "@/Components/GraficaCircular";
import MiniSparkline from "@/Components/MiniSparkline";
import StackedBarsMini from "@/Pages/Dashboard/StackedBarsMini";

const { formatDate } = ManejoFechas();

const PERIODOS = [
    { valor: "mes", etiqueta: "Mes actual" },
    { valor: "trimestre", etiqueta: "3 meses" },
    { valor: "semestre", etiqueta: "6 meses" },
    { valor: "anio", etiqueta: "12 meses" },
    { valor: "todo", etiqueta: "Todo" },
];

const COLORES_TIPO = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#dc2626",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f43f5e",
    "#a855f7",
    "#14b8a6",
    "#f97316",
];

const COLOR_PALETA = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", grad: "from-blue-500 to-blue-600" },
    green: { bg: "bg-green-50", text: "text-green-600", grad: "from-green-500 to-green-600" },
    red: { bg: "bg-red-50", text: "text-red-600", grad: "from-red-500 to-red-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", grad: "from-amber-500 to-amber-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", grad: "from-indigo-500 to-indigo-600" },
};

/* ------------------------------------------------------------------ */
/* Sistema de componentes visuales                                     */
/* ------------------------------------------------------------------ */

function Seccion({ titulo, children }) {
    return (
        <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">
                {titulo}
            </h2>
            {children}
        </section>
    );
}

function Card({ titulo, chip = null, children, className = "", bodyClassName = "" }) {
    return (
        <div
            className={`bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col ${className}`}
        >
            <div className="flex items-center justify-between gap-3 px-5 pt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {titulo}
                </h3>
                {chip}
            </div>
            <div className={`px-5 pb-5 pt-3 flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, suffix = "", color = "blue", hint = null, extra = null }) {
    const c = COLOR_PALETA[color] ?? COLOR_PALETA.blue;

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 truncate">
                        {label}
                    </p>
                    <p className="text-[28px] font-semibold tracking-tight text-slate-800 mt-1 leading-none">
                        {value}
                        {suffix && (
                            <span className="text-sm font-medium text-slate-400 ml-1">{suffix}</span>
                        )}
                    </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
            </div>

            {extra ? <div className="mt-3 -mx-1">{extra}</div> : null}
            {hint && !extra ? <p className="text-xs text-slate-500 mt-2 leading-relaxed">{hint}</p> : null}

            <div className={`mt-auto pt-4 h-[3px] rounded-full bg-gradient-to-r ${c.grad}`} />
        </div>
    );
}

function Chip({ children, tono = "slate" }) {
    const tonos = {
        slate: "bg-slate-100 text-slate-600",
        blue: "bg-blue-50 text-blue-700",
        green: "bg-green-50 text-green-700",
        red: "bg-red-50 text-red-700",
        amber: "bg-amber-50 text-amber-700",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tonos[tono] ?? tonos.slate}`}
        >
            {children}
        </span>
    );
}

function EstadoVacio({ icon: Icon = HiOutlineInbox, mensaje = "Sin datos en el período." }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400">
            <Icon className="w-7 h-7 mb-2" />
            <p className="text-xs">{mensaje}</p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Contenido de las cards                                             */
/* ------------------------------------------------------------------ */

function RankingBarras({ items, maxItems = 8, mostrarPromedio = false, etiquetaOtros = "Otros" }) {
    if (!items || items.length === 0) {
        return <EstadoVacio mensaje="Sin datos en el período." />;
    }

    const top = items.slice(0, maxItems);
    const resto = items.slice(maxItems);
    const filas = resto.length
        ? [
              ...top,
              {
                  label: `${etiquetaOtros} (${resto.length})`,
                  value: resto.reduce((suma, item) => suma + item.value, 0),
              },
          ]
        : top;
    const total = items.reduce((suma, item) => suma + item.value, 0) || 1;

    return (
        <ul className="space-y-1.5">
            {filas.map((item) => (
                <li key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-700 truncate" title={item.label}>
                            {item.label}
                        </span>
                        <span className="text-slate-500 font-medium shrink-0">
                            {item.value}
                            <span className="text-slate-400 ml-1">
                                ({Math.round((item.value / total) * 100)}%)
                            </span>
                            {mostrarPromedio && item.promedio_dias ? (
                                <span className="text-slate-400 ml-1.5">⌀ {item.promedio_dias} d</span>
                            ) : null}
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                            style={{ width: `${(item.value / total) * 100}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

function TopEmpleados({ items }) {
    if (!items || items.length === 0) {
        return <EstadoVacio mensaje="Sin datos en el período." />;
    }

    return (
        <div className="w-full">
            <table className="w-full text-sm">
                <thead className="text-left text-[11px] text-slate-400 uppercase">
                    <tr>
                        <th className="pb-1.5 w-6">#</th>
                        <th className="pb-1.5">Empleado</th>
                        <th className="pb-1.5 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.anacod} className="border-t border-slate-100">
                            <td className="py-1.5 text-slate-400 text-xs">{index + 1}</td>
                            <td className="py-1.5">
                                <div className="flex items-baseline gap-2 min-w-0">
                                    <span
                                        className="font-medium text-slate-800 truncate text-xs"
                                        title={item.nombre}
                                    >
                                        {item.nombre}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                        {item.anacod}
                                    </span>
                                </div>
                                {item.area ? (
                                    <span className="text-[11px] text-slate-400">{item.area}</span>
                                ) : null}
                            </td>
                            <td className="py-1.5 text-right">
                                <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                                    {item.total}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function BadgeDias({ dias }) {
    const valor = dias ?? 1;
    return (
        <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px] whitespace-nowrap">
            {valor} {valor === 1 ? "día" : "días"}
        </span>
    );
}

function FilaAccion({ accion }) {
    return (
        <div className="py-1.5 border-t border-slate-100 first:border-t-0">
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-medium text-slate-800 truncate" title={accion.nombre}>
                    {accion.nombre}
                </span>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">{accion.anacod}</span>
            </div>
            <div className="flex items-center justify-between gap-3 mt-0.5">
                <span className="text-[11px] text-slate-500 truncate" title={accion.motivo}>
                    {accion.tipo}
                </span>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDate(accion.fecha_inicio)}
                    {accion.fecha_fin ? ` → ${formatDate(accion.fecha_fin)}` : ""}
                    <BadgeDias dias={accion.dias} />
                </span>
            </div>
        </div>
    );
}

function ListaAcciones({ titulo, acciones, vacio }) {
    return (
        <div>
            <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-[11px] font-semibold text-slate-500">{titulo}</h4>
                <span className="text-[11px] text-slate-400">{acciones?.length ?? 0}</span>
            </div>
            {!acciones || acciones.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">{vacio}</p>
            ) : (
                <div>
                    {acciones.map((accion) => (
                        <FilaAccion key={accion.id} accion={accion} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TablaAcciones({ acciones }) {
    if (!acciones || acciones.length === 0) {
        return <EstadoVacio mensaje="Sin acciones registradas." />;
    }

    return (
        <div className="w-full">
            <table className="w-full text-sm">
                <thead className="text-left text-[11px] text-slate-400 uppercase">
                    <tr>
                        <th className="pb-1.5">Empleado</th>
                        <th className="pb-1.5">Tipo</th>
                        <th className="pb-1.5">Período</th>
                    </tr>
                </thead>
                <tbody>
                    {acciones.map((accion) => (
                        <tr key={accion.id} className="border-t border-slate-100">
                            <td className="py-1.5 pr-2">
                                <div className="flex items-baseline gap-2 min-w-0">
                                    <span
                                        className="font-medium text-slate-800 truncate text-xs max-w-[11rem]"
                                        title={`${accion.nombre} — ${accion.motivo ?? ""}`}
                                    >
                                        {accion.nombre}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                        {accion.anacod}
                                    </span>
                                </div>
                            </td>
                            <td className="py-1.5 pr-2 text-slate-600 text-xs whitespace-nowrap">
                                {accion.tipo}
                            </td>
                            <td className="py-1.5 text-slate-500 text-xs whitespace-nowrap">
                                {formatDate(accion.fecha_inicio)}
                                {accion.fecha_fin ? ` → ${formatDate(accion.fecha_fin)}` : ""}
                                <BadgeDias dias={accion.dias} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ChipComparativa({ comparativa }) {
    if (!comparativa) return null;

    const variacion = comparativa.variacion_pct;
    const sube = variacion > 0;
    const neutro = variacion === 0 || variacion === null;

    return (
        <span className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-500">
                {comparativa.mes_actual?.label}:{" "}
                <span className="font-semibold text-slate-700">{comparativa.mes_actual?.total ?? 0}</span>
            </span>
            <span
                className={`font-semibold ${
                    neutro ? "text-slate-400" : sube ? "text-blue-600" : "text-amber-600"
                }`}
            >
                {neutro ? "→ 0%" : `${sube ? "▲" : "▼"} ${Math.abs(variacion)}%`}
            </span>
            <span className="text-slate-400 hidden sm:inline">vs {comparativa.mes_anterior?.label}</span>
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export default function AccionesDashboard({ activo = true, datosIniciales = null }) {
    const [periodo, setPeriodo] = useState(datosIniciales?.periodo ?? "anio");
    const [data, setData] = useState(datosIniciales ?? null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const periodoCargado = useRef(datosIniciales?.periodo ?? null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const url = `${route("empleados.acciones.global.dashboard")}?periodo=${encodeURIComponent(periodo)}`;
            const respuesta = await apiFetch(url);
            setData(respuesta);
        } catch (e) {
            setError(e?.message || "No se pudo cargar la información del dashboard.");
        } finally {
            setCargando(false);
        }
    }, [periodo]);

    useEffect(() => {
        if (!activo) return;
        if (periodoCargado.current === periodo) return;
        periodoCargado.current = periodo;
        cargar();
    }, [activo, periodo, cargar]);

    if (!data && cargando) {
        return (
            <div className="flex items-center justify-center py-16">
                <div
                    style={{ borderTopColor: "transparent" }}
                    className="w-7 h-7 border-4 border-blue-200 rounded-full animate-spin"
                />
                <span className="ml-3 text-sm text-slate-500">Cargando dashboard…</span>
            </div>
        );
    }

    if (!data && error) {
        return (
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-10 text-center">
                <HiOutlineExclamation className="w-9 h-9 mx-auto text-red-400 mb-2" />
                <p className="text-sm text-slate-700">{error}</p>
                <button
                    type="button"
                    onClick={cargar}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                    <HiOutlineRefresh className="w-4 h-4" />
                    Reintentar
                </button>
            </div>
        );
    }

    if (!data) return null;

    const kpis = data.kpis ?? {};
    const comparativa = data.comparativa ?? {};
    const porTipo = data.por_tipo ?? [];
    const porArea = data.por_area ?? [];
    const evolucion = data.evolucion ?? [];
    const ultimas = data.ultimas ?? [];

    const hayCanceladas = (kpis.canceladas ?? 0) > 0;
    const seriesEvolucion = hayCanceladas ? ["aprobadas", "canceladas"] : ["aprobadas"];
    const coloresEvolucion = hayCanceladas
        ? { aprobadas: "#10b981", canceladas: "#dc2626" }
        : { aprobadas: "#2563eb" };

    const tiposPie = (() => {
        const top = porTipo.slice(0, 6);
        const resto = porTipo.slice(6);
        const datos = top.map((item) => ({ name: item.label, value: item.value }));
        if (resto.length > 0) {
            datos.push({
                name: `Otros (${resto.length})`,
                value: resto.reduce((suma, item) => suma + item.value, 0),
            });
        }
        return datos;
    })();

    const serieTotal = evolucion.map((item) => item.total);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 leading-tight">
                        Dashboard de acciones de personal
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Período {data.rango?.etiqueta ?? "—"}
                        {data.generado_at ? (
                            <span className="text-slate-400">
                                {" "}· actualizado {String(data.generado_at).slice(11)}
                            </span>
                        ) : null}
                        {cargando ? <span className="ml-2 text-blue-500">actualizando…</span> : null}
                    </p>
                </div>

                <div
                    className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"
                    role="group"
                    aria-label="Seleccionar período"
                >
                    {PERIODOS.map((opcion) => {
                        const activoPeriodo = periodo === opcion.valor;
                        return (
                            <button
                                key={opcion.valor}
                                type="button"
                                aria-pressed={activoPeriodo}
                                onClick={() => setPeriodo(opcion.valor)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                                    activoPeriodo
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-600 hover:bg-white/70"
                                }`}
                            >
                                {opcion.etiqueta}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Resumen */}
            <Seccion titulo="Resumen">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        icon={HiOutlineClipboardList}
                        label="Total acciones"
                        value={kpis.total ?? 0}
                        color="blue"
                        extra={
                            serieTotal.length > 1 ? (
                                <MiniSparkline data={serieTotal} color="#2563eb" height={40} />
                            ) : null
                        }
                    />
                    <KpiCard
                        icon={HiOutlineCheckCircle}
                        label="Aprobadas"
                        value={kpis.aprobadas ?? 0}
                        color="green"
                    />
                    <KpiCard
                        icon={HiOutlineXCircle}
                        label="Canceladas"
                        value={kpis.canceladas ?? 0}
                        color="red"
                    />
                    <KpiCard
                        icon={HiOutlineUsers}
                        label="Empleados"
                        value={kpis.empleados ?? 0}
                        color="indigo"
                        hint={`${kpis.areas ?? 0} áreas con acciones`}
                    />
                    <KpiCard
                        icon={HiOutlineSun}
                        label="Un solo día"
                        value={kpis.un_dia ?? 0}
                        color="indigo"
                        hint="sin fecha de fin o fin = inicio"
                    />
                    <KpiCard
                        icon={HiOutlineCalendar}
                        label="Multidía"
                        value={kpis.multidia ?? 0}
                        color="blue"
                        hint={`⌀ ${kpis.promedio_dias ?? 0} días por acción`}
                    />
                    <KpiCard
                        icon={HiOutlineClock}
                        label="Vigentes hoy"
                        value={kpis.vigentes ?? 0}
                        color="amber"
                        hint="cubre la fecha de hoy"
                    />
                    <KpiCard
                        icon={HiOutlineCalendar}
                        label="Próximas"
                        value={kpis.proximas ?? 0}
                        color="blue"
                        hint="próximos 30 días"
                    />
                </div>
            </Seccion>

            {/* Distribución */}
            <Seccion titulo="Distribución">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <Card
                        titulo="Evolución mensual"
                        chip={<ChipComparativa comparativa={comparativa} />}
                        className="lg:col-span-8"
                        bodyClassName="flex flex-col justify-center"
                    >
                        <div className="w-full shrink-0">
                            <StackedBarsMini
                                data={evolucion}
                                series={seriesEvolucion}
                                xKey="label"
                                colors={coloresEvolucion}
                                height={260}
                                maxBarSize={44}
                            />
                        </div>
                    </Card>

                    <Card
                        titulo="Distribución por área"
                        chip={<Chip>{kpis.areas ?? porArea.length} áreas</Chip>}
                        className="lg:col-span-4"
                        bodyClassName="flex flex-col justify-center"
                    >
                        <RankingBarras items={porArea} maxItems={8} />
                    </Card>

                    <Card
                        titulo="Distribución por tipo"
                        className="lg:col-span-4"
                        bodyClassName="flex flex-col justify-center"
                    >
                        <GraficaCircular
                            data={tiposPie}
                            colors={COLORES_TIPO}
                            height={180}
                            legendColumns={1}
                        />
                    </Card>

                    <Card
                        titulo="Ranking por tipo"
                        chip={<Chip>⌀ {kpis.promedio_dias ?? 0} d</Chip>}
                        className="lg:col-span-4"
                    >
                        <RankingBarras
                            items={porTipo}
                            maxItems={porTipo.length}
                            mostrarPromedio
                        />
                    </Card>

                    <Card
                        titulo="Empleados con más acciones"
                        className="lg:col-span-4"
                        bodyClassName="flex flex-col justify-center"
                    >
                        <TopEmpleados items={data.top_empleados ?? []} />
                    </Card>
                </div>
            </Seccion>

            {/* Actividad */}
            <Seccion titulo="Actividad">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <Card
                        titulo="Últimas acciones registradas"
                        className="lg:col-span-8"
                        bodyClassName="flex flex-col justify-center"
                    >
                        <TablaAcciones acciones={ultimas} />
                    </Card>

                    <Card
                        titulo="En curso y próximas"
                        className="lg:col-span-4"
                        bodyClassName="flex flex-col justify-center"
                    >
                        <ListaAcciones
                            titulo="Vigentes hoy"
                            acciones={data.vigentes ?? []}
                            vacio="No hay acciones en curso."
                        />
                        <div className="border-t border-slate-100 my-3" />
                        <ListaAcciones
                            titulo="Próximas (30 días)"
                            acciones={data.proximas ?? []}
                            vacio="No hay acciones programadas."
                        />
                    </Card>
                </div>
            </Seccion>
        </div>
    );
}
