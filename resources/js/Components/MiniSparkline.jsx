import { useEffect, useId, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

export default function MiniSparkline({ data = [], color = "#2563eb", height = 44 }) {
    const [hydrated, setHydrated] = useState(false);
    const gradientId = `spark-${useId().replace(/:/g, "")}`;

    useEffect(() => setHydrated(true), []);

    if (!hydrated) return <div style={{ height }} />;

    const puntos = (data ?? [])
        .map((valor) => (typeof valor === "number" ? { valor } : { valor: valor?.value ?? 0 }))
        .filter((punto) => punto.valor !== null && punto.valor !== undefined);

    if (puntos.length < 2) return null;

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={puntos} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "11px",
                            padding: "4px 8px",
                        }}
                        labelFormatter={() => ""}
                        formatter={(value) => [value, "acciones"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="valor"
                        stroke={color}
                        strokeWidth={1.75}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
