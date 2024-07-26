export const ExportCSV = (e) => {


    function downloadCSV(array, keys, name='export.csv') {
        const link = document.createElement("a");
        let csv = convertArrayOfObjectsToCSV(array, keys);
        if (csv == null) return;

        const filename = name;

        if (!csv.match(/^data:text\/csv/i)) {
            csv = `data:text/csv;charset=utf-8,${csv}`;
        }

        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", filename);
        link.click();
    }

    function convertArrayOfObjectsToCSV(array, keys) {
        let result;

        const columnDelimiter = ",";
        const lineDelimiter = "\n";
        //const keys = Object.keys(data[0]);

        result = "";
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        array.forEach((item) => {
            let ctr = 0;
            keys.forEach((key) => {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];

                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }

    function convertArrayOfObjectsToCSV(array, keys) {
        let result;

        const columnDelimiter = ",";
        const lineDelimiter = "\n";
        //const keys = Object.keys(data[0]);

        result = "";
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        array.forEach((item) => {
            let ctr = 0;
            keys.forEach((key) => {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];

                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }

    const Export = ({ onExport }) => (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white px-5 rounded-md text-sm flex h-10 items-center"
            onClick={(e) => onExport(e.target.value)}
        >
            <span className="mr-2">Exportar</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 16 16"
            >
                <path
                    fill="currentColor"
                    d="m9 9.114l1.85-1.943a.52.52 0 0 1 .77 0c.214.228.214.6 0 .829l-1.95 2.05a1.552 1.552 0 0 1-2.31 0L5.41 8a.617.617 0 0 1 0-.829a.52.52 0 0 1 .77 0L8 9.082V.556C8 .249 8.224 0 8.5 0s.5.249.5.556z"
                />
                <path
                    fill="currentColor"
                    d="M16 13.006V10h-1v3.006a.995.995 0 0 1-.994.994H3.01a.995.995 0 0 1-.994-.994V10h-1v3.006c0 1.1.892 1.994 1.994 1.994h10.996c1.1 0 1.994-.893 1.994-1.994"
                />
            </svg>
        </button>
    );

    return {
        downloadCSV,
        convertArrayOfObjectsToCSV,
        convertArrayOfObjectsToCSV, 
        Export
    }
};
