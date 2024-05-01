import Table from "@/Components/Table";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Dashboard({ auth, asistencias, date = null }) {

    const [anterior, setAnterior] = useState('');
    const [fecha, setFecha] = useState(date);
    const [siguiente, setSiguiente] = useState('');

    useEffect(() => {
        if (!date) {
            const fechaActual = new Date();
            let anio = fechaActual.getFullYear();
            let mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
            let dia = String(fechaActual.getDate()).padStart(2, "0");
            let day = `${anio}-${mes}-${dia}`;
            setFecha(day);

            const fechaAnterior=new Date();
            fechaAnterior.setDate(fechaAnterior.getDate()-1);
            anio = fechaAnterior.getFullYear();
            mes = String(fechaAnterior.getMonth() + 1).padStart(2, "0");
            dia = String(fechaAnterior.getDate()).padStart(2, "0");
            const prev= `${anio}-${mes}-${dia}`;
            setAnterior(prev);

            const fechaSiguiente=new Date();
            fechaSiguiente.setDate(fechaAnterior.getDate()+1);
            anio = fechaSiguiente.getFullYear();
            mes = String(fechaSiguiente.getMonth() + 1).padStart(2, "0");
            dia = String(fechaSiguiente.getDate()).padStart(2, "0");
            const sig= `${anio}-${mes}-${dia}`;
            setSiguiente(sig);
        }
    }, []);

    useEffect(() => {
        console.log(date)
        if (date) {
            let fecha = date.split('-').reverse().join('-');
            console.log(fecha)
            const fechaAnterior=new Date(fecha);
            fechaAnterior.setDate(fechaAnterior.getDate()-1);
            let anio = fechaAnterior.getFullYear();
            let mes = String(fechaAnterior.getMonth() + 1).padStart(2, "0");
            let dia = String(fechaAnterior.getDate()).padStart(2, "0");
            const prev= `${anio}-${mes}-${dia}`;
            setAnterior(prev);

            const fechaSiguiente=new Date(fecha);
            fechaSiguiente.setDate(fechaAnterior.getDate()+1);
            anio = fechaSiguiente.getFullYear();
            mes = String(fechaSiguiente.getMonth() + 1).padStart(2, "0");
            dia = String(fechaSiguiente.getDate()).padStart(2, "0");
            const sig= `${anio}-${mes}-${dia}`;
            setSiguiente(sig);
        }
    }, []);



    

    const handleChange = (e) => {
        setFecha(e.target.value);
    };

    const handleAnterior = (e) => {
        alert(anterior);
    };

    
    const handleSiguiente = (e) => {
        alert(siguiente);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Asistencia
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="flex justify-between mx-20 my-5">
                            <button
                                className="mx-5 py-2 bg-blue-500 px-5 rounded-xl text-white hover:bg-blue-700"
                                onClick={handleAnterior}
                            >
                                Dia Anteriror
                            </button>
                            <div>
                                <input
                                    type="date"
                                    name=""
                                    id=""
                                    className="rounded-xl"
                                    value={fecha}
                                    onChange={handleChange}
                                />
                                <Link
                                    className="mx-5 py-2 bg-blue-500 px-5 rounded-xl text-white hover:bg-blue-700"
                                    href={route("asistencia.fecha", fecha)}
                                    id="inp_fecha"
                                >
                                    Buscar
                                </Link>
                            </div>

                            <button className="mx-5 py-2 bg-blue-500 px-5 rounded-xl text-white hover:bg-blue-700" onClick={handleSiguiente} >
                                Siguiente dia
                            </button>
                        </div>
                        <Table asistencias={asistencias}></Table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
