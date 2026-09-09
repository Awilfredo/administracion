import { Link, router } from "@inertiajs/react";
import { useMemo, useRef, useState } from "react";

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_NAMES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const IMG_BASE = import.meta.env.VITE_IMG_URL ?? "http://172.17.10.31";
const FOTO_FALLBACK = `${IMG_BASE}/img/user/no_imagen.png`;

function pad(n) {
    return String(n).padStart(2, "0");
}

function buildCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push({ day: null });
    return cells;
}

function shiftMonth(yearMonth, delta) {
    const [y, m] = yearMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function formatFechaCorta(fecha) {
    if (!fecha) return "";
    const [, mm, dd] = fecha.split("-").map(Number);
    return `${dd} ${MONTH_NAMES_SHORT[mm - 1]}`;
}

function BirthdayCell({ it, isToday }) {
    const [hover, setHover] = useState(false);
    const enterTimeout = useRef(null);
    const leaveTimeout = useRef(null);

    const onEnter = () => {
        if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
        enterTimeout.current = setTimeout(() => setHover(true), 80);
    };
    const onLeave = () => {
        if (enterTimeout.current) clearTimeout(enterTimeout.current);
        leaveTimeout.current = setTimeout(() => setHover(false), 100);
    };

    const fotoSrc = it.anaimg ? `${IMG_BASE}/img/user/${it.anaimg}` : FOTO_FALLBACK;

    return (
        <div
            className={
                "relative rounded px-1.5 py-1.5 mb-1 cursor-pointer " +
                (hover
                    ? "bg-pink-100 ring-2 ring-pink-400 z-20"
                    : "bg-pink-50 hover:bg-pink-100")
            }
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onFocus={onEnter}
            onBlur={onLeave}
        >
            <Link
                href={route("empleados.show", { anacod: it.anacod })}
                className="flex items-start gap-2 text-pink-700"
                title={`${it.ananam} (${it.fecha})`}
            >
                <img
                    src={fotoSrc}
                    alt={it.ananam}
                    className="w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = FOTO_FALLBACK; }}
                />
                <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold break-words leading-tight">
                        {it.ananam}
                    </span>
                    <span className="block text-2xs text-pink-500 font-mono">
                        {it.anacod}
                    </span>
                </div>
            </Link>

            {hover && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-lg shadow-2xl ring-1 ring-gray-200 p-3 text-gray-800 pointer-events-none">
                    <p className="text-sm font-semibold mb-2 break-words leading-tight">
                        {it.ananam}
                        <span className="block text-2xs text-gray-500 font-mono mt-0.5">
                            {it.anacod}
                        </span>
                    </p>
                    <div className="space-y-1 text-xs text-gray-700 border-t border-gray-200 pt-2">
                        <p className="flex items-start gap-2">
                            <span className="text-gray-400 min-w-12">Cargo</span>
                            <span className="break-words">{it.anapos ?? "—"}</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-gray-400 min-w-12">Área</span>
                            <span className="break-words">{it.anarea ?? "—"}</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-gray-400 min-w-12">F. nac.</span>
                            <span>{formatFechaCorta(it.fecha)}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CalendarCumple({ data }) {
    const initialMes = data?.mes ?? new Date().toISOString().slice(0, 7);
    const [viewMes, setViewMes] = useState(initialMes);

    const [year, month] = viewMes.split("-").map(Number);
    const cells = useMemo(() => buildCalendar(year, month), [year, month]);

    const byDay = useMemo(() => {
        const map = {};
        (data?.items ?? []).forEach((it) => {
            if (!map[it.dia]) map[it.dia] = [];
            map[it.dia].push(it);
        });
        return map;
    }, [data]);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
    const todayDay = isCurrentMonth ? today.getDate() : null;

    const navigateTo = (nextMes) => {
        setViewMes(nextMes);
        router.reload({
            data: {
                cumple_mes: parseInt(nextMes.split("-")[1], 10),
                cumple_anio: parseInt(nextMes.split("-")[0], 10),
            },
            only: ["data"],
            preserveState: false,
        });
    };

    const goPrev  = () => navigateTo(shiftMonth(viewMes, -1));
    const goNext  = () => navigateTo(shiftMonth(viewMes, 1));
    const goToday = () => {
        const t = new Date();
        const next = `${t.getFullYear()}-${pad(t.getMonth() + 1)}`;
        navigateTo(next);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-5">
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500 flex-shrink-0">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h5v5H7v-5z" />
                </svg>
                <span className="font-medium text-gray-700">Cumpleaños</span>
            </p>
            <header className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={goPrev}
                    className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
                    aria-label="Mes anterior"
                >
                    ←
                </button>
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800">
                        {MONTH_NAMES[month - 1]} {year}
                    </p>
                    <button
                        type="button"
                        onClick={goToday}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                        Hoy
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goNext}
                    className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600"
                    aria-label="Mes siguiente"
                >
                    →
                </button>
            </header>

            <div className="grid grid-cols-7 gap-2 text-center text-xs min-h-[400px]">
                {WEEK_LABELS.map((w) => (
                    <div key={w} className="font-semibold text-gray-500 pb-1 text-sm">
                        {w}
                    </div>
                ))}
                {cells.map((cell, i) => {
                    const items = cell.day ? byDay[cell.day] ?? [] : [];
                    const isToday = cell.day === todayDay;
                    return (
                        <div
                            key={i}
                            className={
                                "min-h-[180px] border rounded p-1.5 text-left align-top " +
                                (cell.day
                                    ? isToday
                                        ? "border-indigo-500 bg-indigo-50"
                                        : "border-gray-200 bg-white"
                                    : "border-transparent bg-transparent")
                            }
                        >
                            {cell.day && (
                                <>
                                    <div
                                        className={
                                            "text-xs mb-1 " +
                                            (isToday
                                                ? "font-bold text-indigo-700"
                                                : "text-gray-500")
                                        }
                                    >
                                        {cell.day}
                                    </div>
                                    <div>
                                        {items.map((it) => (
                                            <BirthdayCell key={it.anacod} it={it} isToday={isToday} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
