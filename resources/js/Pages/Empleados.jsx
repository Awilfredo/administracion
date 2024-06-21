import GenericTable from "@/Components/GenericTable";
import Search from "@/Components/Search";
import TablaGenerica from "@/Components/TablaGenerica";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

function Empleados({ empleados, auth }) {
    const headers = ["Usuario", "Nombre" , "Correo", "Telefono"];
    const keys = ["anacod", "ananam", 'anamai', 'anatel'];
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
            <TablaGenerica data={empleados} headers={headers} keys={keys}></TablaGenerica>
        </AuthenticatedLayout>
    );
}

export default Empleados;
