import GenericTable from "@/Components/GenericTable";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

function RegistrosNFC({ registros, fecha, auth }) {
    const [registrosNFC, setRegistrosNFC] = useState([]);
    const stripedLigth ="border border-2 transition duration-300 ease-in-out hover:bg-gray-300 ";
    const stripedDark = "border border-2 transition duration-300 ease-in-out hover:bg-gray-300 bg-blue-100"
    useEffect(() => {
        const datos=[];
        let registro= {};
        registros.map((element)=>{
            registro = element;
            const fecha_hora = new Date(element.hora);
            registro.hora = fecha_hora.toLocaleTimeString();
            datos.push(registro);
        })
        setRegistrosNFC(datos)
    }, []);
    const headers = ["hora", "anacod", "uid", "mac", "evento"];
    console.log(registros);
    const styles = {
        height: "650px",
    };
    return (
        <AuthenticatedLayout user={auth.user}>
            <div className="flex justify-center w-full">
                <div
                    className="overflow-x-auto mx-5 mt-5 rounded-xl"
                    style={styles}
                >
                    <table className="max-w-100 mx-5">
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
                            className="overflow-y-scroll w-full"
                            style={{ height: "60vh" }}
                        >
                            {registrosNFC.map((element, index) => (
                                <tr
                                    key={index}
                                    className={index%2 ==0 ? stripedLigth : stripedDark}
                                >
                                    {headers.map((llave, index) => (
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
        </AuthenticatedLayout>
    );
}

export default RegistrosNFC;
