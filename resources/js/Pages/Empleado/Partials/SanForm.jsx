import TextInput from "./TextInput";
import Select from "./Select";
import { CheckBoxGroup } from "@/Components/CheckBoxGroup";
import { useEffect, useState } from "react";

function SanForm({
    data = {},
    setData,
    errors,
    areas = [],
    posiciones = [],
    jefes = [],
    horarios = [],
    disabled = false,
    children,
    tipo = "crear",
}) {

    const [jefaturas, setJefaturas] = useState([]);
    
    const handleJefaturas = (e) => {
        if (jefaturas.length > 0) {
            let areas =[...jefaturas];
            if (areas.includes(e.target.value)) {
                let exist = areas.filter(
                    (area) => area != e.target.value
                );
                areas = exist;
            } else {
                areas.push(e.target.value);
            }
            setJefaturas(areas);
        } else {
            setJefaturas([e.target.value]);
        }
        
    };

    useEffect(() => {
        console.log(jefaturas);
        setData({
            ...data,
            jefaturas: jefaturas,
        });        
    }, [jefaturas]);

    return (
        <div className="flex justify-center mt-5">
            <div className="sm:w-full lg:w-4/5">
                <div>
                    <div className="bg-white p-5 rounded-xl">
                        <div>
                            <p className="text-xl">Informacion de Usuario</p>
                            <hr className="h-1 my-5 bg-red-800" />
                        </div>
                        <div className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-1 gap-4 mb-5">
                            {!disabled && tipo === "editar" && (
                                <TextInput
                                    label={
                                        <div>
                                            Nombre
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </div>
                                    }
                                    placeholder="Juan Carlos"
                                    value={data.ananam}
                                    className={
                                        errors.ananam && "border-red-500"
                                    }
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            ananam: e.target.value.toUpperCase(),
                                        })
                                    }
                                    disabled={disabled}
                                    // onBlur={makeAnacod({ ...data, anacods: anacods, setData: setData, data })}
                                ></TextInput>
                            )}

                            {!disabled && tipo === "crear" && (
                                <TextInput
                                    label={
                                        <div>
                                            Nombres
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </div>
                                    }
                                    placeholder="Juan Carlos"
                                    value={data.nombres}
                                    className={
                                        errors.ananam && "border-red-500"
                                    }
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            nombres:
                                                e.target.value.toUpperCase(),
                                        })
                                    }
                                    disabled={disabled}
                                    // onBlur={makeAnacod({ ...data, anacods: anacods, setData: setData, data })}
                                ></TextInput>
                            )}
                            {!disabled && tipo === "crear" && (
                                <TextInput
                                    label={
                                        <div>
                                            Apellidos
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </div>
                                    }
                                    placeholder="Perez Sosa"
                                    value={data.apellidos}
                                    className={
                                        errors.ananam && "border-red-500"
                                    }
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            apellidos:
                                                e.target.value.toUpperCase(),
                                        })
                                    }
                                    // onBlur={makeAnacod({ ...data, anacods: anacods, setData: setData, data })}
                                    disabled={disabled}
                                ></TextInput>
                            )}

                            <TextInput
                                label={
                                    <div>
                                        Codigo de usuario
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder="anacod"
                                value={data.anacod}
                                className={
                                    errors.anacod
                                        ? "border-red-500 bg-gray-300"
                                        : "bg-gray-300"
                                }
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anacod: e.target.value.toUpperCase(),
                                    })
                                }
                                disabled={true}
                            ></TextInput>

                            <TextInput
                                className={errors.anapas && "border-red-500"}
                                label={
                                    <div>
                                        Contraseña
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder=""
                                value={data.anapas}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anapas: e.target.value.toUpperCase(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>
                            <TextInput
                                label={
                                    <div>
                                        Email
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder="example@red.com.sv"
                                value={data.anamai}
                                type="email"
                                className={
                                    errors.anamai
                                        ? "border-red-500 bg-gray-300"
                                        : "bg-gray-300"
                                }
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anamai: e.target.value.toUpperCase(),
                                    })
                                }
                                disabled={true}
                            ></TextInput>
                            {!disabled ? (
                                <div className="flex gap-4">
                                    <TextInput
                                        className={
                                            errors.anames && "border-red-500"
                                        }
                                        type="number"
                                        label={
                                            <div>
                                                Mes de nacimiento
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </div>
                                        }
                                        value={data.anames}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                anames: e.target.value.toUpperCase(),
                                            })
                                        }
                                        disabled={disabled}
                                    ></TextInput>
                                    <TextInput
                                        className={
                                            errors.anadia && "border-red-500"
                                        }
                                        type="number"
                                        label={
                                            <div>
                                                dia de nacimiento
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </div>
                                        }
                                        value={data.anadia}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                anadia: e.target.value,
                                            })
                                        }
                                        disabled={disabled}
                                    ></TextInput>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="">
                                        Nacimiento {"(mes/dia)"}
                                    </label>{" "}
                                    <p>
                                        {data.anames} / {data.anadia}
                                    </p>
                                </div>
                            )}

                            <TextInput
                                className={
                                    errors.fecha_ingreso && "border-red-500"
                                }
                                type="Date"
                                label={
                                    <div>
                                        Fecha de ingreso
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                value={data.fecha_ingreso}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        fecha_ingreso: e.target.value,
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>

                            {!disabled ? (
                                <Select
                                    className={
                                        errors.anapai && "border-red-500"
                                    }
                                    label={
                                        <div>
                                            Pais
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </div>
                                    }
                                    value={data.anapai}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            anapai: e.target.value,
                                        })
                                    }
                                >
                                    <option value="SV">El Salvador</option>
                                    <option value="GT">Guatemala</option>
                                </Select>
                            ) : (
                                <div className="text-gray-500">
                                    <label>Pais</label>
                                    <p>{data.anapai}</p>
                                </div>
                            )}
                            <TextInput
                                className={errors.anarea && "border-red-500"}
                                list="areas"
                                label={
                                    <div>
                                        Area
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder="IT"
                                value={data.anarea}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anarea: e.target.value.toUpperCase(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>
                            <datalist id="areas">
                                {areas.map((element, index) => (
                                    <option key={index} value={element.anarea}>
                                        {element.anarea}
                                    </option>
                                ))}
                            </datalist>
                            <TextInput
                                disabled={disabled}
                                className={errors.anapos && "border-red-500"}
                                list="posiciones"
                                label={
                                    <div>
                                        Posicion
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder="Asistente administrativo"
                                value={data.anapos}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anapos: e.target.value.toUpperCase(),
                                    })
                                }
                            ></TextInput>
                            <datalist id="posiciones">
                                {posiciones.map((element, index) => (
                                    <option key={index} value={element.anapos}>
                                        {element.anapos}
                                    </option>
                                ))}
                            </datalist>

                            <TextInput
                                className={errors.anajef && "border-red-500"}
                                label={
                                    <div>
                                        Jefe
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder="Ingresa el jefe"
                                list="jefes"
                                value={data.anajef}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anajef: e.target.value
                                            .toUpperCase()
                                            .trim(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>

                            <div className="flex items-center mb-5">
                                <p className="text-gray-800"></p>
                                <div className="mx-5">
                                    <label htmlFor="jefe">Jefe</label>
                                    <input
                                        type="radio"
                                        name="isBoss"
                                        id="jefe"
                                        className="mx-2"
                                        onChange={() =>
                                            setData({ ...data, isBoss: true })
                                        }
                                        checked={data.isBoss}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="noJefe">No jefe</label>
                                    <input
                                        type="radio"
                                        name="isBoss"
                                        id="noJefe"
                                        className="mx-2"
                                        onChange={() =>
                                            setData({ ...data, isBoss: false })
                                        }
                                        checked={!data.isBoss}
                                    />
                                </div>
                            </div>

                            {data.isBoss && (
                                <div className="mt-5">
                                    <p className="text-gray-800">
                                        Selecciona las jefaturas a asignar:
                                    </p>
                                    <div className="flex flex-wrap gap-5 items-center mb-5">
                                        {areas.map((item) => (
                                            <div className="mx-5 mb-2">
                                                <CheckBoxGroup
                                                    label={item.anarea}
                                                    value={item.anarea}
                                                    onChange={handleJefaturas}
                                                ></CheckBoxGroup>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <TextInput
                                className={
                                    errors.lider_area && "border-red-500"
                                }
                                label={
                                    <div>
                                        Lider de area
                                        <span className="text-red-600">*</span>
                                    </div>
                                }
                                placeholder="Lider de area"
                                list="jefes"
                                value={data.lider_area}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        lider_area: e.target.value
                                            .toUpperCase()
                                            .trim(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>

                            <datalist id="jefes">
                                {jefes.map((element, index) => (
                                    <option value={element.anajef}>
                                        {element.anajef}
                                    </option>
                                ))}
                            </datalist>

                            <TextInput
                                className={errors.anatel && "border-red-500"}
                                label="Numero Asignado INRICO"
                                placeholder="77778888"
                                value={data.anatel}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anatel: e.target.value.trim(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>

                            {/* <TextInput
                            className={
                                errors.anatel_real && "border-red-500"
                            }
                            label="Numero asignado REALPTT"
                            placeholder="77778888"
                            value={data.anatel_real}
                            onChange={(e) =>
                                setData(
                                    "anatel_real",
                                    e.target.value.trim()
                                )
                            }
                        ></TextInput> */}

                            <TextInput
                                className={errors.folcod && "border-red-500"}
                                label="Anexo INRICO"
                                placeholder="342587"
                                value={data.folcod}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        folcod: e.target.value.trim(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>

                            <TextInput
                                type="number"
                                className={errors.folcod && "border-red-500"}
                                label="Anexo REALPTT"
                                placeholder="342587"
                                value={data.folcodreal}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        folcodreal:
                                            e.target.value.trim() == ""
                                                ? null
                                                : e.target.value.trim(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>

                            <TextInput
                                className={errors.anaext && "border-red-500"}
                                label="Extencion"
                                placeholder="2000"
                                value={data.anaext}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anaext: e.target.value.trim(),
                                    })
                                }
                                disabled={disabled}
                            ></TextInput>
                            {!disabled ? (
                                <Select
                                    label={
                                        <div>
                                            Horario
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        </div>
                                    }
                                    value={data.horario_id}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            horario_id: e.target.value.trim(),
                                        })
                                    }
                                >
                                    {horarios.map((element, index) => (
                                        <option
                                            key={index}
                                            value={element.id}
                                            selected={
                                                element.id == data.horario_id
                                            }
                                        >
                                            {element.nombre}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <div className="text-gray-500">
                                    <label>Horario</label>
                                    <p>
                                        {
                                            horarios.find(
                                                (obj) =>
                                                    obj.id === data.horario_id
                                            )?.nombre
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* <div className="bg-white p-5  mt-10 rounded-xl">
                    <div>
                        <label htmlFor="hijos" className="w-full">
                            Informacion de hijos
                        </label>
                        <textarea
                            id="hijos"
                            className="w-full"
                            value={data.hijos}
                            onChange={(e) =>
                                setData("hijos", e.target.value)
                            }
                        ></textarea>
                    </div>

                    <div className="">
                        <p className="text-xl">
                            Informacion de empleado
                        </p>
                        <hr className="h-1 my-5 bg-red-800" />
                    </div>
                    <div className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-1 gap-4 mb-5">
                        <TextInput
                            label="Usuario de Mensajeria"
                            placeholder="Usuario Mensajeria"
                            value={data.usuario_mensajeria}
                            className={
                                errors.usuario_mensajeria
                                    ? "border-red-500 bg-gray-300"
                                    : "bg-gray-300"
                            }
                            disabled={true}
                        ></TextInput>
                        <TextInput
                            label="Usuario red control"
                            placeholder="Usuario red control"
                            value={data.usuario_red_control}
                            className={
                                errors.usuario_red_control
                                    ? "border-red-500 bg-gray-300"
                                    : "bg-gray-300"
                            }
                            disabled={true}
                        ></TextInput>
*/}

                    {/*}
                        <TextInput
                            className={
                                errors.salario && "border-red-500"
                            }
                            label="Salario"
                            placeholder="salario"
                            type="number"
                            value={data.salario}
                            onChange={(e) =>
                                setData("salario", e.target.value)
                            }
                        ></TextInput>
                        <TextInput
                            className={
                                errors.cuenta && "border-red-500"
                            }
                            label="Cuenta"
                            placeholder="Cuenta"
                            value={data.cuenta_bancaria}
                            onChange={(e) =>
                                setData(
                                    "cuenta_bancaria",
                                    e.target.value
                                )
                            }
                        ></TextInput>




                        <TextInput
                            className={errors.imei && "border-red-500"}
                            label="IMEI INRICO"
                            placeholder="56896235656456456"
                            value={data.imei}
                            onChange={(e) =>
                                setData("imei", e.target.value.trim())
                            }
                        ></TextInput>

                        <TextInput
                            className={
                                errors.imei_real && "border-red-500"
                            }
                            label="IMEI REALPTT"
                            placeholder="56896235656456456"
                            value={data.imei_real}
                            onChange={(e) =>
                                setData(
                                    "imei_real",
                                    e.target.value.trim()
                                )
                            }
                        ></TextInput>

                        <TextInput
                            className={errors.sim && "border-red-500"}
                            label="SIMCARD INRICO"
                            placeholder="342587564564218"
                            value={data.sim}
                            onChange={(e) =>
                                setData("sim", e.target.value.trim())
                            }
                        ></TextInput>

                        <TextInput
                            className={errors.sim && "border-red-500"}
                            label="SIMCARD REALPTT"
                            placeholder="34258756456456456"
                            value={data.sim_real}
                            onChange={(e) =>
                                setData(
                                    "sim_real",
                                    e.target.value.trim()
                                )
                            }
                        ></TextInput>


                        <div className="flex justify-between max-w-sm">
                            <TextInput
                                label={"Crear Red control"}
                                className="w-1"
                                type="checkbox"
                                value={data.redcontrol}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        redcontrol: e.target.checked,
                                    })
                                }
                            ></TextInput>
                            <TextInput
                                label={"Crear Mensajeria"}
                                value={data.mensajeria}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        mensajeria: e.target.checked,
                                    })
                                }
                                type="checkbox"
                                className="w-1"
                            ></TextInput>

                            <TextInput
                                className={
                                    errors.anapas && "border-red-500"
                                }
                                label="DUI"
                                placeholder="DUI"
                                value={data.dui}
                                onChange={(e) =>
                                    setData(
                                        "dui",
                                        e.target.value.trim()
                                    )
                                }
                            ></TextInput>

                            <TextInput
                                className={
                                    errors.anapas && "border-red-500"
                                }
                                label="NIT"
                                placeholder="NIT"
                                value={data.nit}
                                onChange={(e) =>
                                    setData(
                                        "nit",
                                        e.target.value.trim()
                                    )
                                }
                            ></TextInput>
                            <TextInput
                                className={
                                    errors.anapas && "border-red-500"
                                }
                                label="ISSS"
                                placeholder="Numero de ISSS"
                                value={data.isss}
                                onChange={(e) =>
                                    setData(
                                        "isss",
                                        e.target.value.trim()
                                    )
                                }
                            ></TextInput>
                            <Select
                                label={
                                    <div>
                                        Genero
                                        <span className="text-red-600">
                                            *
                                        </span>
                                    </div>
                                }
                                onChange={(e) =>
                                    setData("genero", e.target.value)
                                }
                            >
                                <option value="m">Masculino</option>
                                <option value="f">Femenino</option>
                            </Select>
                            <TextInput
                                className={
                                    errors.direccion && "border-red-500"
                                }
                                label="Direccion"
                                placeholder="Direccion"
                                value={data.direccion}
                                onChange={(e) =>
                                    setData("direccion", e.target.value)
                                }
                            ></TextInput>

                        </div>

                        <FileUploader
                            label="Subir imagen de perfil"
                            name="imagen"
                            handleChange={(file) =>
                                handleChangeFile(file, "imagen")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="Subir imagen dui frente"
                            name="dui_frente"
                            handleChange={(file) =>
                                handleChangeFile(file, "dui_frente")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="Subir imagen atas"
                            name="dui_atras"
                            handleChange={(file) =>
                                handleChangeFile(file, "dui_atras")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="Solvencia de PNC"
                            name="solvencia_pnc"
                            handleChange={(file) =>
                                handleChangeFile(file, "solvencia")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="subir Curriculum"
                            handleChange={(file) =>
                                handleChangeFile(file, "curriculum")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="Subir antecedentes penales"
                            handleChange={(file) =>
                                handleChangeFile(file, "antecedentes")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="Imagen resultados de laboratorio"
                            handleChange={(file) =>
                                handleChangeFile(file, "laboratorio")
                            }
                        ></FileUploader>
                        <FileUploader
                            label="Subir imagen de carta de referencia"
                            handleChange={(file) =>
                                handleChangeFile(
                                    file,
                                    "carta_referencia"
                                )
                            }
                        ></FileUploader>
                    </div>
                    {!estaVacio() && (
                        <p className="bg-red-200 rounded px-5 py-2 h-10 text-gray-800 text-center">
                            Se han encontrado errores en los datos
                            proporcionados
                        </p>
                    )}
                </div> */}
                    {children}
                </div>
            </div>
        </div>
    );
}

export default SanForm;
