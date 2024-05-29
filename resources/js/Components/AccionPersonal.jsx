import { useState } from "react";
import PrimaryButton from "./PrimaryButton";

function AccionPersonal({handleClickAccion}) {

    const [accion, setAccion] = useState("");

    const handleChange = (e)=>{
        setAccion(e.target.value)
    }    

    const handleWrite = (e)=>{
        setAccion(e.target.value);
    }


    return (
        <div>
            <div>
                <p className="mb-5">
                    Agregar o seleccionar una accion de personal para los
                    empleados seleccionador
                </p>
                <input type="text" className="rounded-xl" value={accion} onChange={handleWrite} />
                <select name="" id="" className="rounded-xl mr-5" onChange={handleChange}>
                    <option value="">Acciones de personal</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Asueto">Asueto</option>
                    <option value="Incapacidad">Incapacidad</option>
                </select>
                <div className="sm:flex sm:w-full sm:justify-center sm:mt-5">
                <PrimaryButton onClick={()=>accion!=='' && handleClickAccion(accion)} className="bg-blue-600 hover:bg-blue-800">Agregar</PrimaryButton>
                </div>
                    
            </div>
        </div>
    );
}

export default AccionPersonal;
