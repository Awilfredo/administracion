import Swal from "sweetalert2";

export function showAprobadorSummary(result) {
    if (typeof window === "undefined") return Promise.resolve();
    const asignCount = result?.asignaciones?.length || 0;
    const conflictCount = result?.conflictos?.length || 0;
    const extCount = result?.extensiones?.length || 0;

    if (asignCount === 0 && extCount === 0 && conflictCount === 0) {
        return Promise.resolve();
    }

    const lineas = [];
    if (asignCount > 0) {
        lineas.push(`<span class="text-green-700">✅ ${asignCount} cc/cuenta(s) asignada(s) al aprobador temporal.</span>`);
    }
    if (extCount > 0) {
        lineas.push(`<span class="text-blue-700">⏰ ${extCount} cc/cuenta(s) con ventana extendida.</span>`);
    }
    if (conflictCount > 0) {
        lineas.push(`<span class="text-amber-700">⚠ ${conflictCount} cc/cuenta(s) omitida(s) (ya cubiertas).</span>`);
    }

    const titulo =
        conflictCount > 0 && asignCount === 0 && extCount === 0
            ? "Sin cambios necesarios"
            : conflictCount > 0
            ? "Asignación parcial"
            : "Aprobador temporal asignado";

    return Swal.fire({
        icon: conflictCount > 0 && asignCount === 0 ? "info" : "success",
        title: titulo,
        html: lineas.join("<br>"),
        confirmButtonText: "Continuar",
    });
}
