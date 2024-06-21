import { useState } from "react";
import Search from "./Search";

function TablaGenerica({data, headers, keys}) {
    const [resultados, setResultados] = useState(data);
    const styles = {
        height: "650px",
    };

    const stripedLigth =
        "border border-2 transition duration-300 ease-in-out hover:bg-gray-300";
    const stripedDark =
        "border border-2 transition duration-300 ease-in-out hover:bg-gray-300 bg-blue-1artisan serve00";

    return (
        <div>
            <div className="">
                <Search
                    datos={data}
                    setResultados={setResultados}
                    keys={keys}
                ></Search>
            </div>
            <div className="flex justify-center w-full">
                <div
                    className="overflow-x-auto mx-5 mt-2 rounded-xl w-full"
                    style={styles}
                >
                    <table className="w-full mx-5 bg-white">
                        <thead className="bg-blue-200 w-full">
                            <tr>
                                {headers.map((element, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className="text-sm font-medium text-gray-900 px-2 py-4 text-left"
                                    >
                                        {element}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody
                            className="overflow-y-scroll"
                        >
                            {resultados.map((element, index) => (
                                <tr
                                    key={index}
                                    className={
                                        index % 2 == 0
                                            ? stripedLigth
                                            : stripedDark
                                    }
                                >
                                    {keys.map((llave, index) => (
                                        <td
                                            key={index}
                                            className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                        >
                                            {element[llave]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TablaGenerica;
