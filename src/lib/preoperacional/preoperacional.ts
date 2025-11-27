const URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/inspeccion`;

export type Estado = "bueno" | "regular" | "malo";
export type Combustible = "lleno" | "medio" | "bajo";

export interface Usuario {
    cedula: number,
    nombre: string,
}

export interface Vehiculo {
    placa: string,
    tipo_vehiculo: string,
    estado: string
}

export interface Preoperacional {
    id_inspeccion: number,
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
    vehiculo?: Vehiculo
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
        throw new Error(data?.error || "Error al crear el registro preoperacional")
    }
    return data;
}

export async function obtenerRegistros(): Promise<Preoperacional[]> {
    const res = await fetch(`${URL}/obtenerRegistros`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener vehiculos");
    return data as Preoperacional[];
}

export async function obtenerRegistroPreoperacional(id: string): Promise<Preoperacional[]> {
    const res = await fetch(`${URL}/obtenerRegistroInspeccion/${id}`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener vehiculo");
    return data as Preoperacional[];
}

export async function actualizarEstadoInspeccion(id_inspeccion: string) {
    const res = await fetch(`${URL}/actualizar-estado/${id_inspeccion}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || "Error al actualizar el estado de la inspección");
    }
    return data;
}
