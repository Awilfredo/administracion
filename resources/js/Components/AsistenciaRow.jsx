function AsistenciaRow({ element, handleCheck }) {
    const fecha = new Date(element.fecha);
    const fechaLegible = fecha.toLocaleDateString();
    const tiempoLegible = fecha.toLocaleTimeString();

    return (
        <tr className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input type="checkbox" className="w-7 h-7" onChange={(e) => handleCheck(e, element.id)} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {fechaLegible}
            </td>
            <td className="text-sm text-gray-900 text-wrap font-light px-4 py-4 whitespace-nowrap">
                {element.anacod}
            </td>
            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                {element.ananam}
            </td>
            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                {element.evento}
            </td>
            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                {tiempoLegible}
            </td>
            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                {element.accion_personal ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {element.accion_personal}
                    </span>
                ) : (
                    <span className="text-gray-400">—</span>
                )}
            </td>
        </tr>
    );
}

export default AsistenciaRow;
