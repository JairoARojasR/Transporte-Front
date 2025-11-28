"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { iniciarSesion, LoginPayload } from "@/lib/login/loginApi";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false); 
  const [form, setForm] = useState<LoginPayload>({
    cedula: 0,
    contrasenia: "",
  });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const onChange =
    (key: keyof LoginPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);

    // Validación mínima
    const cedula = form.cedula.toString().trim();
    if (!cedula || !form.contrasenia) {
      setErrMsg("Cédula y contraseña son obligatorios");
      return;
    }

    try {
      setLoading(true);
      await iniciarSesion({ cedula: Number(cedula), contrasenia: form.contrasenia });
      router.push("../dashboard");
    } catch (err: any) {
      setErrMsg(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600">
      {/* contenedor principal */}
      <div className="relative z-10 w-full max-w-xs bg-white rounded-sm shadow-md overflow-hidden">
        <div>
          <br></br>
        </div>

        <div className="w-full bg-[#3870F7] text-white p-2 flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold">Transporte</h1>
        </div>

        <div className="p-6 flex flex-col items-center">
          <p className="text-center text-sm text-gray-800 mb-6">
            Ingresa tus datos para iniciar sesión actualizado prueba
          </p>
          {errMsg && (
            <p className="text-red-600 text-sm text-center font-medium mb-4">
              {errMsg}
            </p>
          )}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <Input
                type="number"
                placeholder="Ingrese Cédula"
                className="pl-10 py-6 bg-gray-100 border-2 border-gray-400"
                value={form.cedula || ""}
                onChange={onChange("cedula")}
              />

              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="currentColor"
                />
              </svg>

              {/* <label className="">Correo</label>
              <input
                type="email"
                value={form.correo}
                onChange={onChange("correo")}
                placeholder="tu@correo.com"
                className=""
                autoComplete="email"
                required
              /> */}
            </div>

            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Ingrese Contraseña"
                className="pl-10 py-6 bg-gray-100 border-2 border-gray-400"
                value={form.contrasenia}
                onChange={onChange("contrasenia")}
              />

              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17ZM18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM8.9 6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8H8.9V6ZM18 20H6V10H18V20Z"
                  fill="currentColor"
                />
              </svg>

              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 6c-3.3 0-6.4 1.6-8.5 4.3a.998.998 0 0 0 0 1.4C5.6 14.4 8.7 16 12 16c3.3 0 6.4-1.6 8.5-4.3a.998.998 0 0 0 0-1.4C18.4 7.6 15.3 6 12 6Zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="w-45 bg-[#3870F7] hover:bg-[#0842C9] transition-all cursor-pointer text-white font-medium rounded-sm p-2"
              >
                Iniciar Sesión
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
