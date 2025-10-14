import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
function ExportButton({ data, name }) {

    const handleExportExel = () => {
        if (data.length) {
            const currentDate = new Date();
            const fecha = {
                fecha: currentDate.toISOString().split('T')[0],
                fecha_final: currentDate.toISOString().split('T')[0],
            };
            // Crear un libro de trabajo (workbook)
            const ws = XLSX.utils.json_to_sheet(data);

            // Convertir los valores numéricos en celdas numéricas
            Object.keys(ws).forEach((cell) => {
                if (!cell.startsWith('!')) {
                    const cellValue = ws[cell].v;
                    if (
                        !isNaN(cellValue) &&
                        cellValue !== '' &&
                        cellValue !== null
                    ) {
                        ws[cell].t = 'n'; // Establecer tipo numérico
                        ws[cell].v = Number(cellValue); // Convertir a número
                    }
                }
            });

            const wb = XLSX.utils.book_new();
            const nombre_fecha =
                fecha.fecha === fecha.fecha_final
                    ? fecha.fecha
                    : `${fecha.fecha} a ${fecha.fecha_final}`;

            XLSX.utils.book_append_sheet(wb, ws, `Datos`);
            // Exportar el archivo Excel
            XLSX.writeFile(wb, `${name} ${nombre_fecha}.xlsx`);
        } else {
            Swal.fire({
                title: 'Error',
                text: 'No hay datos para exportar',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
    };

    return (
        <div className="flex w-full justify-end sm:w-fit">
            <button
                onClick={handleExportExel}
                className="flex items-center rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-3 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-green-800"
            >
                <svg
                    className="mr-2 h-6 w-6"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M29.121 8.502v-3.749h-8.435v3.749zM29.121 15.063v-4.686h-8.435v4.686zM29.121 21.623v-4.686h-8.435v4.686zM29.121 27.247v-3.749h-8.435v3.749zM18.812 8.502v-3.749h-8.435v3.749zM18.812 15.063v-4.686h-2.812v4.686zM18.812 21.623v-4.686h-2.812v4.686zM18.812 27.247v-3.749h-8.435v3.749zM8.502 17.6l1.774 3.324h2.674l-2.974-4.836 2.924-4.749h-2.574l-1.625 2.999-0.062 0.1-0.050 0.112-0.8-1.6-0.825-1.612h-2.724l2.837 4.774-3.099 4.811h2.699zM29.746 2.879c0.005-0 0.010-0 0.015-0 0.339 0 0.645 0.144 0.859 0.374l0.001 0.001c0.231 0.215 0.375 0.52 0.375 0.859 0 0.005-0 0.011-0 0.016v-0.001 23.743c-0.017 0.683-0.567 1.232-1.248 1.25l-0.002 0h-19.994c-0.683-0.017-1.232-0.567-1.25-1.248l-0-0.002v-4.374h-6.248c-0.005 0-0.010 0-0.015 0-0.339 0-0.645-0.144-0.859-0.374l-0.001-0.001c-0.231-0.215-0.375-0.52-0.375-0.859 0-0.005 0-0.011 0-0.016v0.001-12.496c-0-0.005-0-0.010-0-0.015 0-0.339 0.144-0.645 0.374-0.859l0.001-0.001c0.211-0.231 0.513-0.375 0.848-0.375 0.009 0 0.019 0 0.028 0l-0.001-0h6.248v-4.374c-0-0.005-0-0.010-0-0.015 0-0.339 0.144-0.645 0.374-0.859l0.001-0.001c0.215-0.231 0.52-0.375 0.859-0.375 0.005 0 0.011 0 0.016 0h-0.001z" />
                </svg>
                Exportar
            </button>
        </div>
    );
}

export default ExportButton;
