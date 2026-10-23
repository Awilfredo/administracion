import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
const RADIAN = Math.PI / 180;

export default function GraficaCircular({ data, colors, title, height = 220, legendColumns = 1 }) {
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
                <div className="w-full" style={{ height: height, minWidth: 180 }}>
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
                                isAnimationActive={false}
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
                <div
                    className={`w-full flex flex-wrap ${
                        legendColumns > 1 ? "max-w-sm" : "max-w-xs flex-col"
                    }`}
                >
                    {data.map((element, index) => (
                        <div
                            className={`text-sm flex items-center py-0.5 ${
                                legendColumns > 1 ? "w-1/2 pr-3" : "w-full"
                            }`}
                            key={index}
                        >
                            <span
                                className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
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

