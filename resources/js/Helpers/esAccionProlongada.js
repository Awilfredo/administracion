export function esAccionProlongada(data) {
    if (!data || !data.fecha_inicio) return false;
    const fin = data.fecha_fin || data.fecha_inicio;
    if (fin !== data.fecha_inicio) return true;
    if (!data.hora_inicio || !data.hora_fin) return true;
    const [h1, m1] = data.hora_inicio.split(":").map(Number);
    const [h2, m2] = data.hora_fin.split(":").map(Number);
    if (Number.isNaN(h1) || Number.isNaN(h2)) return false;
    const minutes = h2 * 60 + m2 - (h1 * 60 + m1);
    return minutes > 360 || minutes <= 0;
}
