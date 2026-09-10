import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

function TopList({ items, tipo = "impuntuales", onItemClick = null }) {
    const isImpuntuales = tipo === "impuntuales";

    const colors = isImpuntuales
        ? {
            bg: "bg-red-50",
            border: "border-red-200",
            icon: HiExclamationCircle,
            iconColor: "text-red-500",
            badgeBg: "bg-red-100",
            badgeText: "text-red-700",
            gradient: "from-red-500 to-red-600",
            title: "Top impuntuales",
            subtitle: "Empleados con más eventos sin justificar este mes",
            badgeSolid: "bg-red-100 text-red-700",
        }
        : {
            bg: "bg-green-50",
            border: "border-green-200",
            icon: HiCheckCircle,
            iconColor: "text-green-500",
            badgeBg: "bg-green-100",
            badgeText: "text-green-700",
            gradient: "from-green-500 to-green-600",
            title: "Top puntuales",
            subtitle: "Empleados con menos eventos sin justificar este mes",
            badgeSolid: "bg-green-100 text-green-700",
        };

    const Icon = colors.icon;

    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">{colors.title}</h3>
                        <p className="text-xs text-gray-500">{colors.subtitle}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400 text-center py-8">
                    {isImpuntuales
                        ? "No hay empleados con incidencias en este mes"
                        : "No hay empleados sin incidencias este mes"}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-800">{colors.title}</h3>
                    <p className="text-xs text-gray-500">{colors.subtitle}</p>
                </div>
            </div>

            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li
                        key={item.anacod ?? index}
                        onClick={() => onItemClick && onItemClick(item)}
                        className={`flex items-center gap-3 p-3 rounded-xl ${colors.bg} border ${colors.border} ${
                            onItemClick ? "cursor-pointer hover:shadow-sm transition-all" : ""
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                        >
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{item.ananam}</p>
                            <p className="text-xs text-gray-500 truncate">
                                {item.anacod} {item.anajef ? `· ${item.anajef}` : ""}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {item.tardes > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                        {item.tardes} tarde{item.tardes > 1 ? "s" : ""}
                                    </span>
                                )}
                                {item.salidas_antes > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                        {item.salidas_antes} salida{item.salidas_antes > 1 ? "s" : ""}
                                    </span>
                                )}
                                {item.ausencias > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                                        {item.ausencias} ausencia{item.ausencias > 1 ? "s" : ""}
                                    </span>
                                )}
                                {item.sin_nfc > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                                        {item.sin_nfc} sin NFC
                                    </span>
                                )}
                                {item.tardes === 0 && item.salidas_antes === 0 && item.ausencias === 0 && (
                                    <span className="text-[10px] text-green-700 font-semibold">
                                        Sin incidencias
                                    </span>
                                )}
                            </div>
                        </div>
                        <span
                            className={`${colors.badgeSolid} px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0`}
                        >
                            {item.tasa ?? 0}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TopList;
