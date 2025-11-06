const URL = "http://localhost:5000/api/vehiculo";

export type EstadoVehiculo = "disponible" | "no_disponible" | "asignado";
export type TipoConductor = "habitual" | "eventual";
export type TipoVehiculo = "carrotanque" | "camion" | "camioneta" | "retroexcavadora";

export interface Conductor {
    cedula: number,
    nombre: string,
}
export interface ConductorAsignado {
    cedula_conductor: number;
    tipo_conductor: TipoConductor;
    usuario?: Conductor;
}

export interface InspeccionPreoperacional {
  placa_vehiculo: string
  cedula_conductor: number
  fecha: string
  usuario: Conductor
}
export interface Vehiculo {
    placa: string;
    tipo_vehiculo?: TipoVehiculo;
    capacidad?: number | null;
    odometro?: number | null;
    estado?: EstadoVehiculo;
    fecha_ultimo_mantenimiento?: string | null;
    conductores: ConductorAsignado[];
    inspeccion_preoperacional?: InspeccionPreoperacional[]
}

export async function crearVehiculo(datos: Vehiculo) {
    const res = await fetch(`${URL}/crearVehiculo`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || "Error al crear el vehiculo");
    }
    return data;
}


export async function obtenerVehiculos(): Promise<Vehiculo[]> {
    const res = await fetch(`${URL}/obtenerVehiculos`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener vehiculos");
    return data as Vehiculo[];
}

export async function obtenerVehiculoPorRegistroInspeccion(): Promise<Vehiculo[]> {
    const res = await fetch(`${URL}/obtenerVehiculosInspeccion`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener vehiculos");
    return data as Vehiculo[];
}


export async function obtenerVehiculoPorPlaca(placa: string): Promise<Vehiculo[]> {
    const res = await fetch(`${URL}/obtenerVehiculo/${placa}`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener vehiculo");
    return data as Vehiculo[];
}


export async function editarVehiculoPorPlaca(placa: string, payload: Vehiculo): Promise<Vehiculo> {
    const res = await fetch(`${URL}/editarVehiculo/${placa}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al editar el vehículo");
    return data as Vehiculo;
}

export const actualizarActividad = async (id: string, datos: any) => {
    const res = await fetch(`${URL}/${id}`, {
        method: "PUT",
        body: datos,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al actualizar la actividad");
    return data;
};