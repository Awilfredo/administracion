import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
function Empleado({auth}) {
    return (
        <AuthenticatedLayout user={auth.user}></AuthenticatedLayout>
    );
}

export default Empleado;