const URL = "http://localhost:5000/api/inspeccion";

export type Estado = "bueno" | "regular" | "malo";
export type Combustible = "lleno" | "medio" | "bajo";

export interface Usuario {
    cedula: number,
    nombre: string,
}

export interface Preoperacional {
    placa_vehiculo: string
    cedula_conductor: number
    fecha: string
    descanso_adecuando: boolean
    consumo_alcohol: boolean
    medicamentos_que_afecten_conduccion: boolean
    condiciones_fisicas_mentales: boolean
    soat_vigente: boolean
    tecnico_mecanica: boolean
    estado_llantas: Estado
    estado_luces: Estado
    estado_frenos: Estado
    nivel_combustible: Combustible
    usuario?: Usuario
    observaciones: string
}

export async function registrarPreoperacional(datos: Preoperacional) {
    const res = await fetch(`${URL}/registro`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error (data?.error || "Error al crear el registro preoperacional")
    }
    return data;
}

