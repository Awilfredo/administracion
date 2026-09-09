import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const STACK_COLORS = {
    tarde: "#dc2626",
    ausente: "#f59e0b",
    salidas: "#2563eb",
    bajas: "#ef4444",
    altas: "#10b981",
};

export default function StackedBarsMini({ data, xKey = "label", series = [], height = 180 }) {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    if (!hydrated) return <div style={{ height }} className="flex items-center justify-center text-gray-400 text-sm">Cargando…</div>;
    if (!data || data.length === 0) return <p className="text-sm text-gray-500 py-4">Sin datos.</p>;

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    {series.map((key) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            stackId="a"
                            fill={STACK_COLORS[key] ?? "#6b7280"}
                            radius={key === series[series.length - 1] ? [2, 2, 0, 0] : undefined}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
