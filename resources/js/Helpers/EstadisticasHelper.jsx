import { ManejoFechas } from "./ManejoFechas";

export const EstadisticasHelper = (e) => {

    const sumarDatosPorDia = (data, horasLaborales, empleados) => {
        const fechas = ManejoFechas()
        const datos_sumados = [];
        empleados.forEach((element) => {
            let suma = 0;
            let suma_huella = 0;
            let objetos = data.filter((obj) => obj.anacod === element.anacod);
            objetos.forEach((obj) => {
                let sum = obj.sum ? parseFloat(obj.sum) : 0;
                let sum_huella = obj.sum_huella
                    ? parseFloat(obj.sum_huella)
                    : 0;
                console.log(
                    "valores que trae la huella y nfc",
                    obj.sum,
                    obj.sum_huella
                );
                if (sum > 0 && sum != null) suma += sum;
                if (sum_huella > 0 && sum != sum_huella)
                    suma_huella += sum_huella;
            });
            console.log(suma, suma_huella);

            let porcentaje_nfc = "0 %";
            if (suma > 0) {
                let p_nfc = (1-(horasLaborales - suma/3600)/horasLaborales) * 100;
                if (p_nfc > 100) {
                    porcentaje_nfc = "100%";
                } else {
                    porcentaje_nfc = p_nfc.toFixed(2) + " %";
                }
            }

            let porcentaje_huella = "0 %";
            if (suma_huella > 0) {
                let p_huella =
                    (1 - (horasLaborales - suma_huella / 3600) / horasLaborales) * 100;
                if (p_huella > 100) {
                    porcentaje_huella = "100%";
                } else {
                    porcentaje_huella = p_huella.toFixed(2) + " %";
                }
            }
            datos_sumados.push({
                anacod: element.anacod,
                nombre: element.ananam,
                horas: fechas.obtenerHoras(suma),
                horas_huella: fechas.obtenerHoras(suma_huella),
                suma_nfc: parseFloat(suma) / 3600,
                suma_huella: suma_huella / 3600,
                porcentaje_nfc,
                porcentaje_huella,
            });
        });
        return datos_sumados;
    };

    return {sumarDatosPorDia}
};
