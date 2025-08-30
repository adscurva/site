import React, { useRef, useState, useCallback, useEffect } from 'react';

// Adicione a nova prop 'position' à interface
interface ParallaxBannerProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  buttonText: string;
  position: 'left' | 'center'; // NOVO: 'left' ou 'center'
}

const ParallaxBanner: React.FC<ParallaxBannerProps> = ({
  imageUrl,
  title,
  subtitle,
  linkUrl,
  buttonText,
  position,
}) => {
  // Define as classes de alinhamento com base na prop 'position'
  const alignmentClass = position === 'left' 
    ? 'items-start text-left' 
    : 'items-center text-center';

  const containerRef = useRef<HTMLDivElement>(null);
  const [yOffset, setYOffset] = useState(0);

  // Fator de velocidade do parallax. Ajuste para um movimento mais ou menos intenso.
  // Um valor entre 0.1 e 0.9 funciona bem.
  const parallaxSpeed = 0.5; 

  const calculateParallaxEffect = useCallback(() => {
    if (containerRef.current) {
      const element = containerRef.current;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerHeight = element.offsetHeight;

      // Calcula o progresso de rolagem do elemento na viewport.
      // 'scrollProgress' vai de 0 (quando o elemento está na parte inferior da viewport)
      // até 1 (quando o elemento está na parte superior da viewport).
      const scrollProgress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + containerHeight)));

      // A altura extra da imagem que pode ser movida (por exemplo, 20% a mais que o contêiner).
      const extraImageHeight = containerHeight * 0.2; // 20% da altura do contêiner
      
      // Calcula o deslocamento vertical.
      // Queremos que a imagem se desloque na MESMA direção do scroll da página, mas mais lentamente.
      // Quando a página desce (scrollProgress aumenta), a div sobe. Queremos que a imagem suba (yOffset negativo).
      // Então, yOffset vai de 0 a -extraImageHeight * parallaxSpeed.
      const newYOffset = -scrollProgress * extraImageHeight * parallaxSpeed;
      
      setYOffset(newYOffset);
    }
  }, [parallaxSpeed]);

  useEffect(() => {
    window.addEventListener('scroll', calculateParallaxEffect);
    window.addEventListener('resize', calculateParallaxEffect);
    calculateParallaxEffect(); // Chama na montagem para a posição inicial
    return () => {
      window.removeEventListener('scroll', calculateParallaxEffect);
      window.removeEventListener('resize', calculateParallaxEffect);
    };
  }, [calculateParallaxEffect]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Erro ao carregar a imagem de background: ${imageUrl}.`, e);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Imagem de fundo que se move */}
      <img
        src={imageUrl}
        alt={`Background para ${title}`}
        className="absolute w-full h-[120%] object-cover" // Imagem 20% mais alta que o container
        style={{
          top: '-10%', // Offset inicial para a imagem estar centralizada verticalmente dentro dos 120%
          transform: `translate3d(0, ${yOffset}px, 0)`, // Aplica o deslocamento vertical
          willChange: 'transform', // Otimização de performance para transformações
          WebkitTransform: `translate3d(0, ${yOffset}px, 0)`, // Para compatibilidade com WebKit
          zIndex: -1, // Garante que a imagem fique atrás do conteúdo e da sobreposição
        }}
        onError={handleImageError}
      />

      {/* Camada de sobreposição escura */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Camada do conteúdo */}
      <div className={`max-w-7xl mx-auto relative z-10 flex flex-col justify-center h-full text-white px-8 py-16 md:px-12 md:py-24 ${alignmentClass}`}>
        <h2 className="text-4xl md:text-6xl font-extrabold max-w-3xl leading-tight mb-4 text-white">{title}</h2>
        <p className="text-xl md:text-3xl font-medium max-w-4xl mb-8 text-gray-100">{subtitle}</p>
        <a 
          href={linkUrl} 
          className="inline-block bg-accent text-white font-bold py-3 px-10 rounded-full shadow-xl hover:bg-accent-dark transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
};

export default ParallaxBanner;
