import GenericTable from "@/Components/GenericTable";
import Search from "@/Components/Search";
import TablaGenerica from "@/Components/TablaGenerica";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

function Empleados({ empleados, auth }) {
    const headers = ["Usuario", "Nombre", 'Estado', "Correo", "Telefono"];
    const keys = ["anacod", "ananam", 'anasta', "anamai", "anatel"];

    const filters = [
        {id:1, name: "Usuarios Activoa", key: "anasta", value: "A", checked:true },
        {id:2,name: "Usuarios Inactivos", key: "anasta", value: "I", checked:false },
        {id:3, name:'SV', key:'anapai', value:'SV', checked:true},
        {id:4, name:'GT', key:'anapai', value:'GT', checked:false},
        {id:5, name:'Pais', key:'anapai', value:['SV', 'GT'], checked:false},
    ];
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
            <TablaGenerica
                data={data}
                headers={headers}
                keys={keys}
                filters={filters}
            ></TablaGenerica>
        </AuthenticatedLayout>
    );
}

export default Empleados;
