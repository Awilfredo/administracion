import AccionPersonal from "@/Components/AccionPersonal";
import Table from "@/Components/Table";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Dashboard({ auth, asistencias, date = "" }) {
    const [fecha, setFecha] = useState(date);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
        accion_personal:'',
        id: '',
    });

    const handleCheck = (e, id) => {
        console.log(e.target.checked);
        e.target.checked
            ? setSelectedUsers([...selectedUsers, id])
            : selectedUsers.includes(id) &&
              setSelectedUsers(selectedUsers.filter((item) => item !== id));
    };

    useEffect(() => {
        console.log(selectedUsers);
        if(selectedUsers.length){
            
        }
    }, [selectedUsers]);

    const handleAccion = (accion) => {
        console.log(accion);
    };

    const handleChange = (e) => {
        setFecha(e.target.value);
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
                        { /*
                            <AccionPersonal
                                handleClickAccion={handleAccion}
                            ></AccionPersonal>*/}
                        </div>
                        <Table
                            asistencias={asistencias}
                            handleCheck={handleCheck}
                        ></Table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
