import { Link, useForm } from "@inertiajs/react";
import { DeleteIcon } from "./DeleteIcon";
import EditIcon from "./EditIcon";
import { SaveIcon } from "./SaveIcon";
import { useState } from "react";

function AsistenciaRow({ element }) {
    const handleEdit = (id) => {
        document.getElementById(id).disabled = false;
        document.getElementById(id).focus();
    };

    const [showBtnSave, setshowBtnSave] = useState(false);
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            accion_personal: element.accion_personal,
            id: element.id,
        });


    const handleSubmit = () => {
        patch(route("asistencia.update"), {
            preserveScroll: true,
            onSuccess: () => Swal.fire({
                title: "Accion de personal actualizada!",
                text: "",
                icon: "success"
              }).then(e=>setshowBtnSave(false)),
        });
    };

    const handleChange = (e) => {
        setData("accion_personal", e.target.value);
        if (data.accion_personal != element.accion_personal) {
            setshowBtnSave(true);
        }
    };

    const handleBlur = (e) => {
        e.target.disabled = true;
        if (!element.accion_personal && data.accion_personal === "")
            setshowBtnSave(false);
    };

    const handleFocus = (e) => {
        e.target.className = "border-gray-500 rounded-xl bg-white";
    };

    const handleDelete = (id) => {
        
        Swal.fire({
            title: "Estas seguro que deseas eliminar esta accion de personal?",
            text: "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                patch(route("asistencia.delete"), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({
                        title: "Accion de personal actualizada!",
                        text: "",
                        icon: "success"
                      }).then(e=>{
                        setshowBtnSave(false);
                        setData('accion_personal', '')
                    }),
                });
            }
        })
    };

    return (
        <tr class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {element.fecha}
            </td>
            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                {element.anacod}
            </td>
            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                {element.ananam}
            </td>
            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                {element.evento}
            </td>
            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                {element.hora}
            </td>
            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                <input
                    type="text"
                    disabled
                    className="border-gray-500 rounded-xl"
                    value={data.accion_personal}
                    id={`accion_personal${element.id}`}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
            </td>

            <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap w-60">
                <button
                    onClick={() => handleEdit(`accion_personal${element.id}`)}
                    className="text-blue-500 mx-5"
                >
                    <EditIcon></EditIcon>
                </button>

                {showBtnSave && (
                    <button
                        className="text-green-500 mr-5"
                        onClick={handleSubmit}
                    >
                        <SaveIcon></SaveIcon>
                    </button>
                )}
                <button
                    className="text-red-500"
                    onClick={handleDelete}
                >
                     <DeleteIcon></DeleteIcon>
         
                </button>
            </td>
        </tr>
    );
}

export default AsistenciaRow;
