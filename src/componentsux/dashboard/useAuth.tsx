import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = Cookies.get("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.sub) {
        router.push("/login"); 
      }
    } catch (e) {
      router.push("/login"); 
    } finally {
      setLoading(false); 
    }
  }, [router]);

  return loading;
};
