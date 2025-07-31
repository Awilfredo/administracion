import React, { useState } from "react";
import Modal from "@/Components/Modal";
import { router, useForm } from "@inertiajs/react";
import DataTable from "react-data-table-component";

export default function EmpleadoHijos({ empleado_id, hijos }) {
    const { data, setData, post, patch, reset, processing } = useForm({
        id: null,
        empleado_id: empleado_id,
        nombre: "",
        fecha_nacimiento: "",
        genero: "",
    });

    const [open, setOpen] = useState(false);

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.id) {
            patch(route("hijos.update", data.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route("hijos.store"), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleCancel = () => {
        reset();
        setOpen(false);
    };

    const handleEdit = (hijo) => {
        setData(hijo);
        setOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este hijo?")) {
            router.delete(route("hijos.destroy", id), {
                onSuccess: () => {
                    reset();
                    Swal.fire({
                        icon: "success",
                        title: "Hijo eliminado correctamente",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
            });
        }
    };

    return (
        <div className="w-full mt-10 bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Informacion de hijos
                </h2>
                <button
                    onClick={() => setOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    Agregar Hijo
                </button>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    {hijos.length > 0 ? "Hijos" : "No hay hijos registrados"}
                </h3>

                <DataTable
                    columns={[
                        {
                            name: "Nombre",
                            selector: (row) => row.nombre,
                            sortable: true,
                            wrap: true,
                        },
                        {
                            name: "Fecha de nacimiento",
                            selector: (row) => row.fecha_nacimiento,
                        },
                        {
                            name: "Genero",
                            selector: (row) => (row.genero === "M") ? "Masculino" : "Femenino",
                        },
                        {
                            name: "Acciones",
                            selector: (row) => (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(row)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    data={hijos}
                />
            </div>

            <Modal show={open} onClose={handleCancel}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Agregar Nuevo Hijo
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="nombre"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                id="nombre"
                                value={data.nombre}
                                onChange={handleChange}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="fecha_nacimiento"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                name="fecha_nacimiento"
                                id="fecha_nacimiento"
                                value={data.fecha_nacimiento}
                                onChange={handleChange}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="genero"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Género
                            </label>
                            <select
                                name="genero"
                                id="genero"
                                value={data.genero}
                                onChange={handleChange}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Seleccionar género</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div className="flex justify-end items-center pt-4 space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? "Guardando..." : data.id ? "Actualizar Hijo" :  "Agregar Hijo"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
