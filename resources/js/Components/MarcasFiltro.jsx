import { ManejoFechas } from "@/Helpers/ManejoFechas";

function MarcasFiltro({
    preset,
    setPreset,
    fechaIni,
    setFechaIni,
    fechaFin,
    setFechaFin,
    usuario,
    setUsuario,
    onSearch,
    loading = false,
}) {
    const { fechaActual } = ManejoFechas();

    const getFechaIniSemana = () => {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const diffLunes = diaSemana === 0 ? 6 : diaSemana - 1;
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - diffLunes);
        return lunes.toISOString().split("T")[0];
    };

    const getFechaIniMes = () => {
        const hoy = new Date();
        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
    };

    const getFechasMesAnterior = () => {
        const hoy = new Date();
        const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDiaMesAnterior = new Date(primerDiaMesActual);
        ultimoDiaMesAnterior.setDate(ultimoDiaMesAnterior.getDate() - 1);
        const primerDiaMesAnterior = new Date(
            ultimoDiaMesAnterior.getFullYear(),
            ultimoDiaMesAnterior.getMonth(),
            1
        );
        return {
            ini: primerDiaMesAnterior.toISOString().split("T")[0],
            fin: ultimoDiaMesAnterior.toISOString().split("T")[0],
        };
    };

    const handlePreset = (p) => {
        setPreset(p);
        const hoy = fechaActual();
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        const ayerStr = ayer.toISOString().split("T")[0];

        switch (p) {
            case "hoy":
                setFechaIni(hoy);
                setFechaFin(hoy);
                break;
            case "ayer":
                setFechaIni(ayerStr);
                setFechaFin(ayerStr);
                break;
            case "semana":
                setFechaIni(getFechaIniSemana());
                setFechaFin(hoy);
                break;
            case "mes":
                setFechaIni(getFechaIniMes());
                setFechaFin(hoy);
                break;
            case "mes_anterior":
                const { ini, fin } = getFechasMesAnterior();
                setFechaIni(ini);
                setFechaFin(fin);
                break;
        }
    };

    const btnClass = (p) =>
        `px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            preset === p
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`;

    return (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow">
            <div className="flex gap-2">
                <button onClick={() => handlePreset("hoy")} className={btnClass("hoy")} disabled={loading}>
                    Hoy
                </button>
                <button onClick={() => handlePreset("ayer")} className={btnClass("ayer")} disabled={loading}>
                    Ayer
                </button>
                <button onClick={() => handlePreset("semana")} className={btnClass("semana")} disabled={loading}>
                    Semana
                </button>
                <button onClick={() => handlePreset("mes")} className={btnClass("mes")} disabled={loading}>
                    Mes
                </button>
                <button onClick={() => handlePreset("mes_anterior")} className={btnClass("mes_anterior")} disabled={loading}>
                    Mes anterior
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Desde:</span>
                <input
                    type="date"
                    value={fechaIni}
                    max={fechaActual()}
                    onChange={(e) => {
                        setFechaIni(e.target.value);
                        setPreset(null);
                    }}
                    disabled={loading}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-600">Hasta:</span>
                <input
                    type="date"
                    value={fechaFin}
                    max={fechaActual()}
                    min={fechaIni}
                    onChange={(e) => {
                        setFechaFin(e.target.value);
                        setPreset(null);
                    }}
                    disabled={loading}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Filtrar por usuario..."
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.toUpperCase())}
                    disabled={loading}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-48 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            <button
                onClick={onSearch}
                disabled={loading}
                className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Buscar
            </button>
        </div>
    );
}

export default MarcasFiltro;
