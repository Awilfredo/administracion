import CloseButton from "@/Components/CloseButton";
import GraficaCircular from "@/Components/GraficaCircular";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import Search from "@/Components/Search";
import { ExportCSV } from "@/Helpers/ExportCSV";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
function Resumen({ auth, ausencias, llegadas_tarde, eventos }) {
    const [state, setstate] = useState();
    const [showModal, setShowModal] = useState(false);
    const [resumenUsuario, setResumenUsuario] = useState([]);
    const exportar = ExportCSV();
    const [data, setData] = useState([]);
    const [datos , setDatos] = useState([]);
    const [circular, setCircular] = useState([]);
    useEffect(()=>{
        setDatos(eventos);
        setData(eventos);

    }, [])
    useEffect(() => {
        const datosCircular=[{name:'Llegadas tarde',  value:0}, {name:'Ausencias', value:0,}]
        data.map((element)=>{
            datosCircular[1].value+= element.veces_ausente;
            datosCircular[0].value+= element.veces_tarde;
        })

        setCircular(datosCircular);

        console.log(datosCircular)

    }, [data]);

    const closeModal = () => {
        setResumenUsuario([]);
        setShowModal(false);
    };

    const hadleClick = (anacod, evento) => {
        console.log(evento);
        axios
            .get(route("usuario.resumen", [anacod, evento]))
            .then((res) => res.data)
            .then((response) => setResumenUsuario(response));
        setShowModal(true);
    };

    const columns = [
        {
            name: "USUARIO",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "NOMBRE",
            selector: (row) => row.ananam,
            sortable: true,
        },
        {
            name: "VECES TARDE",
            selector: (row) => row.veces_tarde,
            sortable: true,
        },
        {
            name: "VECES AUSENTE",
            selector: (row) => row.veces_ausente,
            sortable: true,
        },
    ];

    const conditionalRowStyles = [
        {
            when: (row) => row.veces_tarde > 2 ||  row.veces_ausente > 2,
            style: {
                backgroundColor: "#d19191",
                color: "white",
                "&:hover": {
                    cursor: "pointer",
                },
            },
        },

        {
            when: (row) => row.veces_tarde > 3 || row.veces_ausente > 3,
            style: {
                backgroundColor: "red",
                color: "white",
                "&:hover": {
                    cursor: "pointer",
                },
            },
        },


    ];



    const filteredItems = eventos.filter(
		item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()),
	);

    const { meses, mesActual, anioActual } = ManejoFechas();
    const [mes, setMes] = useState(mesActual);
    const [anio, setAnio] = useState(anioActual());

    const Export = ({ onExport }) => (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-5 rounded-md text-sm flex h-10 items-center"
            onClick={(e) => onExport(e.target.value)}
        >
            <span className="mr-2">Exportar</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 16 16"
            >
                <path
                    fill="currentColor"
                    d="m9 9.114l1.85-1.943a.52.52 0 0 1 .77 0c.214.228.214.6 0 .829l-1.95 2.05a1.552 1.552 0 0 1-2.31 0L5.41 8a.617.617 0 0 1 0-.829a.52.52 0 0 1 .77 0L8 9.082V.556C8 .249 8.224 0 8.5 0s.5.249.5.556z"
                />
                <path
                    fill="currentColor"
                    d="M16 13.006V10h-1v3.006a.995.995 0 0 1-.994.994H3.01a.995.995 0 0 1-.994-.994V10h-1v3.006c0 1.1.892 1.994 1.994 1.994h10.996c1.1 0 1.994-.893 1.994-1.994"
                />
            </svg>
        </button>
    );
    const actionsMemo = React.useMemo(
        () => (
            <Export
                onExport={() =>
                    exportar.downloadCSV(eventos, [
                        "anacod",
                        "ananam",
                        "veces_tarde",
                        "veces_ausente",
                    ])
                }
            />
        ),
        []
    );

    const handleSubmit = (e) => {
         e.preventDefault();
         fetch(`/asistencia/resumen?anio=${anio}&mes=${mes}`).then(res => res.json()).then((response)=>{
            console.log(response);
            setData(response)
            setDatos(response);
         })
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Resumen por mes
                </h2>
            }
        >
            <div className="">
                <div className="flex justify-around mt-10 flex-wrap">
                    <div className="sm:w-3/4">
                    <form onSubmit={handleSubmit}>
                        <select onChange={(e)=>setAnio(e.target.value)}>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                        </select>
                        <select onChange={(e)=>setMes(e.target.value)} value={mes}>
                            {meses.map((mes, index)=>
                            <option key={index} value={mes.value} selected={mes.value == mesActual() ? true : false}>{mes.name}</option>
                            )}
                        </select>
                         <PrimaryButton>Buscar</PrimaryButton>
                    </form>

                    <Search datos={datos} placeholder="Bucar" keys={['anacod', 'ananam']} setResultados={(e)=>setData(e)}/>
                        <DataTable
                            columns={columns}
                            data={data}
                            fixedHeaderScrollHeight={"500px"}
                            fixedHeader={true}
                            conditionalRowStyles={conditionalRowStyles}
                            actions={actionsMemo}
                        />
                    </div>

                    <GraficaCircular data={circular}></GraficaCircular>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal}>
                {resumenUsuario.length ? (
                    <div>
                        <div className="flex mt-3 mx-5 justify-between">
                            <h2 className="text-xl text-gray-700">
                                {resumenUsuario[0].ananam}
                            </h2>
                            <CloseButton onClick={closeModal}></CloseButton>
                        </div>

                        <div className="my-5 mx-10">
                            {resumenUsuario.map((element, index) => (
                                <div className="grid grid-cols-3 w-full gap-4">
                                    <p className="text-gray-700">
                                        {element.anacod}
                                    </p>
                                    <p>{element.fecha}</p>
                                    <p>{element.evento}</p>
                                    <br></br>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    ""
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

export default Resumen;
