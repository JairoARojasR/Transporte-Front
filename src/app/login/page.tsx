'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion, LoginPayload } from "@/lib/login/loginApi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({ correo: "", contrasenia: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const onChange =
    (key: keyof LoginPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);

    // Validación mínima
    const correo = form.correo.trim().toLowerCase();
    if (!correo || !form.contrasenia) {
      setErrMsg("Correo y contraseña son obligatorios");
      return;
    }

    try {
      setLoading(true);
      await iniciarSesion({ correo, contrasenia: form.contrasenia });
      // éxito: el backend setea cookie HttpOnly -> redirige a tu página protegida
      router.push('../dash'); // o "/dashboard", lo que prefieras
    } catch (err: any) {
      setErrMsg(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white shadow rounded-2xl">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Inicio de sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errMsg && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              value={form.correo}
              onChange={onChange("correo")}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.contrasenia}
                onChange={onChange("contrasenia")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          * Se establecerá una cookie segura de sesión si las credenciales son correctas.
        </p>
      </div>
    </main>
  );
}
