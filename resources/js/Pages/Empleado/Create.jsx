import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import TextInput from "./Partials/TextInput";
import Select from "./Partials/Select";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
function Create({ auth, jefes, areas, posiciones, horarios, errors}) {
    const { fechaActual } = ManejoFechas();
    const { data, setData, post, processing } = useForm({
        anacod: "",
        ananam: "",
        anamai: "",
        anapas: "",
        fecha_nacimiento: "",
        anapai: "SV",
        fecha_ingreso: fechaActual(),
        anapos: "",
        anarea: "",
        anatel: "",
        anajef: "",
        folcod: "",
        anaext: "",
        horario_id: 1,
    });
    console.log(errors)
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data);
        post(route('empleados.store'));
    };

    function estaVacio() {
        // Verificar si el objeto no tiene ninguna propiedad propia
        for (var key in errors) {
            if (errors.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    console.log(areas, jefes, horarios);
    return (
        <AuthenticatedLayout user={auth.user} header={<p>Alta de empleado</p>}>
            <Head title="Alta" />
            <div className="flex justify-center mt-5">
                <div className="w-3/5">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white p-5 rounded-xl">
                            <div>
                                <p className="text-xl">
                                    Informacion de Usuario
                                </p>
                                <hr className="h-1 my-5 bg-red-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <TextInput
                                    label="Codigo de usuario"
                                    placeholder="anacod"
                                    value={data.anacod}
                                    className={errors.anacod && 'border-red-500'}
                                    onChange={(e) =>
                                        setData(
                                            "anacod",
                                            e.target.value.trim().toUpperCase()
                                        )
                                    }
                                ></TextInput>
                                <TextInput
                                    label="Nombre completo"
                                    placeholder="Juan Carlos Perez Sosa"
                                    value={data.ananam}
                                    className={errors.ananam && 'border-red-500'}
                                    onChange={(e) =>
                                        setData(
                                            "ananam",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                ></TextInput>
                                <TextInput
                                 className={errors.anamai && 'border-red-500'}
                                    label="Email"
                                    placeholder="example@red.com.sv"
                                    value={data.anamai}
                                    type="email"
                                    onChange={(e) =>
                                        setData("anamai", e.target.value.trim())
                                    }
                                ></TextInput>
                                <TextInput
                                 className={errors.anapas && 'border-red-500'}
                                    label="Contraseña"
                                    placeholder=""
                                    value={data.anapas}
                                    onChange={(e) =>
                                        setData("anapas", e.target.value.trim())
                                    }
                                ></TextInput>
                                <TextInput
                                 className={errors.fecha_nacimiento && 'border-red-500'}
                                    type="Date"
                                    label="Fecha de nacimiento"
                                    value={data.fecha_nacimiento}
                                    onChange={(e) =>
                                        setData(
                                            "fecha_nacimiento",
                                            e.target.value
                                        )
                                    }
                                ></TextInput>
                            </div>
                        </div>

                        <div className="bg-white p-5 mt-10 rounded-xl">
                            <div className="">
                                <p className="text-xl">
                                    Informacion de empleado
                                </p>
                                <hr className="h-1 my-5 bg-red-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <TextInput
                                 className={errors.fecha_ingreso && 'border-red-500'}
                                    type="Date"
                                    label="Fecha de ingreso"
                                    value={data.fecha_ingreso}
                                    onChange={(e) =>
                                        setData("fecha_ingreso", e.target.value)
                                    }
                                ></TextInput>
                                <Select
                                 className={errors.anapai && 'border-red-500'}
                                    label="Pais"
                                    value={data.anapai}
                                    onChange={(e) =>
                                        setData("anapai", e.target.value)
                                    }
                                >
                                    <option value="SV">El Salvador</option>
                                    <option value="GT">Guatemala</option>
                                </Select>
                                <TextInput
                                 className={errors.anarea && 'border-red-500'}
                                    list="areas"
                                    label="Area"
                                    placeholder="IT"
                                    value={data.anarea}
                                    onChange={(e) =>
                                        setData("anarea", e.target.value)
                                    }
                                ></TextInput>
                                <datalist id="areas">
                                    {areas.map((element, index) => (
                                        <option
                                            key={index}
                                            value={element.anarea}
                                        >
                                            {element.anarea}
                                        </option>
                                    ))}
                                </datalist>
                                <TextInput
                                 className={errors.anapos && 'border-red-500'}
                                list="posiciones"
                                    label="Posicion"
                                    placeholder="Asistente administrativo"
                                    value={data.anapos}
                                    onChange={(e) =>
                                        setData(
                                            "anapos",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                ></TextInput>
                                <datalist id="posiciones">
                                    {posiciones.map((element, index)=><option key={index} value={element.anapos}>{element.anapos}</option>)}
                                </datalist>
                                <TextInput
                                 className={errors.anajef && 'border-red-500'}
                                    label="Jefe"
                                    placeholder="Ingresa el jefe"
                                    list="jefes"
                                    value={data.anajef}
                                    onChange={(e)=>setData('anajef', e.target.value.toUpperCase().trim())}
                                ></TextInput>
                                <datalist id="jefes">
                                    {jefes.map((element, index) => (
                                        <option value={element.anajef}>
                                            {element.anajef}
                                        </option>
                                    ))}
                                </datalist>
                                <TextInput
                                 className={errors.anatel && 'border-red-500'}
                                    label="Numero Asignado"
                                    placeholder="77778888"
                                    value={data.anatel}
                                    onChange={(e) =>
                                        setData("anatel", e.target.value.trim())
                                    }
                                ></TextInput>
                                <TextInput
                                 className={errors.folcod && 'border-red-500'}
                                    label="Anexo"
                                    placeholder="342587"
                                    value={data.folcod}
                                    onChange={(e) =>
                                        setData("folcod", e.target.value.trim())
                                    }
                                ></TextInput>
                                <TextInput
                                 className={errors.anaext && 'border-red-500'}
                                    label="Extencion"
                                    placeholder="2000"
                                    value={data.anaext}
                                    onChange={(e) =>
                                        setData("anaext", e.target.value.trim())
                                    }
                                ></TextInput>
                                <Select
                                    label="Horario"
                                    value={data.horario_id}
                                    onChange={(e) =>
                                        setData("horario_id", e.target.value)
                                    }
                                >
                                    {horarios.map((element, index)=><option key={index} value={element.id}>{element.nombre}</option>)}

                                </Select>
                            </div>
                        {!estaVacio() && <p className="bg-red-200 rounded px-5 py-2 h-10 text-gray-800 text-center">Se han encontrado errores en los datos proporcionados</p>}
                        </div>
                        <div className="flex w-full justify-center">
                            <button className="my-10 bg-blue-500 text-white px-5 py-4 hover:bg-blue-700 rounded-xl">
                                Crear usuario
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Create;
