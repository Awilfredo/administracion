import TextInput from "./TextInput";

function BuscarFecha({ max, value, onClick, onChange }) {
    return (
        <div>
            <TextInput type="date" max={max} value={value} onChange={onChange}></TextInput>
            <button className="mx-5 w-20 h-10 bg-blue-500 hover:bg-blue-700 text-white rounded-xl" onClick={onClick}>Buscar</button>
        </div>
    );
}

export default BuscarFecha;
