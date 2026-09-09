import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
const RADIAN = Math.PI / 180;

export default function GraficaCircular({ data, colors, title }) {
    const COLORS = colors ?? ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF8042"];

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }) => {
        if (percent < 0.05) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                style={{ fontSize: 12, fontWeight: 600 }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="w-full">
            {title && <p className="text-xl text-center mt-5">{title}</p>}
            <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="w-full" style={{ height: 220, minWidth: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius="75%"
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full max-w-xs space-y-1.5">
                    {data.map((element, index) => (
                        <div className="text-md flex items-center py-1" key={index}>
                            <span
                                className="inline-block w-3 h-3 rounded-full mr-3 flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-700 truncate">
                                {element.name}
                                <span className="ml-2 font-semibold text-gray-900">
                                    {element.value}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

