import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verificar = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/inicio/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!mounted) return;

        if (!res.ok) {
          router.replace("/login");
          return;
        }
      } catch {
        if (mounted) router.replace("/login");
        return;
      } finally {
        if (mounted) setLoading(false);
      }
    };

    verificar();

    return () => {
      mounted = false;
    };
  }, [router]);

  return loading;
};
