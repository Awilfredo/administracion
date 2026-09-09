import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const COLORS = {
    tarde: "#dc2626",
    ausente: "#f59e0b",
    salidas: "#2563eb",
};

const LABELS = {
    tarde: "Llegadas tarde",
    ausente: "Ausencias",
    salidas: "Salidas antes",
};

export default function Sparkline({ data }) {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!data || !data.labels || data.labels.length === 0) {
        return (
            <p className="text-sm text-gray-500 py-6 text-center">
                Sin datos suficientes para la tendencia.
            </p>
        );
    }

    const chartData = data.labels.map((label, idx) => ({
        mes: label,
        tarde: data.tarde?.[idx] ?? 0,
        ausente: data.ausente?.[idx] ?? 0,
        salidas: data.salidas?.[idx] ?? 0,
    }));

    if (!hydrated) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Cargando tendencia...
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="mes"
                        tickFormatter={(v) => {
                            const [, m] = v.split("-");
                            const monthNames = [
                                "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                            ];
                            return monthNames[parseInt(m, 10) - 1] ?? v;
                        }}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip
                        labelFormatter={(v) => {
                            const [y, m] = v.split("-");
                            const monthNames = [
                                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
                            ];
                            return `${monthNames[parseInt(m, 10) - 1] ?? v} ${y}`;
                        }}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            fontSize: "12px",
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    {Object.keys(COLORS).map((key) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={LABELS[key]}
                            stroke={COLORS[key]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
