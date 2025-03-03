import BackIcon from "@/Components/Icons/BackIcon";
import { router } from "@inertiajs/react";

function BackEmpleados() {
    const handleBack = (e) => {
        router.visit(route("empleados.index"));
    };

    return (
        <button
            className="mx-5 text-gray-800 hover:text-blue-800"
            onClick={handleBack}
        >
            <BackIcon className="h-6 w-6"></BackIcon> <span>Volver</span>
        </button>
    );
}

export default BackEmpleados;
