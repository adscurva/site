import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AgendarVisita() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}