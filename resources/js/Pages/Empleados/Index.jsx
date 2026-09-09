import ExportButton from "@/Components/ExportButton";
import Checkbox from "@/Components/Checkbox";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { RiUserAddFill } from "react-icons/ri";

const IMG_BASE = import.meta.env.VITE_IMG_URL ?? "http://172.17.10.31";
const FOTO_FALLBACK = `${IMG_BASE}/img/user/no_imagen.png`;
const PER_PAGE = 25;

function Empleados({ empleados, filters, q, auth }) {
    const searchInputRef = useRef(null);
    const [searchValue, setSearchValue] = useState(q ?? "");

    const handleFilterChange = (next) => {
        router.reload({
            data: { ...next, q: searchValue },
            only: ["empleados", "filters", "q"],
            preserveState: true,
        });
    };

    useEffect(() => {
        const t = setTimeout(() => {
            if ((q ?? "") !== searchValue) {
                router.reload({
                    data: {
                        activos: filters?.activos ?? true,
                        inactivos: filters?.inactivos ?? false,
                        sv: filters?.sv ?? true,
                        gt: filters?.gt ?? true,
                        q: searchValue,
                    },
                    only: ["empleados", "q"],
                    preserveState: true,
                });
            }
        }, 300);
        return () => clearTimeout(t);
    }, [searchValue]);

    const columns = [
        {
            name: "Foto",
            selector: (row) =>
                row.anaimg ? (
                    <img
                        className="w-22 h-22 rounded-xl py-2"
                        src={`${IMG_BASE}/img/user/${row.anaimg}`}
                        alt={`Foto de ${row.ananam ?? row.anacod}`}
                        loading="lazy"
                    />
                ) : (
                    <img
                        className="w-22 h-22 rounded-xl py-2"
                        src={FOTO_FALLBACK}
                        alt=""
                        loading="lazy"
                    />
                ),
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Nombre",
            wrap: true,
            selector: (row) => row.ananam,
            sortable: true,
        },
        {
            name: "Estado",
            selector: (row) =>
                row.anasta == "A" ? (
                    <div className="bg-green-500 py-1 px-2 rounded-xl text-white">
                        Activo
                    </div>
                ) : (
                    <div className="bg-red-500 py-1 px-2 rounded-xl text-white">
                        Inactivo
                    </div>
                ),
            sortable: true,
            maxWidth: "100px",
        },
        {
            name: "País",
            selector: (row) => row.anapai,
            sortable: true,
            maxWidth: "0px",
        },
        {
            name: "Correo",
            selector: (row) => row.anamai,
            sortable: true,
        },
        {
            name: "Teléfono",
            selector: (row) => row.anatel,
            sortable: true,
            maxWidth: "120px",
        },
        {
            name: "Horario",
            selector: (row) => row.horario,
            sortable: true,
        },
        {
            name: "Freelance",
            selector: (row) =>
                row.freelance ? (
                    <div className="bg-blue-500 py-1 px-2 rounded-xl text-white text-center">
                        Sí
                    </div>
                ) : (
                    <div className="bg-gray-400 py-1 px-2 rounded-xl text-white text-center">
                        No
                    </div>
                ),
            sortable: true,
            maxWidth: "120px",
        },
    ];

    const handleRowClicked = (row) => {
        router.visit(route("empleados.show", { anacod: row.anacod }));
    };

    const filtrosActivos = filters ?? {
        activos: true,
        inactivos: false,
        sv: true,
        gt: true,
    };

    const totalRows = empleados.total ?? 0;
    const from = empleados.from ?? 0;
    const to = empleados.to ?? 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Empleados
                </h2>
            }
        >
            <Head title="Empleados" />
            <div className="mx-10">
                <DataTable
                    striped
                    pointerOnHover
                    subHeader
                    subHeaderComponent={
                        <div className="w-full flex justify-between gap-10 items-center">
                            <div className="flex items-center">
                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    placeholder="Buscar por usuario, nombre, correo o teléfono"
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                    className="px-4 text-gray-800 rounded focus:outline-none h-10 border border-gray-300"
                                />
                            </div>
                            <p className="text-center text-sm text-gray-600">
                                {totalRows === 0
                                    ? "Sin resultados"
                                    : `Mostrando ${from}–${to} de ${totalRows}`}
                            </p>
                        </div>
                    }
                    noDataComponent={
                        <div className="py-6 text-gray-500">
                            No hay empleados que coincidan con los filtros
                            aplicados.
                        </div>
                    }
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={PER_PAGE}
                    paginationRowsPerPageOptions={[25, 50, 100]}
                    paginationDefaultPage={empleados.current_page ?? 1}
                    onChangePage={(page) =>
                        router.reload({
                            data: { page },
                            only: ["empleados"],
                            preserveState: true,
                        })
                    }
                    onChangeRowsPerPage={(perPage) =>
                        router.reload({
                            data: { per_page: perPage, page: 1 },
                            only: ["empleados"],
                            preserveState: true,
                        })
                    }
                    title={
                        <div className="py-2 flex justify-between items-center">
                            <div className="flex gap-5 flex-wrap">
                                <div>
                                    <label
                                        htmlFor="usuarios_activos"
                                        className="text-sm mr-2"
                                    >
                                        Activos
                                    </label>
                                    <Checkbox
                                        id="usuarios_activos"
                                        checked={!!filtrosActivos.activos}
                                        onChange={() =>
                                            handleFilterChange({
                                                activos: !filtrosActivos.activos,
                                                inactivos: filtrosActivos.inactivos,
                                                sv: filtrosActivos.sv,
                                                gt: filtrosActivos.gt,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="usuarios_inactivos"
                                        className="text-sm mr-2"
                                    >
                                        Inactivos
                                    </label>
                                    <Checkbox
                                        id="usuarios_inactivos"
                                        checked={!!filtrosActivos.inactivos}
                                        onChange={() =>
                                            handleFilterChange({
                                                activos: filtrosActivos.activos,
                                                inactivos: !filtrosActivos.inactivos,
                                                sv: filtrosActivos.sv,
                                                gt: filtrosActivos.gt,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="sv"
                                        className="text-sm mr-2"
                                    >
                                        SV
                                    </label>
                                    <Checkbox
                                        id="sv"
                                        checked={!!filtrosActivos.sv}
                                        onChange={() =>
                                            handleFilterChange({
                                                activos: filtrosActivos.activos,
                                                inactivos: filtrosActivos.inactivos,
                                                sv: !filtrosActivos.sv,
                                                gt: filtrosActivos.gt,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="gt"
                                        className="text-sm mr-2"
                                    >
                                        GT
                                    </label>
                                    <Checkbox
                                        id="gt"
                                        checked={!!filtrosActivos.gt}
                                        onChange={() =>
                                            handleFilterChange({
                                                activos: filtrosActivos.activos,
                                                inactivos: filtrosActivos.inactivos,
                                                sv: filtrosActivos.sv,
                                                gt: !filtrosActivos.gt,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center flex-wrap">
                                <Link
                                    href={route("empleados.create")}
                                    aria-label="Crear empleado"
                                    title="Crear empleado"
                                >
                                    <RiUserAddFill className="text-4xl text-blue-400 hover:text-blue-500 transition-all duration-200" />
                                </Link>
                                <ExportButton
                                    exportUrl={route("empleados.export", {
                                        activos: filtrosActivos.activos ? 1 : 0,
                                        inactivos: filtrosActivos.inactivos ? 1 : 0,
                                        sv: filtrosActivos.sv ? 1 : 0,
                                        gt: filtrosActivos.gt ? 1 : 0,
                                        q: searchValue,
                                    })}
                                    name="Empleados"
                                />
                            </div>
                        </div>
                    }
                    columns={columns}
                    data={empleados.data ?? []}
                    fixedHeader
                    highlightOnHover={true}
                    onRowClicked={handleRowClicked}
                />
            </div>
        </AuthenticatedLayout>
    );
}

export default Empleados;
