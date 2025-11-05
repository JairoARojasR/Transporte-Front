const URL = "http://localhost:5000/api/usuario";

export interface DatosUsuario {
    cedula: number,
    nombre: string,
    telefono?: number,
    id_rol: number,
}

export async function obtenerConductores(): Promise<DatosUsuario[]> {
  const res = await fetch(`${URL}/obtenerConductores`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error al obtener conductores");
  return data as DatosUsuario[];
}

export async function obtenerEmpleados(): Promise<DatosUsuario[]> {
  const res = await fetch(`${URL}/obtenerUsuarios`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error al obtener empleados");
  return data as DatosUsuario[];
}