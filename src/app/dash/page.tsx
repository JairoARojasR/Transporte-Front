'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/login/loginApi";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const r = await cerrarSesion(); // hace POST y borra la cookie en backend
      setMsg(r.mensaje || "Sesión cerrada");
      // Redirige al login, por ejemplo después de 1s:
      setTimeout(() => router.push("/login"), 800);
    } catch (e: any) {
      setErr(e?.message || "Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow">
        <h1 className="text-xl font-semibold mb-4">Cerrar sesión</h1>

        {msg && <div className="mb-3 rounded-md bg-green-50 border border-green-200 p-3 text-green-700 text-sm">{msg}</div>}
        {err && <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{err}</div>}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Cerrando..." : "Cerrar sesión"}
        </button>

        <p className="mt-3 text-xs text-gray-500">
          Esto hará una solicitud al backend para limpiar la cookie <code>access_token</code>.
        </p>
      </div>
    </main>
  );
}
