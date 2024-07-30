import { ManejoFechas } from "@/Helpers/ManejoFechas";

function BuscarMes({ onClick, mes, setMes, setAnio, anio }) {
    const {mesActual, meses} = ManejoFechas();
    return (
        <div>
            <select onChange={(e) => setAnio(e.target.value)}>
                <option value="2024" selected={anio==='2024'}>2024</option>
                <option value="2025" selected={anio==='2025'}>2025</option>
                <option value="2026" selected={anio==='2026'}>2026</option>
                <option value="2027" selected={anio==='2027'}>2027</option>
                <option value="2028" selected={anio==='2028'}>2028</option>
            </select>
            <select onChange={(e) => setMes(e.target.value)} value={mes}>
                {meses.map((mes, index) => (
                    <option
                        key={index}
                        value={mes.value}
                        selected={mes.value == mesActual() ? true : false}
                    >
                        {mes.name}
                    </option>
                ))}
            </select>
            <button className="bg-blue-500 text-white rounded-xl px-5 py-2 mx-5 hover:bg-blue-700" onClick={onClick}>Buscar</button>
        </div>
    );
}

export default BuscarMes;
