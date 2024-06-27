import GenericTable from "@/Components/GenericTable";
import Search from "@/Components/Search";
import TablaGenerica from "@/Components/TablaGenerica";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

function RegistrosNFC({ registros, fecha, auth }) {
    const [registrosNFC, setRegistrosNFC] = useState([]);

    const filters= [
        {id:1, name: "Entrada", key: "evento", value: "ENTRADA", checked:false },
        {id:2,name: "Salida", key: "evento", value: "SALIDA", checked:false },
    ]

    useEffect(() => {
        const datos = [];
        let registro = {};
        registros.map((element) => {
            registro = element;
            const options = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            };

            const fecha_hora = new Date(element.hora);
            registro.hora = fecha_hora.toLocaleString("es-MX", options);
            datos.push(registro);
        });
        setRegistrosNFC(datos);
    }, []);

    const headers = ["hora", "anacod", "uid", "mac", "evento"];
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Registros NFC
                </h2>
            }
        >
            {registrosNFC.length ? (
                <TablaGenerica
                    data={registrosNFC}
                    headers={headers}
                    keys={headers}
                    filters={filters}
                ></TablaGenerica>
            ) : (
                ""
            )}
        </AuthenticatedLayout>
    );
}

export default RegistrosNFC;
