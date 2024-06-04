import { useState } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const navDefaultClass =
        "px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group";
    const navSelectedClass =
        "relative px-4 py-3 flex items-center space-x-4 rounded-xl text-white bg-gradient-to-r from-sky-600 to-cyan-400";

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-gray-100">
                <aside className="ml-[-100%] fixed z-10 top-0 pb-3 px-6 w-full flex flex-col justify-between h-screen border-r bg-white transition duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[16%] overflow-y-auto">
                    <div>
                        <div className="mt-5 text-center">
                            <img
                                src="https://ii.ct-stc.com/10/logos/empresas/2017/08/23/intelfon-sa-de-cv-E8B6A47509B6B51B161351thumbnail.jpeg"
                                alt=""
                                className="w-10 h-10 m-auto rounded-full object-cover lg:w-28 lg:h-28"
                            />
                            <h5 className="hidden mt-4 text-xl font-semibold text-gray-600 lg:block">
                                <Link
                                    href={route("profile.edit")}
                                    className="underline"
                                >
                                    {user.name}
                                </Link>
                            </h5>
                        </div>

                        <ul className="space-y-2 tracking-wide mt-8">
                            <li>
                                <Link
                                    href={route("dashboard")}
                                    aria-label="dashboard"
                                    className={
                                        route().current("dashboard")
                                            ? "relative px-4 py-3 flex items-center space-x-4 rounded-xl text-white bg-gradient-to-r from-sky-600 to-cyan-400"
                                            : "px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
                                    }
                                >
                                    <svg
                                        className="-ml-1 h-6 w-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                                            className="fill-current text-cyan-400 dark:fill-slate-600"
                                        ></path>
                                        <path
                                            d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                                            className="fill-current text-cyan-200 group-hover:text-cyan-300"
                                        ></path>
                                        <path
                                            d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                                            className="fill-current group-hover:text-sky-300"
                                        ></path>
                                    </svg>
                                    <span className="-mr-1 font-medium">
                                        Dashboard
                                    </span>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    className={
                                        route().current("fence.show")
                                            ? navSelectedClass
                                            : navDefaultClass
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            className="fill-current text-gray-300 group-hover:text-cyan-300"
                                            fillRule="evenodd"
                                            d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            className="fill-current text-gray-600 group-hover:text-cyan-600"
                                            d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                                        />
                                    </svg>
                                    <span className="group-hover:text-gray-700">
                                        Asistencia
                                    </span>
                                </Link>
                            </li>

                            <li>
                                <ul className="mx-1 pl-2 border-l-2 border-gray-500">
                                    <li>
                                        <Link
                                            href={route("asistencia.marcas")}
                                            className={
                                                route().current("grid")
                                                    ? navSelectedClass
                                                    : navDefaultClass
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M14.5 18q-1.05 0-1.775-.725T12 15.5q0-1.05.725-1.775T14.5 13q1.05 0 1.775.725T17 15.5q0 1.05-.725 1.775T14.5 18ZM5 22q-.825 0-1.413-.588T3 20V6q0-.825.588-1.413T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.588 1.413T19 22H5Zm0-2h14V10H5v10Z"
                                                />
                                            </svg>
                                            <span className="group-hover:text-gray-700">
                                                Marcaciones
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route("asistencia.nfc")}
                                            className={
                                                route().current(
                                                    "asistencia.nfc"
                                                )
                                                    ? navSelectedClass
                                                    : navDefaultClass
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 26 26"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M13 0a11.503 11.503 0 0 0-8.125 3.344A1.005 1.005 0 1 0 6.313 4.75A9.41 9.41 0 0 1 13 2c2.618 0 4.97 1.04 6.688 2.75a1.005 1.005 0 1 0 1.437-1.406A11.51 11.51 0 0 0 13 0zm0 4a6.472 6.472 0 0 0-4.813 2.125a1 1 0 1 0 1.47 1.344A4.482 4.482 0 0 1 13 6c1.327 0 2.518.558 3.344 1.469a1 1 0 1 0 1.468-1.344A6.478 6.478 0 0 0 13 4zM5 7v16a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7l-2 2v11.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V9L5 7zm8 1c-1.108 0-2 .893-2 2s.892 2 2 2a2 2 0 1 0 0-4zm.5 14.219c.706 0 1.281.575 1.281 1.281s-.575 1.281-1.281 1.281a1.283 1.283 0 0 1-1.281-1.281c0-.706.575-1.281 1.281-1.281z"
                                                />
                                            </svg>{" "}
                                            <span className="group-hover:text-gray-700">
                                                Registros NFC
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route("resumen")}
                                            className={
                                                route().current("resumen")
                                                    ? navSelectedClass
                                                    : navDefaultClass
                                            }
                                        >
                                            <svg
                                            className="group-hover:text-cyan-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 100 100"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M27.953 46.506a21.02 21.02 0 0 1-2.117-9.192c0-1.743.252-3.534.768-5.468c.231-.87.521-1.702.847-2.509c-1.251-.683-2.626-1.103-4.101-1.103c-5.47 0-9.898 5.153-9.898 11.517c0 4.452 2.176 8.305 5.354 10.222L5.391 56.217c-.836.393-1.387 1.337-1.387 2.392v10.588c0 1.419.991 2.569 2.21 2.569h7.929v-11.11c0-3.237 1.802-6.172 4.599-7.481l10.262-4.779a20.2 20.2 0 0 1-1.051-1.89zm32.184-11.705h34.092V34.8l.006.001c.973 0 1.761-.789 1.761-1.761v-6.431c0-.973-.789-1.761-1.761-1.761l-.006.001v-.005H56.133a20.013 20.013 0 0 1 3.526 7.435c.215.889.371 1.72.478 2.522zm35.859 31.635c0-.973-.789-1.761-1.761-1.761l-.006.001v-.005H72.007v9.089c0 .293-.016.582-.045.867h22.267v-.001l.006.001c.973 0 1.761-.789 1.761-1.761v-6.43zm-1.761-21.674l-.006.001v-.005H58.944c-.159.419-.327.836-.514 1.249a20.258 20.258 0 0 1-1.224 2.297l10.288 4.908a7.67 7.67 0 0 1 2.078 1.503h24.657v-.001l.006.001c.973 0 1.761-.789 1.761-1.761v-6.431c0-.973-.789-1.761-1.761-1.761z"
                                                />
                                                <path
                                                    fill="currentColor"
                                                    d="m65.323 57.702l-11.551-5.51l-4.885-2.33c2.134-1.344 3.866-3.418 5-5.917a16.045 16.045 0 0 0 1.435-6.631c0-1.348-.213-2.627-.512-3.863c-1.453-5.983-6.126-10.392-11.736-10.392c-5.504 0-10.106 4.251-11.648 10.065c-.356 1.333-.602 2.72-.602 4.189c0 2.552.596 4.93 1.609 7c1.171 2.4 2.906 4.379 5.018 5.651l-4.678 2.178l-11.926 5.554c-1.037.485-1.717 1.654-1.717 2.959V73.76c0 1.756 1.224 3.181 2.735 3.181h42.417c1.511 0 2.735-1.424 2.735-3.181V60.656c.002-1.301-.668-2.458-1.694-2.954z"
                                                />
                                            </svg>
                                            <span className="group-hover:text-gray-700">
                                                Resumen
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route("horario.index")}
                                            className={
                                                route().current("horario.index")
                                                    ? navSelectedClass
                                                    : navDefaultClass
                                            }
                                        >
                                            <svg
                                                className="group-hover:text-cyan-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"
                                                />
                                            </svg>
                                            <span className="group-hover:text-gray-700">
                                                Horarios
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    className="fill-current text-gray-600 group-hover:text-cyan-600"
                                                    d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                                                />
                                                <path
                                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                                    d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                                                />
                                            </svg>
                                            <span className="group-hover:text-gray-700">
                                                Estadisticas
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    className="fill-current text-gray-600 group-hover:text-cyan-600"
                                                    fillRule="evenodd"
                                                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                                                    clipRule="evenodd"
                                                />
                                                <path
                                                    className="fill-current text-gray-300 group-hover:text-cyan-300"
                                                    d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"
                                                />
                                            </svg>
                                            <span className="group-hover:text-gray-700">
                                                Reportes
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li>
                                <Link
                                    className={
                                        route().current("fence.users")
                                            ? navSelectedClass
                                            : navDefaultClass
                                    }
                                >
                                    <svg
                                        className="group-hover:text-cyan-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 640 512"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6c40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32S208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"
                                        />
                                    </svg>
                                    <span className="group-hover:text-gray-700">
                                        Empleados
                                    </span>
                                </Link>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            className="fill-current text-gray-300 group-hover:text-cyan-300"
                                            d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
                                        />
                                        <path
                                            className="fill-current text-gray-600 group-hover:text-cyan-600"
                                            fillRule="evenodd"
                                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="group-hover:text-gray-700">
                                        Finance
                                    </span>
                                </a>
                            </li>
                            <li>
                                <Link
                                    href={route("profile.edit")}
                                    className={
                                        (route().current("profile.edit")
                                            ? navSelectedClass
                                            : navDefaultClass) + " mt-5"
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="25"
                                        height="25"
                                        viewBox="0 0 24 24"
                                        className="group-hover:text-cyan-600"
                                    >
                                        <g fill="none">
                                            <path
                                                fill="currentColor"
                                                d="M15 15H9a4.002 4.002 0 0 0-3.834 2.856A8.98 8.98 0 0 0 12 21a8.98 8.98 0 0 0 6.834-3.144A4.002 4.002 0 0 0 15 15Z"
                                                opacity=".16"
                                            />
                                            <path
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                d="M21 12a8.958 8.958 0 0 1-1.526 5.016A8.991 8.991 0 0 1 12 21a8.991 8.991 0 0 1-7.474-3.984A9 9 0 1 1 21 12Z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M13 9a1 1 0 0 1-1 1v2a3 3 0 0 0 3-3h-2Zm-1 1a1 1 0 0 1-1-1H9a3 3 0 0 0 3 3v-2Zm-1-1a1 1 0 0 1 1-1V6a3 3 0 0 0-3 3h2Zm1-1a1 1 0 0 1 1 1h2a3 3 0 0 0-3-3v2Zm-6.834 9.856l-.959-.285l-.155.523l.355.413l.759-.65Zm13.668 0l.76.651l.354-.413l-.155-.523l-.959.285ZM9 16h6v-2H9v2Zm0-2a5.002 5.002 0 0 0-4.793 3.571l1.917.57A3.002 3.002 0 0 1 9 16v-2Zm3 6a7.98 7.98 0 0 1-6.075-2.795l-1.518 1.302A9.98 9.98 0 0 0 12 22v-2Zm3-4c1.357 0 2.506.902 2.876 2.142l1.916-.571A5.002 5.002 0 0 0 15 14v2Zm3.075 1.205A7.98 7.98 0 0 1 12 20v2a9.98 9.98 0 0 0 7.593-3.493l-1.518-1.302Z"
                                            />
                                        </g>
                                    </svg>
                                    <span className="group-hover:text-gray-700">
                                        Perfil
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="px-6 -mx-6 pt-4 flex justify-between items-center border-t">
                        <button className="px-4 py- flex items-center space-x-4 rounded-md text-gray-600 group">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span>
                                <Dropdown.Link
                                    className="group-hover:text-gray-700"
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </span>
                        </button>
                    </div>
                </aside>

                <div className="ml-auto mb-6 lg:w-[75%] xl:w-[80%] 2xl:w-[85%]">
                    <div className="sticky z-10 top-0 h-16 border-b bg-white lg:py-2.5">
                        <div className="px-6 flex items-center justify-between space-x-4 2xl:container">
                            {header}
                            <button className="w-12 h-16 -mr-2 border-r lg:hidden">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 my-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <main>{children}</main>
                </div>
            </div>
        </div>
    );
}
