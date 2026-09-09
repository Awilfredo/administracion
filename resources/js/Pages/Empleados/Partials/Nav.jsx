import { Link } from "@inertiajs/react";

function Nav({ user }) {
    const currentPath = window.location.pathname;

    return ( 
        <nav>
            <ul className="flex space-x-4">
                <li className={currentPath.startsWith(`/empleados/${user.anacod}`) && !currentPath.includes('datos') ? 'text-blue-500' : 'hover:text-blue-500'}>
                    <Link href={route('empleados.show', { anacod: user.anacod })}>Usuario SAN</Link>
                </li>

                <li className={currentPath.startsWith(`/empleados/${user.anacod}/datos`) ? 'text-blue-500' : 'hover:text-blue-500'}>
                    <Link href={route('datos.index', { anacod: user.anacod })}>Datos personales</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Nav;
