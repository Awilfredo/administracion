import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import TextInput from "./Partials/TextInput";
import Select from "./Partials/Select";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useEffect } from "react";

import { FileUploader } from "react-drag-drop-files";
import { CrearEmpleado } from "@/Helpers/CrearEmpleado";

function Create({ auth, anacods, jefes, areas, posiciones, horarios, errors }) {
    const { fechaActual } = ManejoFechas();
    const { data, setData, post, processing } = useForm({
        anacod: "",
        nombres: "",
        ananam: "",
        apellidos: "",
        direccion: "",
        hijos: "",
        dui: "",
        nit: "",
        isss: "",
        genero: "m",
        anamai: "",
        hijos: "",
        anapas: "",
        fecha_nacimiento: "",
        anapai: "SV",
        fecha_ingreso: fechaActual(),
        anapos: "",
        usuario_mensajeria: "",
        usuario_red_control: "",
        isBoss: false,
        anarea: "",
        salario: 0,
        cuenta_bancaria: "",
        anatel: "",
        anatel_real: "",
        anajef: "",
        folcod: "",
        folcod_real: "",
        sim: "",
        imei: "",
        sim_real: "",
        imei_real: "",
        anaext: "",
        horario_id: 1,
        files: [],
    });

    const { generatePassword, makeAnacod } = CrearEmpleado();

    const fileTypes = ["JPG", "PNG", "GIF", "JPEG"];
    /*
    const handleChangeFile = (file, document) => {
        const customFile={document, file}
        console.log(customFile);
        if (data.files.length) {
            let archivos = [...data.files];
            let filtrados = archivos.filter(obj => obj.document != document);
            filtrados.push(customFile);
            setData('files', filtrados);
        }else{
            setData('files', [customFile])
        }

        console.log(data.files);
    }
*/

    const handleChangeFile = (file, document) => {
        const selectedFile = file;
        if (selectedFile) {
            // Leer el archivo usando FileReader
            const reader = new FileReader();

            reader.onload = (e) => {
                const fileContent = e.target.result;
                const originalFileName = selectedFile.name;
                const fileExtension = originalFileName.split(".").pop();
                // Crear un nuevo archivo con el nuevo nombre
                const newFileName = `${document}.${fileExtension}`; // Cambia esto al nombre que desees
                const newFile = new File([fileContent], newFileName, {
                    type: selectedFile.type,
                });
                // Enviar el archivo renombrado
                uploadFile(newFile);
            };

            reader.readAsArrayBuffer(selectedFile)
        }
    };

    const uploadFile = (file) => {
        console.log(file);
        console.log(data.files.length);
        if (data.files.length) {
            console.log(`data.files.length`);
            let map_old_files = data.files.reduce((acc, item) => {
                acc.set(item.document, item);
                return acc;
            }, new Map());

            map_old_files.set(document, file);

            setData({
                ...data,
                files: [...Array.from(map_old_files.values())],
            });
        } else {
            console.log(`else data.files.length`);
            setData({ ...data, files: [file] });
        }
    };



    useEffect(() => {
        console.log(data.files);
    }, [data.files]);

    // console.log(errors)
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data);
        post(route("empleados.store"));
    };

    function estaVacio() {
        // Verificar si el objeto no tiene ninguna propiedad propia
        for (var key in errors) {
            if (errors.hasOwnProperty(key)) return false;
        }
        return true;
    }

    useEffect(() => {
        console.log("use effect");
        setData({ ...data, ananam: data?.nombres + " " + data?.apellidos });
        try {
            let anastasio = makeAnacod({ ...data, anacods: anacods });
            let amamai = anastasio.toLowerCase() + "@red.com.sv";
            let usuario_mensajeria =
                anastasio.toLowerCase() + "@mensajeria.red";
            let usuario_red_control =
                anastasio.toLowerCase() + "@redcontrol.com.sv";
            setData({
                ...data,
                anacod: anastasio,
                anamai: amamai,
                usuario_mensajeria,
                usuario_red_control,
            });            
        } catch (e) {console.log(e);}
    }, [data.nombres, data.apellidos]);

    useEffect(() => {
        let pwd = generatePassword();
        setData({ ...data, anapas: pwd });
    }, []);

    // console.log(areas, jefes, horarios);
    return (
        <AuthenticatedLayout user={auth.user} header={<p>Alta de empleado</p>}>
            <Head title="Alta" />
            <div className="flex justify-center mt-5">
                <div className="sm:w-full lg:w-4/5">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white p-5 rounded-xl">
                            <div>
                                <p className="text-xl">
                                    Informacion de Usuario
                                </p>
                                <hr className="h-1 my-5 bg-red-800" />
                            </div>
                            <div className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-1 gap-4 mb-5">
                                <TextInput
                                    label="Nombres"
                                    placeholder="Juan Carlos"
                                    value={data.nombres}
                                    className={
                                        errors.ananam && "border-red-500"
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "nombres",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    // onBlur={makeAnacod({ ...data, anacods: anacods, setData: setData, data })}
                                ></TextInput>

                                <TextInput
                                    label="Apellidos"
                                    placeholder="Perez Sosa"
                                    value={data.apellidos}
                                    className={
                                        errors.ananam && "border-red-500"
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "apellidos",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    // onBlur={makeAnacod({ ...data, anacods: anacods, setData: setData, data })}
                                ></TextInput>

                                <TextInput
                                    className={
                                        errors.anapas && "border-red-500"
                                    }
                                    label="Contraseña"
                                    placeholder=""
                                    value={data.anapas}
                                    onChange={(e) =>
                                        setData("anapas", e.target.value.trim())
                                    }
                                ></TextInput>

                                <TextInput
                                    className={
                                        errors.anapas && "border-red-500"
                                    }
                                    label="DUI"
                                    placeholder="DUI"
                                    value={data.dui}
                                    onChange={(e) =>
                                        setData("dui", e.target.value.trim())
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
                                        setData("nit", e.target.value.trim())
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
                                        setData("isss", e.target.value.trim())
                                    }
                                ></TextInput>
                                <Select
                                    label="Genero"
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
                                <TextInput
                                    className={
                                        errors.fecha_nacimiento &&
                                        "border-red-500"
                                    }
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
                        </div>

                        <div className="bg-white p-5  mt-10 rounded-xl">
                            <div className="">
                                <p className="text-xl">
                                    Informacion de empleado
                                </p>
                                <hr className="h-1 my-5 bg-red-800" />
                            </div>
                            <div className="grid lg:grid-cols-2 sm:grid-cols-1 md:grid-cols-1 gap-4 mb-5">
                                <TextInput
                                    label="Codigo de usuario"
                                    placeholder="anacod"
                                    value={data.anacod}
                                    className={
                                        errors.anacod
                                            ? "border-red-500 bg-gray-300"
                                            : "bg-gray-300"
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "anacod",
                                            e.target.value.trim().toUpperCase()
                                        )
                                    }
                                    disabled={true}
                                ></TextInput>
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
                                <TextInput
                                    label="Email"
                                    placeholder="example@red.com.sv"
                                    value={data.anamai}
                                    type="email"
                                    className={
                                        errors.anamai
                                            ? "border-red-500 bg-gray-300"
                                            : "bg-gray-300"
                                    }
                                    onChange={(e) =>
                                        setData("anamai", e.target.value.trim())
                                    }
                                    disabled={true}
                                ></TextInput>
                                <TextInput
                                    className={
                                        errors.fecha_ingreso && "border-red-500"
                                    }
                                    type="Date"
                                    label="Fecha de ingreso"
                                    value={data.fecha_ingreso}
                                    onChange={(e) =>
                                        setData("fecha_ingreso", e.target.value)
                                    }
                                ></TextInput>
                                <Select
                                    className={
                                        errors.anapai && "border-red-500"
                                    }
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
                                    className={
                                        errors.anarea && "border-red-500"
                                    }
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
                                    className={
                                        errors.anapos && "border-red-500"
                                    }
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
                                    {posiciones.map((element, index) => (
                                        <option
                                            key={index}
                                            value={element.anapos}
                                        >
                                            {element.anapos}
                                        </option>
                                    ))}
                                </datalist>

                                <div className="flex items-center mb-5">
                                    <p className="text-gray-800"></p>
                                    <div className="mx-5">
                                        <label htmlFor="jefe">Jefe</label>
                                        <input
                                            type="radio"
                                            name="isBoss"
                                            id="jefe"
                                            className="mx-2"
                                            onChange={(e) =>
                                                setData("isBoss", true)
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
                                            onChange={(e) =>
                                                setData("isBoss", false)
                                            }
                                            checked={!data.isBoss}
                                        />
                                    </div>
                                </div>

                                <TextInput
                                    className={
                                        errors.anajef && "border-red-500"
                                    }
                                    label="Jefe"
                                    placeholder="Ingresa el jefe"
                                    list="jefes"
                                    value={data.anajef}
                                    onChange={(e) =>
                                        setData(
                                            "anajef",
                                            e.target.value.toUpperCase().trim()
                                        )
                                    }
                                ></TextInput>
                                <datalist id="jefes">
                                    {jefes.map((element, index) => (
                                        <option value={element.anajef}>
                                            {element.anajef}
                                        </option>
                                    ))}
                                </datalist>

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
                                    className={
                                        errors.folcod && "border-red-500"
                                    }
                                    label="Anexo INRICO"
                                    placeholder="342587"
                                    value={data.folcod}
                                    onChange={(e) =>
                                        setData("folcod", e.target.value.trim())
                                    }
                                ></TextInput>

                                <TextInput
                                    className={
                                        errors.folcod && "border-red-500"
                                    }
                                    label="Anexo REALPTT"
                                    placeholder="342587"
                                    value={data.folcod_real}
                                    onChange={(e) =>
                                        setData(
                                            "folcod_real",
                                            e.target.value.trim()
                                        )
                                    }
                                ></TextInput>

                                <TextInput
                                    className={
                                        errors.anatel && "border-red-500"
                                    }
                                    label="Numero Asignado INRICO"
                                    placeholder="77778888"
                                    value={data.anatel}
                                    onChange={(e) =>
                                        setData("anatel", e.target.value.trim())
                                    }
                                ></TextInput>

                                <TextInput
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

                                <TextInput
                                    className={
                                        errors.anaext && "border-red-500"
                                    }
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
                                    {horarios.map((element, index) => (
                                        <option key={index} value={element.id}>
                                            {element.nombre}
                                        </option>
                                    ))}
                                </Select>
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
