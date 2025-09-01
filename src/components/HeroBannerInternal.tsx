import React from 'react';
import Image from 'next/image';

// Renomeado a interface para HeroBannerInternalProps e adicionado title e subtitle
interface HeroBannerInternalProps {
  imageUrl?: string; // Opcional, para caso você queira usar uma imagem específica
  title: string;      // Título do banner
  subtitle?: string;   // Subtítulo do banner
}

const HeroBannerInternal: React.FC<HeroBannerInternalProps> = ({ imageUrl, title, subtitle }) => {
  const defaultImageUrl = "https://placehold.co/1920x400/34495e/ecf0f1?text=Curva+Engenharia+e+Arquitetura"; // Placeholder

  return (
    <div className="relative w-full py-16 overflow-hidden bg-gray-800 flex items-center justify-center">
      {/* Imagem de fundo, usando a prop ou o placeholder */}
      <Image
        src={imageUrl || defaultImageUrl}
        alt={`Background da página: ${title}`} // Alt text dinâmico
        fill
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0 opacity-70" // Sutil opacidade para o texto se destacar
      />

      {/* Camada de sobreposição escura para melhorar o contraste do texto */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Conteúdo do banner */}
      <div className="relative z-20 text-center text-white px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-accent text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          {title} {/* Usando a prop title */}
        </h1>
        <p className="text-gray-300 text-lg md:text-xl lg:text-2xl font-medium drop-shadow-md">
          {subtitle} {/* Usando a prop subtitle */}
        </p>
      </div>
    </div>
  );
};

export default HeroBannerInternal;
