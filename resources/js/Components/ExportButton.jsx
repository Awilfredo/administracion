import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
function ExportButton({ data, exportUrl, name }) {

    const buildXlsx = (rows) => {
        const currentDate = new Date();
        const fecha = currentDate.toISOString().split('T')[0];
        const nombre_fecha = fecha;

        const ws = XLSX.utils.json_to_sheet(rows);
        Object.keys(ws).forEach((cell) => {
            if (!cell.startsWith('!')) {
                const cellValue = ws[cell].v;
                if (
                    !isNaN(cellValue) &&
                    cellValue !== '' &&
                    cellValue !== null
                ) {
                    ws[cell].t = 'n';
                    ws[cell].v = Number(cellValue);
                }
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        XLSX.writeFile(wb, `${name} ${nombre_fecha}.xlsx`);
    };

    const handleExportExel = async () => {
        try {
            let rows;
            if (exportUrl) {
                Swal.fire({
                    title: 'Generando reporte',
                    text: 'Obteniendo datos del servidor...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });
                const resp = await fetch(exportUrl, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!resp.ok) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `No se pudo obtener la data (HTTP ${resp.status})`,
                        confirmButtonText: 'Aceptar',
                    });
                    return;
                }
                const json = await resp.json();
                rows = json.data ?? [];
            } else {
                rows = data;
            }

            if (!rows || rows.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin datos',
                    text: 'No hay datos para exportar con los filtros actuales',
                    confirmButtonText: 'Aceptar',
                });
                return;
            }
            buildXlsx(rows);
            Swal.fire({
                icon: 'success',
                title: 'Reporte generado',
                text: `${rows.length} filas exportadas`,
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.message ?? 'Error inesperado al exportar',
                confirmButtonText: 'Aceptar',
            });
        }
    };

    return (
        <div className="flex w-full justify-end sm:w-fit">
            <button
                type="button"
                onClick={handleExportExel}
                className="flex items-center rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-3 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-green-800"
            >
                <svg
                    className="mr-2 h-6 w-6"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M29.121 8.502v-3.749h-8.435v3.749zM29.121 15.063v-4.686h-8.435v4.686zM29.121 21.623v-4.686h-8.435v4.686zM29.121 27.247v-3.749h-8.435v3.749zM18.812 8.502v-3.749h-8.435v3.749zM18.812 15.063v-4.686h-2.812v4.686zM18.812 21.623v-4.686h-2.812v4.686zM18.812 27.247v-3.749h-8.435v3.749zM8.502 17.6l1.774 3.324h2.674l-2.974-4.836 2.924-4.749h-2.574l-1.625 2.999-0.062 0.1-0.050 0.112-0.8-1.6-0.825-1.612h-2.724l2.837 4.774-3.099 4.811h2.699zM29.746 2.879c0.005-0 0.010-0 0.015-0 0.339 0 0.645 0.144 0.859 0.374l0.001 0.001c0.231 0.215 0.375 0.52 0.375 0.859 0 0.005-0 0.011-0 0.016v-0.001 23.743c-0.017 0.683-0.567 1.232-1.248 1.25l-0.002 0h-19.994c-0.683-0.017-1.232-0.567-1.25-1.248l-0-0.002v-4.374h-6.248c-0.005 0-0.010 0-0.015 0-0.339 0-0.645 0.144-0.859 0.374l-0.001-0.001c-0.231 0.215-0.375 0.52-0.375 0.859 0 0.005 0 0.011 0 0.016v-0.001-12.496c-0-0.005-0-0.010-0-0.015 0-0.339 0.144-0.645 0.374-0.859l0.001-0.001c0.211-0.231 0.513-0.375 0.848-0.375 0.009 0 0.019 0 0.028 0l-0.001-0h6.248v-4.374c-0-0.005-0-0.010-0-0.015 0-0.339 0.144-0.645 0.374-0.859l0.001-0.001c0.215-0.231 0.52-0.375 0.859-0.375 0.005 0 0.011 0 0.016 0h-0.001z" />
                </svg>
                Exportar
            </button>
        </div>
    );
}

export default ExportButton;
