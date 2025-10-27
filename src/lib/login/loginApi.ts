const URL = "http://localhost:5000/api/inicio";

export type LoginPayload = {
  correo: string;
  contrasenia: string;
};


export async function iniciarSesion(datos: LoginPayload) {
  const res = await fetch(`${URL}/login`, {
    method: "POST",
    credentials: "include", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Error al iniciar sesión");
  }
  return data;
}

export async function cerrarSesion() {
  const res = await fetch(`${URL}/logout`, {
    method: "POST",
    credentials: "include", 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error al cerrar sesión");
  return data;
}


export async function verificarSesion() {
  const res = await fetch(`${URL}/me`, {
    method: "GET",
    credentials: "include", 
  });
  const data = await res.json()
  if (!res.ok) throw new Error("No autenticado");
  return data;
}
