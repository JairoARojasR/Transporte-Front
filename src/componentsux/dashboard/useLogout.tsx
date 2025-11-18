"use client";
import Cookies from "js-cookie";

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
    Cookies.remove("user_rol");
      setLoading(false);
    }
  };

  return { logout, loading };
}
