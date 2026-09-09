import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { HiChartBar } from "react-icons/hi";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const COLORS = {
    Tarde: "#f59e0b",
    Ausencia: "#ef4444",
    "Sin nfc": "#8b5cf6",
    "Salida antes": "#0ea5e9",
};

function TendenciaChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 h-80 flex flex-col items-center justify-center text-gray-400">
                <HiChartBar className="w-12 h-12 mb-2" />
                <p className="text-sm">Sin datos de tendencia</p>
            </div>
        );
    }

    const chartData = data.map((d) => ({
        mes: `${MESES[parseInt(d.mes) - 1]} ${String(d.anio).slice(-2)}`,
        Tarde: parseInt(d.tardes) || 0,
        Ausencia: parseInt(d.ausencias) || 0,
        "Sin nfc": parseInt(d.sin_nfc) || 0,
        "Salida antes": parseInt(d.salidas_antes) || 0,
    }));

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <HiChartBar className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Tendencia mensual</h3>
                    <p className="text-xs text-gray-500">Últimos {chartData.length} meses</p>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Tarde" stackId="a" fill={COLORS.Tarde} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Ausencia" stackId="a" fill={COLORS.Ausencia} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Sin nfc" stackId="a" fill={COLORS["Sin nfc"]} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Salida antes" stackId="a" fill={COLORS["Salida antes"]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default TendenciaChart;
