import { router } from "@inertiajs/react";

function TablaResumen({ resumen, tipo }) {

    const handleClick = (anacod) => {
        router.visit(route('usuario.resumen', anacod), {
            only: ['users'],
          })
      };

    return (
        <div class="overflow-x-auto sm:mx-0.5 lg:mx-0.5">
        <div class="py-2 inline-block max-w-full sm:px-6 lg:px-8">
            <div class="overflow-hidden">
                <table class="">
                    <thead class="bg-blue-200 border-b">
                        <tr>
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
                                {tipo =='Tarde' ? 'Veces tarde' : 'Ausencias'}
                                
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumen.map((element, index) => (
                            <tr key={index} class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100" onClick={()=>handleClick(element.anacod)}>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {element.anacod}
                                </td>
                                <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                          {element.ananam}
                                </td>
                                <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">

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