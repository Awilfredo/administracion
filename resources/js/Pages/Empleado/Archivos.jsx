import { router, useForm } from "@inertiajs/react";
import { useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useDropzone } from "react-dropzone";

export default function Archivos({ empleadoId, archivos }) {
    const {
        data,
        setData,
        post,
        processing,
        progress,
        errors,
        reset,
        wasSuccessful,
    } = useForm({
        archivo: null,
        nombre: "",
        empleado_id: empleadoId,
    });

    const onDrop = useCallback(
        (acceptedFiles) => {
            setData("archivo", acceptedFiles[0]);
        },
        [setData]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("archivos.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    icon: "success",
                    title: "Archivo subido correctamente",
                    showConfirmButton: false,
                    timer: 1500,
                });
            },
        });
    };

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };
    const handleCancel = () => {
        reset();
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Estás seguro de eliminar este archivo?",
            text: "No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminarlo!",
        }).then((result) => {
            if (result.isConfirmed) {
        router.delete(route("archivos.destroy", {empleadoArchivo:id}), {
            onSuccess: () => {
                reset();
                Swal.fire({
                    icon: "success",
                    title: "Archivo eliminado correctamente",
                    showConfirmButton: false,
                    timer: 1500,
                });
            },
            preserveScroll: true,
        });
            }
        });
    };

    return (
        <div className="w-full mt-10 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                Subir Archivos
            </h2>
            <form onSubmit={submit}>
                <div className="flex gap-4 mb-2">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        className="border border-gray-300 rounded p-2"
                        type="text"
                        name="nombre"
                        value={data.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        required
                    />
                </div>
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-300 ${
                        isDragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                    }`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-blue-600">
                            Suelta el archivo aquí...
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            Arrastra y suelta un archivo aquí, o haz clic para
                            seleccionar
                        </p>
                    )}
                </div>

                {data.archivo && (
                    <div className="mt-4 text-sm text-gray-600">
                        <p>
                            <strong>Archivo seleccionado:</strong>{" "}
                            {data.archivo.name}
                        </p>
                    </div>
                )}

                {errors.archivo && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.archivo}
                    </p>
                )}

                {progress && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${progress.percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-center mt-1">
                            {progress.percentage}%
                        </p>
                    </div>
                )}

                {wasSuccessful && !processing && (
                    <p className="mt-2 text-sm text-green-600">
                        ¡Archivo subido con éxito!
                    </p>
                )}

                <div className="flex justify-end mt-6 gap-4">
                    {data.archivo && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!data.archivo || processing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? "Subiendo..." : "Subir Archivo"}
                    </button>
                </div>
            </form>

            <div>
                <DataTable
                    columns={[
                        { name: "Nombre", selector: (row) => row.nombre },
                        {name:'Tipo',selector:(row)=>row.ruta.split('.').pop()},
                        {
                            name: "Acciones",
                            selector: (row) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            window.open(
                                                `/storage/${row.ruta}`,
                                                "_blank"
                                            )
                                        }
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        descargar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    data={archivos}
                />
            </div>
        </div>
    );
}
