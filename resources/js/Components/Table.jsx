import { useForm } from "@inertiajs/react";
import { DeleteIcon } from "./DeleteIcon";
import EditIcon from "./EditIcon";
import { SaveIcon } from "./SaveIcon";
import AsistenciaRow from "./AsistenciaRow";

function Table({ asistencias }) {

    return (
        <div className="">
            <div class="flex justify-center">
                <div class="overflow-x-auto sm:mx-0.5 lg:mx-0.5">
                    <div class="py-2 inline-block sm:px-6 lg:px-8">
                        <div class="overflow-hidden">
                            <table class="max-w-screen">
                                <thead class="bg-gray-200 border-b">
                                    <tr>
                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Fecha
                                        </th>
                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Usuario
                                        </th>
                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Evento
                                        </th>
                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Hora
                                        </th>
                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Accion de personal
                                        </th>

                                        <th
                                            scope="col"
                                            class="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Opciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistencias.map((element, index) => (
                                      <AsistenciaRow key={index} element={element}></AsistenciaRow>
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
