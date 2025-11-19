// const URL = "http://localhost:5000/api/solicitud";
const URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/solicitud`;


export type TipoLabor = "mantenimiento" | "reparacion" | "reunion" | "inspeccion_tecnica" | "emergencia" | "gestion_administrativa" | "otro";
export type Prioridad = "baja" | "media" | "alta";
export type Estado = "pendiente" | "asignada" | "aceptada" | "en_progreso" | "finalizada" | "cancelada" | "en_reasignacion";
export type TipoIncidente = "accidente" | "falla_mecanica" | "retraso" | "otro"
export type Gravedad = "baja" | "media" | "alta";
export interface Solicitud {
    id_solicitud?: number
    cedula_solicitante?: number
    telefono?: string
    placa_vehiculo?: string | null
    cedula_conductor?: number | null
    fecha?: string
    hora?: string
    origen?: string
    destino?: string
    estado?: Estado
    tipo_labor?: TipoLabor
    prioridad?: Prioridad
    cantidad_pasajeros?: number
    equipo_o_carga?: string
    observaciones?: string
    hora_inicio_transporte?: string | null
    hora_fin_transporte?: string | null
    hora_total?: number | null
    tipo_incidente?: TipoIncidente,
    gravedad?: Gravedad,
    descripcion_incidente?: string | null,
    puede_continuar?: boolean | null,
    usuario_solicitud_cedula_solicitanteTousuario?: UsuarioSolicitudCedulaSolicitanteTousuario
    usuario_solicitud_cedula_conductorTousuario?: UsuarioSolicitudCedulaConductorTousuario | null
    vehiculo?: Vehiculo | null
}

export interface UsuarioSolicitudCedulaSolicitanteTousuario {
    nombre: string
    telefono: number
    correo: string
}

export interface UsuarioSolicitudCedulaConductorTousuario {
    nombre: string
    telefono: number
    correo: string
}

export interface Vehiculo {
    tipo_vehiculo: string
}

export async function registrarSolicitud(datos: Solicitud) {
    const res = await fetch(`${URL}/crearSolicitud`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || "Error al crear la solicitud");
    }
    return data;

}

export async function obtenerSolicitudes(): Promise<Solicitud[]> {
    const res = await fetch(`${URL}/obtenerSolicitudes`, {
        credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener Solicitudes");
    return data as Solicitud[];
}

export async function editarSolicitudPorId(id_solicitud: string, payload: Solicitud): Promise<Solicitud> {
    const res = await fetch(`${URL}/editarSolicitud/${id_solicitud}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al editar la solicitud");
    return data as Solicitud;
}


export async function obtenerMisSolicitudesConductor(): Promise<Solicitud[]> {
    const res = await fetch(`${URL}/misSolicitudes`,
        {
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
        });
    if (res.status === 401 || res.status === 403) throw new Error("NO_AUTORIZADO");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener solicitudes");
    return data;
}

export async function obtenerMisSolicitudesSolicitante(): Promise<Solicitud[]> {
    const res = await fetch(`${URL}/misSolicitudesSolicitante`,
        { credentials: "include" });
    if (res.status === 401 || res.status === 403) throw new Error("NO_AUTORIZADO");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al obtener solicitudes");
    return data;
}
