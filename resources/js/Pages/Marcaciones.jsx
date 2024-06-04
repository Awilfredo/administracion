import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
function Marcaciones({ registros, auth, fecha }) {
    const [marcas_completas, setMarcas_completas] = useState([]);

    useEffect(() => {
        const datos_marcas = [];
        const llegadas_tarde = [];
        const ausencias = [];

        console.log(fecha);

        registros.map((element) => {
            let marcas = [];

            let fechaHora = new Date(fecha); // Supongamos que tienes esta fecha
            let year = fechaHora.getFullYear();
            let month = (fechaHora.getMonth() + 1).toString().padStart(2, "0"); // Sumamos 1 porque los meses se indexan desde 0
            let day = fechaHora.getDate().toString().padStart(2, "0");
            let partesHora = element.entrada.split(":");
            let partesSalida = element.salida.split(":");
            let entrada_datetime = new Date(
                year,
                month - 1,
                day,
                partesHora[0],
                partesHora[1],
                partesHora[2] || 0
            );
            let salida_datetime = new Date(
                year,
                month - 1,
                day,
                partesSalida[0],
                partesSalida[1],
                partesSalida[2] || 0
            );

            console.log(entrada_datetime);

            let registro = {
                anacod: element.anacod,
                ananam: element.ananam,
                horario: element.horario,
                entrada: element.entrada,
                salida: element.salida,
                marca_entrada: "Sin marca",
                nfc_entrada: "Sin marca",
                marca_receso_salida: "Sin marca",
                marca_receso_entrada: "Sin marca",
                marca_salida: "Sin marca",
                nfc_salida: "Sin marca",
                evento_entrada: "",
                evento_salida: "",
                salio: "",
            };

            element.marca_1 != null && marcas.push(element.marca_1);
            element.marca_2 != null && marcas.push(element.marca_2);
            element.marca_3 != null && marcas.push(element.marca_3);
            element.marca_4 != null && marcas.push(element.marca_4);
            element.marca_5 != null && marcas.push(element.marca_5);
            element.marca_6 != null && marcas.push(element.marca_6);
            element.marca_7 != null && marcas.push(element.marca_7);

            for (let i = 0; i < marcas.length; i++) {
                console.log(element.entrada);
                if (
                    new Date(marcas[i]) <=
                    entrada_datetime.setMinutes(
                        entrada_datetime.getMinutes() + 5
                    )
                ) {
                    registro.marca_entrada = marcas[i];
                    registro.evento_entrada = "A tiempo";
                }

                if (
                    new Date(marcas[i]) >
                        entrada_datetime.setMinutes(
                            entrada_datetime.getMinutes() + 5
                        ) &&
                    new Date(marcas[i]) <
                        entrada_datetime.setHours(
                            entrada_datetime.getHours() + 1
                        )
                ) {
                    registro.marca_entrada = marcas[i];
                    registro.evento_entrada = "Llegó tarde";
                }
            }

            if (
                new Date(marcas[marcas.length - 1]) < salida_datetime &&
                new Date(marcas[marcas.length - 1]) >
                    salida_datetime.setHours(salida_datetime.getHours() - 1)
            ) {
                registro.marca_salida = marcas[marcas.length - 1];
                registro.evento_salida = "Salió antes";
            }

            if (new Date(marcas[marcas.length - 1]) >= salida_datetime){
                registro.marca_salida = marcas[marcas.length - 1];
                registro.evento_salida = "Sin Evento";
            }

            datos_marcas.push(registro);
            console.log(registro);
        });

        setMarcas_completas(datos_marcas);
    }, []);

    const styles = {
        height: "650px",
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Marcaciones
                </h2>
            }
        >
            <Head title="Marcaciones" />

            <div className="overflow-x-auto mx-5 mt-5 rounded-xl" style={styles}>
                <table className="max-w-100 mx-5">
                    <thead className="bg-blue-200 w-full">
                        <tr>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-2 py-4 text-left"
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
                                Horario
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Entrada
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Salida
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Marca entrada
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                NFC entrada
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Salida Receso
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Entrada Receso
                            </th>

                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Marca salida
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Evento Entrada
                            </th>
                            <th
                                scope="col"
                                className="text-sm font-medium text-gray-900 px-4 py-4 text-left"
                            >
                                Evento Salida
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        className="overflow-y-scroll w-full"
                        style={{ height: "60vh" }}
                    >
                        {marcas_completas.map((element, index) => (
                            <tr
                                key={index}
                                className="bg-white border border-2 transition duration-300 ease-in-out hover:bg-gray-300"
                            >
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {element.anacod}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {element.ananam}
                                </td>
                                <td className="text-sm text-gray-900 text-wrap font-light px-4 py-4 whitespace-nowrap">
                                    {element.horario}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                    {element.entrada}
                                </td>

                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                    {element.salida}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                    {element.marca_entrada}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                    null
                                </td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap w-60"></td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap w-60"></td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                    {element.marca_salida}
                                </td>

                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap w-60">
                                    {element.evento_entrada}
                                </td>
                                <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap w-60">
                                    {element.evento_salida}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}

export default Marcaciones;
