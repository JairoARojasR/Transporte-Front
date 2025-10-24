// src/app/dashboard/layout.tsx
'use client';

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verificarSesion } from "@/lib/login/loginApi";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await verificarSesion();     // 👈 consulta al backend
        if (mounted) setReady(true); // OK, mostrar dashboard
      } catch {
        // No autenticado → al login
        router.replace("/login");
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Verificando sesión…</span>
      </main>
    );
  }

  return <>{children}</>;
}
