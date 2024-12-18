import Search from "@/Components/Search";
import { ExportCSV } from "@/Helpers/ExportCSV";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useCallback, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

function Empleados({ empleados, auth }) {
    const headers = ["Usuario", "Nombre", "Estado", "Correo", "Telefono"];
    const keys = ["anacod", "ananam", "anasta", "anamai", "anatel"];
    const [resultados, setResultados] = useState([]);
    const { downloadCSV, Export } = ExportCSV();

    const columns = [
        {
            name: "Usuario",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "Nombre",
            selector: (row) => row.ananam,
            sortable: true,
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
        () => <Export onExport={handleExport} />,
        [handleExport]
    );
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

            <div className="w-full flex flex-row-reverse px-10 pt-5">
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
            </div>

            <div className="mx-10">
                <Search
                    datos={empleados}
                    setResultados={setResultados}
                    keys={keys}
                ></Search>

                <DataTable
                    striped
                    pointerOnHover
                    columns={columns}
                    data={resultados}
                    selectableRows
                    fixedHeader
                    onRowClicked={handleRowClicked}
                    actions={descargar}
                ></DataTable>
            </div>
        </AuthenticatedLayout>
    );
}

export default Empleados;
