import AsistenciaRow from "./AsistenciaRow";

function Table({ asistencias, handleCheck }) {
    return (
        <div className="">
            <div className="flex justify-center">
                <div className="overflow-x-auto sm:mx-0.5 lg:mx-0.5">
                    <div className="py-2 inline-block sm:px-6 lg:px-4">
                        <div className="overflow-hidden">
                            <table className="max-w-screen">
                                <thead className="bg-gray-200 border-b">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-2 py-4 text-left"
                                        >
                                            Seleccionar
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Fecha
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Usuario
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Evento
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Hora
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Accion de personal
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                                        >
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistencias.map((element, index) => (
                                        <AsistenciaRow
                                            key={index}
                                            element={element}
                                            handleCheck={handleCheck}
                                        ></AsistenciaRow>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Table;
