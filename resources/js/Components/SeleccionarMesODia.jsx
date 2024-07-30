function SeleccionarMesODia({ busqueda, setBusqueda }) {
    return (
        <div className="m-10">
            <div className="flex items-center mb-5">
                <p className="text-gray-800">Buscar por :</p>
                <div className="mx-5">
                    <label htmlFor="mes">Mes</label>
                    <input
                        type="radio"
                        name="busqueda"
                        id="mes"
                        className="mx-2"
                        checked={busqueda === "mes"}
                        value="mes"
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="dia">Dia</label>
                    <input
                        type="radio"
                        name="busqueda"
                        id="dia"
                        value="dia"
                        className="mx-2"
                        checked={busqueda === "dia"}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default SeleccionarMesODia;
