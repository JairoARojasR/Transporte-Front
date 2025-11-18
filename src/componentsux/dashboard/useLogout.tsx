// hooks/useLogout.ts
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cerrarSesion } from "@/lib/login/loginApi";

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await cerrarSesion();
      setTimeout(() => router.push("/login"), 800);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
