import { Link } from "@inertiajs/react";

function Nav({ user }) {
    const currentPath = window.location.pathname;
    const showActive = currentPath === `/empleados/${user.anacod}`;
    const datosActive = currentPath.startsWith(`/empleados/${user.anacod}/datos`);
    const accionesActive = currentPath.startsWith(`/empleados/${user.anacod}/acciones`);
    const presupActive = currentPath.startsWith(`/empleados/${user.anacod}/presupuesto`);

    return (
        <nav>
            <ul className="flex space-x-4">
                <li className={showActive ? 'text-blue-500' : 'hover:text-blue-500'}>
                    <Link href={route('empleados.show', { anacod: user.anacod })}>Usuario SAN</Link>
                </li>

                <li className={datosActive ? 'text-blue-500' : 'hover:text-blue-500'}>
                    <Link href={route('datos.index', { anacod: user.anacod })}>Datos personales</Link>
                </li>

                <li className={accionesActive ? 'text-blue-500' : 'hover:text-blue-500'}>
                    <Link href={route('empleados.acciones.index', { anacod: user.anacod })}>Acciones</Link>
                </li>

                <li className={presupActive ? 'text-blue-500' : 'hover:text-blue-500'}>
                    <Link href={route('empleados.presupuesto', { anacod: user.anacod })}>Presupuestos</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;
