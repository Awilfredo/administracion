import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ManejoFechas } from "@/Helpers/ManejoFechas";
import { useEffect, useState } from "react";
import { CrearEmpleado } from "@/Helpers/CrearEmpleado";
import { ComprimirImagen } from "@/Helpers/ComprimirImagen";
import SanForm from "./Partials/SanForm";

function Create({ auth, anacods, jefes, areas, posiciones, horarios }) {
    const { fechaActual } = ManejoFechas();
    const [errors, setErrors] = useState({});

    const [data, setData] = useState({
        anacod: "", //
        nombres: "", //
        apellidos: "", //
        anapas: "", //
        anamai: "", //
        anapai: "SV", //
        anatel: "", //
        anarad: "",
        anajef: "",
        anarea: "",
        folcod: null, // Valor numérico
        anaext: "",
        anaimg: "",
        anapos: "",
        anames: null, // Valor numérico
        anadia: null, // Valor numérico
        fecha_ingreso:  fechaActual(), // Fechas como string
        lider_area: "",
        folcodreal: null, // Valor numérico
        horario_id: 2, // Valor numérico
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

    const { comprimir } = ComprimirImagen();
    const handleChangeFile = async (archivo, document) => {
        let file;
        if (archivo.type.startsWith("image/")) {
            console.log("es una imagen");
            file = await comprimir(archivo);
        } else {
            file = archivo;
        }

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

            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const uploadFile = (file) => {
        console.log(file.name);
        console.log(file);
        console.log(data.files.length);
        console.log(data.files);

        let anaimg = undefined;
        if (file?.name?.includes("imagen")) {
            anaimg = data?.anacod + "_" + file.name;
            console.log(`se setteo anaimg ${anaimg}`);
        }

        if (data.files.length) {
            console.log(`data.files.length`);
            let map_old_files = data.files.reduce((acc, item) => {
                acc.set(item.name.split(".")[0], item);
                return acc;
            }, new Map());

            map_old_files.set(file.name.split(".")[0], file);

            setData((prevData) => ({
                ...prevData,
                ...(anaimg ? { anaimg } : {}), // Solo asigna anaimg si tiene un valor
                files: [...Array.from(map_old_files.values())],
            }));
        } else {
            console.log(`else data.files.length`);
            setData((prevData) => ({
                ...prevData,
                files: [file],
                ...(anaimg ? { anaimg } : {}), // Solo asigna anaimg si tiene un valor
            }));
        }
    };

    const handleSubmit = (e) => {
        const postData = {
            anacod: data.anacod ? data.anacod : null, // Validación
            ananam:
                data.nombres && data.apellidos
                    ? `${data.nombres} ${data.apellidos}`
                    : null, // Validación compuesta
            anapas: data.anapas ? data.anapas : null,
            anapai: data.anapai ? data.anapai : null,
            anasta:'A',
            anamai: data.anamai ? data.anamai : null,
            anatel: data.anatel ? data.anatel : null,
            anarea: data.anarea ? data.anarea : null,
            anarad: data.anarad ? data.anarad : null,
            anajef: data.anajef ? data.anajef : null,
            folcod: data.folcod ? data.folcod : null,
            folcodreal: data.folcodreal ? data.folcodreal : null,
            anaext: data.anaext ? data.anaext : null,
            anapos: data.anapos ? data.anapos : null,
            anames: data.anames ? data.anames : null,
            anadia: data.anadia ? data.anadia : null,
            fecha_ingreso: data.fecha_ingreso ? data.fecha_ingreso : null,
            horario_id: data.horario_id ? data.horario_id : null,
            lider_area: data.lider_area ? data.lider_area : null,
            anaimg: data.anacod
                ? `${data.anacod.toLocaleLowerCase()}.jpg`
                : null, // Validación con transformación
        };
        console.log(postData);
        router.visit(route("empleados.store"), {
            method: "post",
            data: postData,
            preserveState: true,
            onError: (errors) => {
                setErrors(errors);
                console.log(errors);
            },
        });
    };

    const handleJefaturas = (e) => {
        if (data.jefaturas.length) {
            let jefaturas = [...data.jefaturas];
            if (jefaturas.includes(e.target.value)) {
                let exist = jefaturas.filter(
                    (jefatura) => jefatura != e.target.value
                );
                jefaturas = exist;
            } else {
                jefaturas.push(e.target.value);
            }
            setData("jefaturas", jefaturas);
        } else {
            setData("jefaturas", [e.target.value]);
        }
    };

    const handleBoss = (value) => {
        setData({ ...data, isBoss: value, jefaturas: [] });
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
        console.log(data?.nombres + " " + data?.apellidos);
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
                ananam: data?.nombres + " " + data?.apellidos,
            });
        } catch (e) {
            console.log(e);
        }
    }, [data.nombres, data.apellidos]);

    useEffect(() => {
        let pwd = generatePassword();
        setData({ ...data, anapas: pwd });
    }, []);

    return (
        <AuthenticatedLayout user={auth.user} header={<p>Alta de empleado</p>}>
            <Head title="Alta" />
            <SanForm
                data={data}
                setData={setData}
                handleSubmit={handleSubmit}
                errors={errors}
                areas={areas}
                posiciones={posiciones}
                jefes={jefes}
                horarios={horarios}
            >
                <div className="flex w-full justify-center">
                    <button
                        className="my-10 bg-blue-500 text-white px-5 py-4 hover:bg-blue-700 rounded-xl"
                        onClick={handleSubmit}
                    >
                        Guardar
                    </button>
                </div>
            </SanForm>
        </AuthenticatedLayout>
    );
}

export default Create;
