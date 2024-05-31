import GenericTable from "@/Components/GenericTable";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
function Horario({ auth, horarios }) {
    console.log(horarios);

    const headers = ['Dia', 'Hora entrada', 'Hora salida receso', 'Hora entrada receso', 'hora salida'];
    const keys = ['numero_dia', 'entrada', 'salida_almuerzo', 'entrada_almuerzo', 'salida'];
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Horarios
                </h2>
            }
        >
            <Head title="Horarios" />

            <div className="flex justify-center w-full">
                <div className="w-full max-w-5xl">
                    {horarios.map((element) => (
                        <GenericTable data={element.dias} nombre={element.nombre} headers={headers} keys={keys}></GenericTable>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Horario;
