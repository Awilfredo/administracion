import ExportButton from "@/Components/ExportButton";
import Search from "@/Components/Search";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { RiUserAddFill } from "react-icons/ri";
import { EmpleadoHelper } from "./Empleado/Helpers/EmpleadoHelper";

function Empleados({ empleados, auth }) {
    const headers = ["Usuario", "Nombre", "Estado", "Correo", "Telefono"];
    const keys = ["anacod", "ananam", "anasta", "anamai", "anatel"];
    const [resultados, setResultados] = useState([]);
    const [usuarios, setUsuarios] = useState({
        activos: true,
        inactivos: false,
        sv: true,
        gt: true,
    });
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState(empleados);
    const [data, setData] = useState([]);


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
            name: "Acciones",
            selector: (row) => (
                <img
                    className="w-22 h-22 rounded-xl py-2"
                    src={
                        row.anaimg
                            ? `http://172.17.10.31/img/user/${
                                  row.anaimg
                              }?${Date.now()}`
                            : "http://172.17.10.31/img/user/no_imagen.png"
                    }
                    alt=""
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



    useEffect(() => {
        if(resultados.length > 0){
        let data = [];
        resultados.map((empleado) => {
            const row = {
                anacod: empleado.anacod,
                ananam: empleado.ananam,
                anapai: empleado.anapai,
                anamai: empleado.anamai,
                anarea: empleado.anarea,
                anajef: empleado.anajef,
                anapos: empleado.anapos,
                anatel: empleado.anatel,
                anasta: empleado.anasta,
                anarea: empleado.anarea,
                fecha_ingreso: empleado.fecha_ingreso,
                afp: empleado?.datos?.afp ? `${empleado?.datos?.afp}` : null,
                asegurado: empleado?.datos?.asegurado ? `${empleado?.datos?.asegurado}` : null,
                cc: empleado?.datos?.cc ? `${empleado?.datos?.cc}` : null,
                cel_personal: empleado?.datos?.cel_personal ? `${empleado?.datos?.cel_personal}` : null,
                comentarios: empleado?.datos?.comentarios ? `${empleado?.datos?.comentarios}` : null,
                created_at: empleado?.created_at ? `${empleado?.created_at}` : null,
                direccion: empleado?.datos?.direccion ? `${empleado?.datos?.direccion}` : null,
                dui: empleado?.datos?.dui ? `${empleado?.datos?.dui}` : null,
                dui_adjunto: empleado?.datos?.dui_adjunto ? `${empleado?.datos?.dui_adjunto}` : null,
                genero: empleado?.datos?.genero ? `${empleado?.datos?.genero}` : null,
                hijos: empleado?.datos?.hijos.length,
                id: empleado.id,
                imei: empleado?.datos?.imei ? `${empleado?.datos?.imei}` : null,
                isss: empleado?.datos?.isss ? `${empleado?.datos?.isss}` : null,
                madre: empleado?.datos?.madre ? `${empleado?.datos?.madre}` : null,
                modelo_red_ptt: empleado?.datos?.modelo_red_ptt ? `${empleado?.datos?.modelo_red_ptt}` : null,
                nit: empleado?.datos?.nit ? `${empleado?.datos?.nit}` : null,
                observacion_equipo: empleado?.datos?.observacion_equipo ? `${empleado?.datos?.observacion_equipo}` : null,
                padre: empleado?.datos?.padre ? `${empleado?.datos?.padre}` : null,
                simcard: empleado?.datos?.simcard ? `${empleado?.datos?.simcard}` : null,
                tarjeta_acceso: empleado?.datos?.tarjeta_acceso ? `${empleado?.datos?.tarjeta_acceso}` : null,
                tel_casa: empleado?.datos?.tel_casa ? `${empleado?.datos?.tel_casa}` : null,
                tipo_afp: empleado?.datos?.tipo_afp ? `${empleado?.datos?.tipo_afp}` : null,
                tipo_sim: empleado?.datos?.tipo_sim ? `${empleado?.datos?.tipo_sim}` : null,
                updated_at: empleado?.updated_at ? `${empleado?.updated_at}` : null,
            };
            data.push(row);
        }); 
        setData(data);
    }
    }, [resultados]);
    

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
                        <div className="py-2 flex justify-between items-center">
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
                            <div className="flex gap-2 items-center flex-wrap">
                                <Link href={route("empleados.create")}>
                                        <RiUserAddFill className="text-4xl text-blue-400 hover:text-blue-500 transition-all duration-200" />
                                </Link>
                                <ExportButton
                                    data={data}
                                    name="Empleados"
                                />
                            </div>
                        </div>
                    }
                    columns={columns}
                    data={resultados}
                    //selectableRows
                    fixedHeader
                    highlightOnHover={true}
                    onRowClicked={handleRowClicked}
                ></DataTable>
            </div>
        </AuthenticatedLayout>
    );
}

export default Empleados;
