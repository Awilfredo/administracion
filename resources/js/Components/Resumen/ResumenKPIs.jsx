import {
    HiCheckCircle,
    HiClipboardList,
    HiExclamationCircle,
    HiUserGroup,
} from "react-icons/hi";

function CardKpi({ icon: Icon, label, value, suffix = "", color = "blue", trend = null }) {
    const colorMap = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
        green: { bg: "bg-green-50", text: "text-green-600", gradient: "from-green-500 to-green-600" },
        red: { bg: "bg-red-50", text: "text-red-600", gradient: "from-red-500 to-red-600" },
        amber: { bg: "bg-amber-50", text: "text-amber-600", gradient: "from-amber-500 to-amber-600" },
    };

    const c = colorMap[color];

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 border border-gray-100">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                </div>
                {trend !== null && (
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            trend > 0
                                ? trend > 5
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                        }`}
                    >
                        {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-gray-800">
                    {value}
                    <span className="text-sm font-medium text-gray-500 ml-1">{suffix}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
            <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${c.gradient}`}></div>
        </div>
    );
}

function ResumenKPIs({ kpis, tendencia }) {
    const mesesNombres = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];

    let tendenciaPorcentaje = 0;
    if (tendencia && tendencia.length >= 2) {
        const actual = tendencia[tendencia.length - 1].total;
        const anterior = tendencia[tendencia.length - 2].total;
        if (anterior > 0) {
            tendenciaPorcentaje = Math.round(((actual - anterior) / anterior) * 100);
        }
    }

    const tasaPuntualidad = Math.round(kpis?.tasa_puntualidad ?? 0);
    const totalEventos = kpis?.total_eventos ?? 0;
    const sinIncidencias = kpis?.empleados_sin_incidencias ?? 0;
    const totalEmpleados = kpis?.total_empleados ?? 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardKpi
                icon={HiCheckCircle}
                label="Tasa de puntualidad"
                value={tasaPuntualidad}
                suffix="%"
                color={tasaPuntualidad >= 80 ? "green" : tasaPuntualidad >= 60 ? "amber" : "red"}
            />
            <CardKpi
                icon={HiClipboardList}
                label="Total de eventos"
                value={totalEventos}
                color={totalEventos === 0 ? "green" : "red"}
                trend={tendenciaPorcentaje}
            />
            <CardKpi
                icon={HiExclamationCircle}
                label="Empleados sin incidencias"
                value={`${sinIncidencias} / ${totalEmpleados}`}
                color="green"
            />
            <CardKpi
                icon={HiUserGroup}
                label="Empleados activos"
                value={totalEmpleados}
                color="blue"
            />
        </div>
    );
}

export default ResumenKPIs;
