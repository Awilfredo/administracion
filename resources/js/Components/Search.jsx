import { useEffect, useState } from "react";

function Search({
    placeholder = "Buscar",
    datos,
    keys,
    setResultados,
    filters = null,
}) {
    /* Este componente recive un array de objetos, el set para almacenar resultados y las llaves que se evaluaran en el objeto */
    const [value, setValue] = useState("");
    const [showFilter, setshowFilter] = useState(false);

    const handleChange = (text) => {
        setValue(text);
        if (text) {
            const result = [];
            datos.map((element) => {
                let match = false;
                keys.map((key) => {
                    if (
                        element[key] &&
                        element[key].toUpperCase().includes(text.toUpperCase())
                    )
                        match = true;
                });

                if (match && aplicarFiltros(element)) {
                    result.push(element);
                }
            });
            setResultados(result);
        } else {
            const result = [];
            datos.map((element) => {
                if (aplicarFiltros(element)) {
                    result.push(element);
                }
            });
            setResultados(result);
        }
    };

    const aplicarFiltros = (element) => {
        if (filtros) {
            let filtro_results = [];
            filtros.map((f) => {
                if (f.checked) {
                    if (element[f.key] === f.value) {
                        console.log(element[f.key]);
                        filtro_results.push(true);
                    } else {
                        filtro_results.push(false);
                    }
                }
            });

            for (let i = 0; i < filtro_results.length; i++) {
                if (filtro_results[i] == false) {
                    return false;
                }
            }
            return true;
        } else {
            return true;
        }
    };

    const [filtros, setFiltros] = useState(filters);
    const handleCheck = (e, filtro) => {
        const index = filtros.findIndex((f) => f.id === filtro.id);
        if (index !== -1) {
            const nuevosFiltros = [...filtros];
            const filtroModificado = { ...nuevosFiltros[index] };
            filtroModificado.checked = !filtro.checked;
            nuevosFiltros[index] = filtroModificado;
            setFiltros(nuevosFiltros);
        }
    };

    useEffect(() => {
        handleChange(value);
    }, [filtros]);

    return (
        <div className="h-10 w-full mt-5 flex justify-center">
            <div className="flex justify-between w-1/3">
                <div
                    className="items-center max-w-md bg-white"
                    x-data="{ search: '' }"
                >
                    <input
                        type="search"
                        className="w-full px-4 text-gray-800 rounded focus:outline-none h-10"
                        value={value}
                        placeholder={placeholder}
                        x-model="search"
                        onChange={(e) => handleChange(e.target.value)}
                    />
                </div>

                {filters && (
                    <div className="relative w-1/3">
                        <button
                            class="hover:bg-primary-800 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-center inline-flex items-center dark:bg-primary-600 dark:focus:ring-primary-800 h-10 px-10"
                            type="button"
                            onClick={() => setshowFilter(!showFilter)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M9 5a1 1 0 1 0 0 2a1 1 0 0 0 0-2zM6.17 5a3.001 3.001 0 0 1 5.66 0H19a1 1 0 1 1 0 2h-7.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 0 1 0-2h1.17zM15 11a1 1 0 1 0 0 2a1 1 0 0 0 0-2zm-2.83 0a3.001 3.001 0 0 1 5.66 0H19a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 1 1 0-2h7.17zM9 17a1 1 0 1 0 0 2a1 1 0 0 0 0-2zm-2.83 0a3.001 3.001 0 0 1 5.66 0H19a1 1 0 1 1 0 2h-7.17a3.001 3.001 0 0 1-5.66 0H5a1 1 0 1 1 0-2h1.17z"
                                />
                            </svg>
                            {!showFilter && (
                                <svg
                                    class="w-4 h-4 ml-2"
                                    aria-hidden="true"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            )}
                            {showFilter && (
                                <svg
                                    class="w-4 h-4 ml-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        d="m2 15.999l10.173-9.824l9.824 10.173"
                                    />
                                </svg>
                            )}
                        </button>
                        {showFilter ? (
                            <div class="z-index-10 w-56 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
                                <h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                                    Filtros
                                </h6>
                                <ul
                                    class="space-y-2 text-sm"
                                    aria-labelledby="dropdownDefault"
                                >
                                    {filtros.map((filtro, index) => (
                                        <li
                                            className="flex items-center"
                                            key={index}
                                        >
                                            {" "}
                                            {Array.isArray(filtro.value) ? (
                                                <div>
                                                    <div class="max-w-lg mx-auto">
                                                        <p className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                            {filtro.name}
                                                        </p>
                                                        <fieldset className="mb-5">
                                                            <legend className="sr-only">
                                                                Countries
                                                            </legend>

                                                            {filtro.value.map(
                                                                (e, index) => (
                                                                    <div class="flex items-center mb-4">
                                                                        <input
                                                                            id={
                                                                                e
                                                                            }
                                                                            type="radio"
                                                                            name={
                                                                                filtro.key
                                                                            }
                                                                            value={
                                                                                e
                                                                            }
                                                                            className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                                                                            aria-labelledby="country-option-3"
                                                                            aria-describedby="country-option-3"
                                                                        />
                                                                        <label
                                                                            htmlFor={
                                                                                e
                                                                            }
                                                                            className="text-sm font-medium text-gray-900 ml-2 block"
                                                                        >
                                                                            {e}
                                                                        </label>
                                                                    </div>
                                                                )
                                                            )}
                                                        </fieldset>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input
                                                        id={filtro.key + index}
                                                        type="checkbox"
                                                        class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                                        checked={filtro.checked}
                                                        onChange={(e) =>
                                                            handleCheck(
                                                                e,
                                                                filtro
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        for={filtro.key + index}
                                                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                                                    >
                                                        {filtro.name}
                                                    </label>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Search;
