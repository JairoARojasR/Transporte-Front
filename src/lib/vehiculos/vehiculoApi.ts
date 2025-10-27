const URL = "http://localhost:5000/api/vehiculo";

export type EstadoVehiculo = "disponible" | "no_disponible" | "asignado";
export type TipoConductor = "habitual" | "eventual"; 
export type TipoVehiculo = "carrotanque" | "camion" | "camioneta" | "retroexcavadora"; 
export interface ConductorAsignado {
    cedula_conductor: number;
    tipo_conductor: TipoConductor;
}
export interface CrearVehiculo {
    placa: string;
    tipo_vehiculo?: TipoVehiculo;
    capacidad?: number | null;
    odometro?: number | null;
    estado?: EstadoVehiculo;
    fecha_ultimo_mantenimiento?: string | null;
    conductores: ConductorAsignado[];
}

export async function crearVehiculo(datos: CrearVehiculo){
    const res = await fetch(`${URL}/crearVehiculo` , {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });

    const data = await res.json().catch(() => ({}));
    
    if(!res.ok){
        throw new Error(data?.error || "Error al crear el vehiculo");
    }
    return data;
}

