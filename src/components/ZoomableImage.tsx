import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { AiOutlineSearch } from 'react-icons/ai'; // Ícone de busca

interface ZoomableImageProps {
  src: string;
  alt: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: '50%', y: '50%' });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggleZoom = useCallback(() => {
    setIsZoomed((prevIsZoomed) => !prevIsZoomed);
    // Reseta a posição ao zoom in/out para evitar comportamentos inesperados
    setZoomPosition({ x: '50%', y: '50%' });
  }, []);

  const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;

    let clientX, clientY;

    if ('touches' in e) {
      // Lida com eventos de toque
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      e.preventDefault(); // Impede o comportamento padrão de rolagem em mobile
    } else {
      // Lida com eventos de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    // Calcula a posição relativa dentro da imagem (entre 0 e 1)
    const relativeX = Math.max(0, Math.min(x / width, 1));
    const relativeY = Math.max(0, Math.min(y / height, 1));

    // Define a nova posição de zoom em porcentagem
    setZoomPosition({ x: `${relativeX * 100}%`, y: `${relativeY * 100}%` });
  }, [isZoomed]);

  return (
    <div
      className="relative w-full h-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center"
      onClick={handleToggleZoom}
      onMouseMove={handleInteraction}
      onTouchStart={handleToggleZoom} // Inicia o zoom no primeiro toque
      onTouchMove={handleInteraction}
      ref={containerRef}
      style={{ touchAction: 'none' }} // Impede o comportamento padrão de toque (como rolagem)
    >
      <Image
        src={src}
        alt={alt}
        fill
        objectFit="contain" // Garante que a imagem se ajuste sem cortar
        className="transition-transform ease-in-out duration-300"
        style={{
          transform: isZoomed ? 'scale(2)' : 'scale(1)',
          transformOrigin: `${zoomPosition.x} ${zoomPosition.y}`,
          cursor: isZoomed ? 'zoom-out' : 'zoom-in',
        }}
      />

      <div className={`absolute bottom-4 right-4 bg-black/60 p-2 rounded-full transition-opacity duration-300 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
        <AiOutlineSearch className="text-white" size={24} />
      </div>
    </div>
  );
}

export default ZoomableImage;
