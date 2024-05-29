import { useState } from "react";
import GenericRow from "./GenericRow";

function GenericTable({ data, nombre, hide = false }) {
    const keys = Object.keys(data[0]);
    console.log(keys);
    const [visible, setvisible] = useState(hide);
    const handleShow = () => {
        setvisible(!visible);
    };
    return (
        <div>
            <div className="flex justify-between py-5 my-5 px-10 bg-blue-200 rounded-xl" onClick={handleShow}>
                <p className="text-lg text-gray-800">{nombre}</p>
                <button className="text-gray-600">
                    {!visible ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 717 614"
                        >
                            <path
                                fill="currentColor"
                                d="m356 357l246-246l115 119l-355 354L0 222l112-113z"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 717 614"
                        >
                            <path
                                fill="currentColor"
                                d="M360 337L115 582L0 464l354-355l363 363l-112 112z"
                            />
                        </svg>
                    )}
                </button>
            </div>
            <div className="w-full max-w-5xl">
                {visible ? (
                    <table className="w-full">
                        <thead className="bg-gray-500 rounded-xl">
                            <tr className="text-white">
                                {keys.map((key, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        class="text-lg font-medium px-6 py-4 text-left"
                                    >
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((element, index) => (
                                <GenericRow
                                    data={element}
                                    key={index}
                                ></GenericRow>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}

export default GenericTable;
