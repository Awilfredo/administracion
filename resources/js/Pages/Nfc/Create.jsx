import DangerButton from "@/Components/DangerButton";
import EditIcon from "@/Components/EditIcon";
import EmptyState from "@/Components/EmptyState";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import PrimaryButtonBlue from "@/Components/PrimaryButtonBlue";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    HiCheckCircle,
    HiExclamationCircle,
    HiPencil,
    HiPlus,
    HiSearch,
    HiTag,
    HiTrash,
    HiUserCircle,
    HiX,
} from "react-icons/hi";
import DataTable from "react-data-table-component";

function Create({ auth, tagsConTag, tagsSinTag, totalEmpleados }) {
    const {
        data,
        setData,
        post,
        delete: destroy,
        reset,
    } = useForm({
        uid: "",
        anacod: "",
        ananam: "",
    });

    const [disableAnacod, setDisableAnacod] = useState(false);
    const [disableUid, setDisableUid] = useState(false);
    const [esEdicion, setEsEdicion] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [confirmDeletion, setConfirmingDeletion] = useState(false);

    const [tabActiva, setTabActiva] = useState("sin");
    const [query, setQuery] = useState("");

    const totalConTag = tagsConTag?.length ?? 0;
    const totalSinTag = tagsSinTag?.length ?? 0;
    const cobertura = totalEmpleados > 0 
        ? Math.round((totalConTag / totalEmpleados) * 100) 
        : 0;

    const sinTagFiltrados = useMemo(() => {
        if (!query) return tagsSinTag ?? [];
        const q = query.toLowerCase();
        return (tagsSinTag ?? []).filter(
            (r) =>
                String(r.anacod).toLowerCase().includes(q) ||
                (r.ananam && r.ananam.toLowerCase().includes(q))
        );
    }, [tagsSinTag, query]);

    const conTagFiltrados = useMemo(() => {
        if (!query) return tagsConTag ?? [];
        const q = query.toLowerCase();
        return (tagsConTag ?? []).filter(
            (r) =>
                String(r.uid).toLowerCase().includes(q) ||
                String(r.anacod).toLowerCase().includes(q) ||
                (r.ananam && r.ananam.toLowerCase().includes(q))
        );
    }, [tagsConTag, query]);

    const columnasSinTag = [
        {
            name: "USUARIO",
            selector: (row) => row.anacod,
            sortable: true,
            width: "140px",
        },
        {
            name: "NOMBRE",
            selector: (row) => row.ananam,
            sortable: true,
        },
        {
            name: "ACCIÓN",
            sortable: false,
            width: "140px",
            cell: (row) => (
                <button
                    onClick={() => handleClickCrear(row.anacod, row.ananam)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-500 hover:text-white transition-all font-medium text-sm"
                >
                    <HiPlus className="w-4 h-4" />
                    Asignar
                </button>
            ),
        },
    ];

    const columnasConTag = [
        {
            name: "UID",
            selector: (row) => row.uid,
            sortable: true,
            width: "160px",
            cell: (row) => (
                <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {row.uid}
                </span>
            ),
        },
        {
            name: "USUARIO",
            selector: (row) => row.anacod,
            sortable: true,
            width: "140px",
        },
        {
            name: "NOMBRE",
            selector: (row) => row.ananam,
            sortable: true,
        },
        {
            name: "ACCIONES",
            sortable: false,
            width: "140px",
            cell: (row) => (
                <div className="flex gap-1">
                    <button
                        onClick={() => handleClickEdit(row.uid, row.anacod, row.ananam)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Editar tag"
                    >
                        <HiPencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.uid, row.anacod, row.ananam)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar tag"
                    >
                        <HiTrash className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];

    const handleClickEdit = (uid, anacod, ananam) => {
        setShowModal(true);
        setEsEdicion(true);
        setDisableUid(true);
        setDisableAnacod(false);
        setData({ uid, anacod, ananam });
    };

    const handleClickCrear = (anacod = "", ananam = "") => {
        setShowModal(true);
        setEsEdicion(false);
        setData({ anacod, ananam, uid: "" });
        if (anacod) {
            setDisableAnacod(true);
            setDisableUid(false);
        } else {
            setDisableAnacod(false);
            setDisableUid(false);
        }
    };

    const handleCerrarModal = () => {
        setShowModal(false);
        setEsEdicion(false);
        reset();
    };

    const handleSubmit = () => {
        post(route("tag.store"), {
            preserveScroll: true,
            onSuccess: () => {
                handleCerrarModal();
            },
            onError: () => {},
        });
    };

    const handleDelete = (uid, anacod, ananam) => {
        setData({ uid, anacod, ananam });
        setConfirmingDeletion(true);
    };

    const deleteTag = () => {
        destroy(route("tag.delete"), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingDeletion(false);
            },
            onError: () => {},
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between w-full gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Tags NFC
                    </h2>
                    <button
                        onClick={() => handleClickCrear()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium text-sm"
                    >
                        <HiPlus className="w-4 h-4" />
                        Crear nuevo
                    </button>
                </div>
            }
        >
            <div className="sticky top-16 z-10 bg-white border-b shadow-sm">
                <div className="flex flex-wrap items-center gap-3 px-6 py-3">
                    <button
                        onClick={() => setTabActiva("sin")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            tabActiva === "sin"
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <HiExclamationCircle className="w-4 h-4" />
                        Sin tag
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                                tabActiva === "sin"
                                    ? "bg-white/20 text-white"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {totalSinTag}
                        </span>
                    </button>

                    <button
                        onClick={() => setTabActiva("con")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                            tabActiva === "con"
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <HiCheckCircle className="w-4 h-4" />
                        Con tag
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                                tabActiva === "con"
                                    ? "bg-white/20 text-white"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {totalConTag}
                        </span>
                    </button>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-36 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                    style={{ width: `${cobertura}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                {cobertura}%
                            </span>
                            <span className="text-xs text-gray-500">cobertura</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4">
                <div className="relative max-w-md">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar empleado o usuario..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                    />
                </div>
            </div>

            <div className="px-6 pb-6">
                {tabActiva === "sin" && (
                    <>
                        {sinTagFiltrados.length > 0 ? (
                            <DataTable
                                data={sinTagFiltrados}
                                columns={columnasSinTag}
                                fixedHeader
                                highlightOnHover
                                customStyles={{
                                    headRow: {
                                        style: {
                                            backgroundColor: "#fef2f2",
                                            color: "#991b1b",
                                            fontWeight: 600,
                                        },
                                    },
                                }}
                            />
                        ) : query ? (
                            <EmptyState
                                icon={HiSearch}
                                title="Sin coincidencias"
                                description={`No se encontraron empleados que coincidan con "${query}"`}
                                color="gray"
                            />
                        ) : (
                            <EmptyState
                                icon={HiCheckCircle}
                                title="Todos tienen tag"
                                description="No hay empleados sin tag NFC asignado"
                                color="green"
                            />
                        )}
                    </>
                )}

                {tabActiva === "con" && (
                    <>
                        {conTagFiltrados.length > 0 ? (
                            <DataTable
                                data={conTagFiltrados}
                                columns={columnasConTag}
                                fixedHeader
                                highlightOnHover
                                customStyles={{
                                    headRow: {
                                        style: {
                                            backgroundColor: "#f0fdf4",
                                            color: "#166534",
                                            fontWeight: 600,
                                        },
                                    },
                                }}
                            />
                        ) : query ? (
                            <EmptyState
                                icon={HiSearch}
                                title="Sin coincidencias"
                                description={`No se encontraron tags que coincidan con "${query}"`}
                                color="gray"
                            />
                        ) : (
                            <EmptyState
                                icon={HiTag}
                                title="Sin tags asignados"
                                description="Aún no hay empleados con tag NFC"
                                color="gray"
                            />
                        )}
                    </>
                )}
            </div>

            <Modal show={showModal} maxWidth="lg" closeable onClose={handleCerrarModal}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            {esEdicion ? (
                                <>
                                    <HiPencil className="text-blue-500" />
                                    Editar tag
                                </>
                            ) : (
                                <>
                                    <HiPlus className="text-green-500" />
                                    Asignar tag
                                </>
                            )}
                        </h3>
                        <button
                            onClick={handleCerrarModal}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>

                    {data.anacod && data.ananam && (
                        <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                            <HiUserCircle className="w-12 h-12 text-blue-500" />
                            <div>
                                <p className="font-medium text-gray-800">
                                    {data.ananam}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Usuario: {data.anacod}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Usuario (anacod)" />
                            <TextInput
                                value={data.anacod}
                                placeholder="Ej: JP001"
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        anacod: e.target.value
                                            .toUpperCase()
                                            .trim(),
                                    })
                                }
                                disabled={disableAnacod}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Código del empleado en el sistema SAN
                            </p>
                        </div>

                        <div>
                            <InputLabel value="UID del tag NFC" />
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
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Pasa el tag por el lector NFC para obtener el UID
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
                        <button
                            onClick={handleCerrarModal}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                        >
                            {esEdicion ? "Guardar cambios" : "Asignar tag"}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                show={confirmDeletion}
                maxWidth="md"
                closeable
                onClose={() => setConfirmingDeletion(false)}
            >
                <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <HiExclamationCircle className="w-8 h-8 text-red-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Eliminar tag
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4 my-4 text-left">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Empleado:</span>
                            <span className="font-medium text-gray-800">
                                {data.ananam || "—"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Usuario:</span>
                            <span className="font-mono text-gray-800">
                                {data.anacod}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">UID:</span>
                            <span className="font-mono text-red-600 font-semibold">
                                {data.uid}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        Esta acción no se puede deshacer. El empleado deberá
                        registrar su tag nuevamente.
                    </p>

                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setConfirmingDeletion(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={deleteTag}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                        >
                            Sí, eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

export default Create;
