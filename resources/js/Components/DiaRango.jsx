import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useState } from "react";

function DiaRango({ fechas, setFechas }) {
    const { fechaActual } = ManejoFechas();
    const [rango, setRango] = useState(false);
    const [checked, setChecked] = useState(true);
    

    const handleRangoChange = (e) => {
        console.log(e.target.value);
        if (e.target.value === "dia") {
            setFechas({ fechas, fecha_fin: null });
            setRango(false);
            setChecked(true)
        } else {
            setRango(true);
            setFechas({ ...fechas, fecha_fin: fechaActual() });
            setChecked(false)
        }
    };
    return (
        <div>
            <div className="flex gap-5 mb-2">
                <div>
                    <label htmlFor="dia" className="mr-2">
                        Dia
                    </label>
                    <input
                        type="radio"
                        id="dia"
                        name="rango"
                        value="dia"
                        onChange={handleRangoChange}
                        checked={checked}
                    />
                </div>
                <div>
                    <label htmlFor="rango" className="mr-2">
                        Rango
                    </label>
                    <input
                        type="radio"
                        name="rango"
                        id="rango"
                        onChange={handleRangoChange}
                        value="rango"
                        checked={!checked}
                    />
                </div>
            </div>
            <div className="flex">
                <input
                    type="date"
                    name=""
                    id=""
                    className="rounded-xl"
                    value={fechas.fecha}
                    onChange={(e) =>
                        setFechas({ ...fechas, fecha: e.target.value })
                    }
                    max={fechaActual()}
                />

                {rango ? (
                    <div>
                        <span className="mx-2">Hasta</span>
                        <input
                            type="date"
                            name=""
                            id=""
                            className="rounded-xl"
                            max={fechaActual()}
                            min={fechas.fecha}
                            value={fechas.fecha_fin}
                            onChange={(e) =>
                                setFechas({
                                    ...fechas,
                                    fecha_fin: e.target.value,
                                })
                            }
                        />
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}

export default DiaRango;
