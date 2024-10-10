import DangerButton from "@/Components/DangerButton";
import EditIcon from "@/Components/EditIcon";
import AddIcon from "@/Components/Icons/AddIcon";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import PrimaryButtonBlue from "@/Components/PrimaryButtonBlue";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "react-data-table-component";
import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { DeleteIcon } from "@/Components/DeleteIcon";
import AlertIcon from "@/Components/Icons/AlertIcon";
import Search from "@/Components/Search";
function Create({ auth, tags }) {
    const {
        data,
        setData,
        post,
        delete: destroy,
        reset,
        errors,
    } = useForm({
        uid: "",
        anacod: "",
    });

    const [disableAnacod, setDisableAnacod] = useState(false);
    const [disableUid, setDisableUid] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");
    const [resultados, setResultados] = useState([...tags]);
    
    const [confirmDeletion, setConfirmingDeletion] = useState(false);

    const columns = [
        {
            name: "UID",
            selector: (row) => row.uid,
            sortable: true,
        },
        {
            name: "USUARIO",
            selector: (row) => row.anacod,
            sortable: true,
        },
        {
            name: "NOMBRE",
            selector: (row) => row.ananam,
            sortable: true,
        },
        {
            name: "OPCIONES",
            selector: (row) => {
                return (
                    <div>
                        {row.uid ? (
                            <div>
                                <button
                                    onClick={() =>
                                        handleClickEdit(row.uid, row.anacod)
                                    }
                                >
                                    <EditIcon className="text-blue-500 hover:text-blue-700"></EditIcon>
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(row.uid, row.anacod)
                                    }
                                >
                                    <DeleteIcon className="text-red-500 hover:text-red-700"></DeleteIcon>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleClickCrear(row.anacod)}
                            >
                                <AddIcon
                                    width="28"
                                    height="28"
                                    className="text-green-700 hover:text-green-900"
                                ></AddIcon>
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleClickEdit = (uid, anacod) => {
        setShowModal(true);
        setDisableUid(true);
        setDisableAnacod(false);
        setData({ anacod, uid });
        setModalText(`Editar Tag`);
    };

    const handleClickCrear = (anacod = "") => {
        setShowModal(true);
        setData({ anacod: anacod, uid: "" });
        if (anacod) {
            setDisableAnacod(true);
            setDisableUid(false);
        } else {
            setDisableAnacod(false);
            setDisableUid(false);
        }
        setModalText(`Crear un nuevo Tag`);
    };

    const handleSubmit = () => {
        post(route("tag.store"), {
            preserveScroll: true,
            onSuccess: (response) => {
                reset();
                setShowModal(false);
                setResultados(response.props.tags)
            },
            onError: (errors) => {},
        });
    };

    const handleDelete = (uid, anacod)=>{
        setData({uid, anacod});
        setConfirmingDeletion(true);
    }
    const deleteTag = () => {
        destroy(route("tag.delete"), {
            preserveScroll: true,
            onSuccess: (response) => {
                setConfirmingDeletion(false);
                setResultados(response.props.tags)
            },
            onError: () => {},
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    TAGS NFC
                </h2>
            }
        >
            <div className="flex justify-end mx-5 mt-5">
                <button onClick={() => handleClickCrear()}>
                    <AddIcon width="40" height="40"></AddIcon>
                </button>
            </div>
            <div className="mx-5">
                <Search datos={tags} setResultados={setResultados} keys={['uid', 'anacod', 'ananam']}></Search>
                <DataTable data={resultados} columns={columns} fixedHeader></DataTable>
            </div>

            <Modal show={showModal}>
                <div>
                    <p className="mx-5 text-lg mt-5">{modalText}</p>
                    <div>
                        <div className="flex mt-5 flex-wrap justify-around">
                            <div>
                                <InputLabel value={"Usuario:"}></InputLabel>
                                <TextInput
                                    label="Usuario:"
                                    placeholder="Digita el usuario de SAN"
                                    value={data.anacod}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            anacod: e.target.value
                                                .toUpperCase()
                                                .trim(),
                                        })
                                    }
                                    disabled={disableAnacod}
                                ></TextInput>
                            </div>
                            <div>
                                <InputLabel value={"UID:"}></InputLabel>
                                <TextInput
                                    value={data.uid}
                                    placeholder="04CCCF825C1390"
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            uid: e.target.value
                                                .trim()
                                                .toUpperCase()
                                                .replaceAll(":", ""),
                                        })
                                    }
                                    disabled={disableUid}
                                ></TextInput>
                            </div>
                        </div>
                        <div className="my-5 flex gap-4 justify-end mx-5">
                            <PrimaryButtonBlue onClick={handleSubmit}>
                                Aceptar
                            </PrimaryButtonBlue>
                            <DangerButton onClick={() => setShowModal(false)}>
                                Cancelar
                            </DangerButton>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal show={confirmDeletion}>
                <div>
                    <div className="mt-10 flex justify-center flex-wrap">
                        <AlertIcon className="max-w-sm text-yellow-400"></AlertIcon>
                        <p className="mx-10 text-2xl mt-10">
                            Estas seguro que deseas eliminar el tag asignado al
                            usuario {data.anacod}
                        </p>
                    </div>

                    <div className="my-5 flex gap-4 justify-center mx-5">
                        <PrimaryButtonBlue onClick={deleteTag}>
                            Aceptar
                        </PrimaryButtonBlue>
                        <DangerButton onClick={() => setConfirmingDeletion(false)}>
                            Cancelar
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

export default Create;
