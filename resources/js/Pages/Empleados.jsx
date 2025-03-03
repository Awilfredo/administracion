import Search from "@/Components/Search";
import TextInput from "@/Components/TextInput";
import { ExportCSV } from "@/Helpers/ExportCSV";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

function Empleados({ empleados, auth }) {
    const headers = ["Usuario", "Nombre", "Estado", "Correo", "Telefono"];
    const keys = ["anacod", "ananam", "anasta", "anamai", "anatel"];
    const [resultados, setResultados] = useState([]);
    const { downloadCSV, Export } = ExportCSV();
    const [usuarios, setUsuarios] = useState({
        activos: true,
        inactivos: false,
        sv: true,
        gt: true,
    });
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState(empleados);

    useEffect(() => {
        const empleadosFiltrados = empleados.filter(
            (empleado) => empleado.anasta === "A"
        );
        setEmpleadosFiltrados(empleadosFiltrados);
        setResultados(empleadosFiltrados);
    }, []);

    const handleFilter = (e) => {
        setUsuarios(e);
        const empleadosFiltrados = empleados.filter(
            (empleado) =>
                ((e.activos && empleado.anasta === "A") ||
                    (e.inactivos && empleado.anasta === "I")) &&
                ((e.sv && empleado.anapai == "SV") ||
                    (e.gt && empleado.anapai == "GT"))
        );
        setEmpleadosFiltrados(empleadosFiltrados);
    };

    const columns = [
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
            maxWidth: "150px",
        },
        {
            name: "Nombre",
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
            name: "Pais",
            selector: (row) => row.anapai,
            sortable: true,
            maxWidth: "0px",
        },
        {
            name: "Email",
            selector: (row) => row.anamai,
            sortable: true,
        },
        {
            name: "Telefono",
            selector: (row) => row.anatel,
            sortable: true,
            maxWidth: "100px",
        },
        {
            name: "Horario",
            selector: (row) => row.horario,
            sortable: true,
        },
    ];

    const handleRowClicked = (row) => {
        console.log(`${row.anacod} was clicked!`);
        router.visit(route("empleados.show", { anacod: row.anacod }));
    };

    const handleExport = useCallback(() => {
        downloadCSV(
            resultados,
            ["anacod", "ananam", "anaext", "anatel", "horario"],
            `Empleados`
        );
    }, [resultados]);

    // Memoriza el componente Export para que solo se actualice cuando handleExport cambie
    const descargar = useMemo(
        () => (
            <Export onExport={handleExport}>
                <a
                    className="text-blue-400 hover:text-blue-700"
                    href={route("empleados.create")}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 26 26"
                    >
                        <path
                            fill="currentColor"
                            d="M10.5.156c-3.017 0-5.438 2.072-5.438 6.032c0 2.586 1.03 5.22 2.594 6.843c.61 1.623-.49 2.227-.718 2.313C3.781 16.502.093 18.602.093 20.688v.78c0 2.843 5.414 3.5 10.437 3.5a45.48 45.48 0 0 0 3.281-.124a7.75 7.75 0 0 1-2.124-5.344c0-1.791.61-3.432 1.624-4.75c-.15-.352-.21-.907.063-1.75c1.555-1.625 2.563-4.236 2.563-6.813c0-3.959-2.424-6.03-5.438-6.03zm9 13.031a6.312 6.312 0 1 0 0 12.625a6.312 6.312 0 0 0 0-12.625zM18.625 16h1.75v2.594h2.594v1.812h-2.594V23h-1.75v-2.594H16v-1.812h2.625V16z"
                        />
                    </svg>
                </a>
            </Export>
        ),
        [handleExport]
    );

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
                            <Search
                                datos={empleadosFiltrados}
                                setResultados={setResultados}
                                keys={keys}
                            ></Search>
                            <p className="text-center">
                                {resultados.length} resultados
                            </p>
                        </div>
                    }
                    filter={true}
                    title={
                        <div className="py-2">
                            <div className="flex gap-5 flex-wrap">
                                <div>
                                    <label
                                        htmlFor="usuarios_activos"
                                        className="text-sm mr-2"
                                    >
                                        Activos
                                    </label>
                                    <TextInput
                                        type="checkbox"
                                        id="usuarios_activos"
                                        checked={usuarios.activos}
                                        onChange={(e) =>
                                            handleFilter({
                                                ...usuarios,
                                                activos: !usuarios.activos,
                                            })
                                        }
                                    ></TextInput>
                                </div>
                                <div>
                                    <label
                                        htmlFor="usuarios_inactivos"
                                        className="text-sm mr-2"
                                    >
                                        Inactivos
                                    </label>
                                    <TextInput
                                        type="checkbox"
                                        id="usuarios_inactivos"
                                        checked={usuarios.inactivos}
                                        onChange={(e) =>
                                            handleFilter({
                                                ...usuarios,
                                                inactivos: !usuarios.inactivos,
                                            })
                                        }
                                    ></TextInput>
                                </div>
                                <div>
                                    <label
                                        htmlFor="sv"
                                        className="text-sm mr-2"
                                    >
                                        SV
                                    </label>
                                    <TextInput
                                        type="checkbox"
                                        id="sv"
                                        checked={usuarios.sv}
                                        onChange={(e) =>
                                            handleFilter({
                                                ...usuarios,
                                                sv: !usuarios.sv,
                                            })
                                        }
                                    ></TextInput>
                                </div>
                                <div>
                                    <label
                                        htmlFor="gt"
                                        className="text-sm mr-2"
                                    >
                                        GT
                                    </label>
                                    <TextInput
                                        type="checkbox"
                                        id="gt"
                                        checked={usuarios.gt}
                                        onChange={(e) =>
                                            handleFilter({
                                                ...usuarios,
                                                gt: !usuarios.gt,
                                            })
                                        }
                                    ></TextInput>
                                </div>
                            </div>
                        </div>
                    }
                    columns={columns}
                    data={resultados}
                    //selectableRows
                    fixedHeader
                    highlightOnHover={true}
                    onRowClicked={handleRowClicked}
                    actions={descargar}
                ></DataTable>
            </div>
        </AuthenticatedLayout>
    );
}

export default Empleados;
