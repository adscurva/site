import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SolicitarCatalogo() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}

{
  [{"id": "1755526044885", "url": "https://res.cloudinary.com/dk2mgiu3a/image/upload/v1755526044/dresses/vmhxp8ef86wiwgecyshb.jpg", "link": "#colecao", "title": "Coleção 2025 – Cores e Modelos Atualizados para Você Brilhar", "target": "_self"}, {"id": "1755526066088", "url": "https://res.cloudinary.com/dk2mgiu3a/image/upload/v1755526065/dresses/uqops7oypxqbzwfw9wnj.jpg", "link": "#colecao", "title": "Midis Brancos - Perfeitos para solenidades, noivados, batizados ou jantares especiais", "target": "_self"}, {"id": "1755526114385", "url": "https://res.cloudinary.com/dk2mgiu3a/image/upload/v1755526113/dresses/jzua6nkqrh2i2sjynqbj.jpg", "link": "#colecao", "title": "Clutches - O toque final que vai valorizar ainda mais o seu look", "target": "_self"}]
}