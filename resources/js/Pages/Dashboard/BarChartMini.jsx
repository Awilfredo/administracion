import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PALETTE = ["#dc2626", "#f59e0b", "#2563eb", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e", "#a855f7"];

export default function BarChartMini({ data, dataKey = "value", xKey = "label", color = "#2563eb", height = 200, layout = "horizontal" }) {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    if (!hydrated) return <div style={{ height }} className="flex items-center justify-center text-gray-400 text-sm">Cargando…</div>;
    if (!data || data.length === 0) return <p className="text-sm text-gray-500 py-4">Sin datos.</p>;

    const items = data.map((r, i) => ({ ...r, _color: PALETTE[i % PALETTE.length] }));
    const isHoriz = layout === "horizontal";

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={items}
                    layout={isHoriz ? "vertical" : "horizontal"}
                    margin={isHoriz ? { top: 8, right: 16, left: 8, bottom: 8 } : { top: 8, right: 8, left: 8, bottom: 8 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    {isHoriz ? (
                        <>
                            <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
                            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: "#374151" }} width={120} />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#6b7280" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                        </>
                    )}
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px" }}
                    />
                    <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
