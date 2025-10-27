const URL = "http://localhost:5000/api/usuario";

export interface DatosConductor {
    cedula: number,
    nombre: string,
    id_rol: number
}

export async function obtenerConductores(): Promise<DatosConductor[]> {
  const res = await fetch(`${URL}/obtenerConductores`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error al obtener conductores");
  return data as DatosConductor[];
}