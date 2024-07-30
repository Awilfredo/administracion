import generator from "generate-password-browser";
export const CrearEmpleado = (e) => {
    const generatePassword = () => {
        const password = generator.generate({
            length: 8,
            numbers: true,
            symbols: false,
            uppercase: true,
            lowercase: true,
        });
        console.log(password);
        return password;
    };

    function makeAnacod({ nombres, apellidos, anacods }) {
        console.log(`makeAnacod`);
        try {
            if (
                nombres.length > 0 &&
                apellidos.length > 0 &&
                anacods.length > 0
            ) {
                let arrNombres = nombres.split(" ");
                let arrApellidos = apellidos.split(" ");

                let tryFirst = arrNombres[0].charAt(0) + arrApellidos[0];
                if (!anacods.includes(tryFirst)) {
                    console.log(`Primer anacod sugerido`);
                    return tryFirst;
                }

                let trySecond =
                    arrNombres[0].charAt(0) +
                    arrNombres[1].charAt(0) +
                    arrApellidos[0];
                if (!anacods.includes(trySecond)) {
                    console.log(`Segundo anacod sugerido`);
                    return trySecond;
                }

                console.log(`arrApellidos.length `, arrApellidos.length);
                console.log(`arrNombres.length `, arrNombres.length);
                if (arrApellidos.length <= 1) return;
                if (arrNombres.length <= 1) return;

                let tryTercero = arrNombres[1].charAt(0) + arrApellidos[1];
                console.log(tryTercero);
                if (!anacods.includes(tryTercero)) {
                    console.log(`Tercero anacod sugerido`);
                    return tryTercero;
                }

                let tryCuarto =
                    arrNombres[0].charAt(0) +
                    arrNombres[1].charAt(0) +
                    arrApellidos[1];
                if (!anacods.includes(tryCuarto)) {
                    console.log(`Cuarto anacod sugerido`);
                    return tryCuarto;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return "";
    }

    return {generatePassword, makeAnacod};
};
