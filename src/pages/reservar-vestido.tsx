import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ReservarVestido() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}