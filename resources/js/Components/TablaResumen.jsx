import { router } from "@inertiajs/react";

function TablaResumen({ resumen, tipo, handleClick }) {
    return (
        <div class="sm:mt-5">
        <div class="">
            <div class="overflow-hidden rounded-xl">
                <table class="">
                    <thead class="bg-blue-200 border-b">
                        <tr>
                            <th
                                scope="col"
                                class="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Usuario
                            </th>
                            <th
                                scope="col"
                                class="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Nombre
                            </th>
                            <th
                                scope="col"
                                class="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                {tipo =='Tarde' ? 'Veces tarde' : 'Ausencias'}
                                
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumen.map((element, index) => (
                            <tr key={index} class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100" onClick={()=>handleClick(element.anacod, tipo)}>
                                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {element.anacod}
                                </td>
                                <td class="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                          {element.ananam}
                                </td>
                                <td class="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">

                              {element.veces}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );
}

export default TablaResumen;