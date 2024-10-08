import React, { PureComponent } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
const RADIAN = Math.PI / 180;

export default function GraficaCircular({ data, colors, title, width=500 }) {
    /*data = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
      
      ];*/
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF859"];

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
    }) => {
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
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const calculateWidht= ()=>{

    }

    return (
        <div className="mt-5">
            <p className="text-xl text-center mt-5">{title}</p>
            <div className="flex items-center flex-wrap justify-center">
                <PieChart width={(width > 400 ? 400 : width)} height={(width > 400 ? 400 : width)}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={(width > 300 ? 150 :100)}
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
                <div style={{width:300}}>
                    {data.map((element, index) => (
                        <div className="text-md flex py-1" key={index}>
                            <svg
                                style={{ color: COLORS[index] }}
                                className="mx-5"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 432 432"
                            >
                                <path
                                    fill="currentColor"
                                    d="M213.5 3q88.5 0 151 62.5T427 216t-62.5 150.5t-151 62.5t-151-62.5T0 216T62.5 65.5T213.5 3z"
                                />
                            </svg>
                            {`${element.name}: ${element.value}`}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
