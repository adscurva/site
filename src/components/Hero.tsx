import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <section className="bg-neutral-light py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Título e subtítulo centralizados no topo */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-accent font-semibold text-lg uppercase tracking-wide mb-2">Sobre nós</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary leading-tight max-w-4xl mx-auto">
            História, Missão e Expertise
          </h2>
        </div>

        {/* Conteúdo principal: texto e imagem lado a lado em telas maiores */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">
          {/* Coluna da direita: Imagem (aparece primeiro em mobile, depois do texto em md e acima) */}
          <div className="block flex-1 relative w-full md:max-w-xl overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 ease-in-out transform hover:scale-102 order-first md:order-none">
            <img
              src="/images/hero.jpg"
              alt="Equipe de engenheiros e arquitetos colaborando"
              className="w-full h-auto object-cover max-h-96 md:max-h-full"
            />
          </div>

          {/* Coluna da esquerda: Texto principal e botão (aparece depois da imagem em mobile, e primeiro em md e acima) */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-5">
            <p className="text-neutral-dark text-lg leading-relaxed max-w-xl md:max-w-none">
              Há mais de uma década, a Curva Engenharia e Arquitetura transforma projetos em realidade. Nossa missão é ir além da construção, unindo a precisão da engenharia com a criatividade da arquitetura para entregar soluções completas e de alta qualidade. Somos movidos pela paixão por construir, reformar e projetar, criando espaços que geram impacto positivo para nossos clientes e para a comunidade.
            </p>
            <div className="mt-6 w-fit">
              <a 
                href="/sobre" 
                className="inline-block bg-accent text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-accent-dark transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
              >
                Leia mais
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
