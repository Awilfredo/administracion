import { DeleteIcon } from "@/Components/DeleteIcon";
import TextInput from "@/Components/TextInput";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useId } from "react";

function EditDay({ dia }) {
    console.log(dia);
    const { obtenerNombreDia } = ManejoFechas();

    return (
        <div className="bg-white sm:100  mt-5 p-5 rounded-xl">
            <div className="relative w-100">
                <button className="absolute right-0 text-red-500 hover:text-red-700">
                    <DeleteIcon width="32px" height="32px" className=''></DeleteIcon>
                </button>
            </div>
            <strong className="text-xl">
                {obtenerNombreDia(dia.numero_dia)}
            </strong>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                <div className="">
                    <div>
                        <label htmlFor={dia.numero_dia + "entrada"}>
                            Entrada
                        </label>
                    </div>
                    <TextInput
                        className="max-w-40"
                        id={dia.numero_dia + "entrada"}
                        value={dia.entrada}
                    ></TextInput>
                </div>
                <div>
                    <div>
                        <label htmlFor={dia.numero_dia + "salida_receso"}>
                            Salida receso
                        </label>
                    </div>
                    <TextInput
                        className="max-w-40"
                        id={dia.numero_dia + "salida_receso"}
                        value={dia.salida_almuerzo}
                    ></TextInput>
                </div>
                <div>
                    <div>
                        <label htmlFor={dia.numero_dia + "entrada_receso"}>
                            Entrada receso
                        </label>
                    </div>
                    <TextInput
                        className="max-w-40"
                        id={dia.numero_dia + "entrada_receso"}
                        value={dia.entrada_almuerzo}
                    ></TextInput>
                </div>
                <div>
                    <div>
                        <label htmlFor={dia.numero_dia + "salida"}>
                            Salida
                        </label>
                    </div>
                    <TextInput
                        className="max-w-40"
                        id={dia.numero_dia + "salida"}
                        value={dia.salida}
                    ></TextInput>
                </div>
            </div>
        </div>
    );
}

export default EditDay;
