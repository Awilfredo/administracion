import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import EditDay from "./Partials/EditDay";
import { useState } from "react";
function Edit({ auth, horario }) {
    const [dias, setdias] = useState([...horario.dias]);
    console.log(dias);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Editar horario: {horario.nombre}
                </h2>
            }
        >
            <Head title="Editar horario" />

            {dias.map((element, index) => (
                <div className="w-full sm:px-2 md:px-10 justify-center">
                    <EditDay dia={element}></EditDay>
                </div>
            ))}
        </AuthenticatedLayout>
    );
}

export default Edit;
