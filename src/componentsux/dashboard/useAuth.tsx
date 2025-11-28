import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/inicio/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          router.push("/login");
          return;
        }
      } catch (error) {
        router.push("/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    verificar();
  }, [router]);

  return loading;
};
