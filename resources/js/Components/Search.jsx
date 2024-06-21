import { useState } from "react";

function Search({ placeholder = "Buscar", datos, keys, setResultados }) {
    /* Este componente recive un array de objetos, el set para almacenar resultados y las llaves que se evaluaran en el objeto */
    const [value, setValue] = useState("");
    const handleChange = (e) => {
        setValue(e.target.value);

        if (e.target.value) {
            const result = [];
            datos.map((element) => {
                let match = false;
                keys.map((key) => {
                    if (
                        element[key] &&
                        element[key]
                            .toUpperCase()
                            .includes(e.target.value.toUpperCase())
                    )
                        match = true;
                });

                if (match) {
                    result.push(element);
                }
            });
            setResultados(result);
        } else {
            setResultados(datos);
        }
    };

    return (
        <div className="h-12 w-full mt-5">
            <div
                className="flex items-center max-w-md mx-auto bg-white"
                x-data="{ search: '' }"
            >
                <div className="w-full">
                    <input
                        type="search"
                        className="w-full px-4 text-gray-800 rounded focus:outline-none h-10"
                        value={value}
                        placeholder={placeholder}
                        x-model="search"
                        onChange={(e) => handleChange(e)}
                    />
                </div>
                <div></div>
            </div>
        </div>
    );
}

export default Search;
