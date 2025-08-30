import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MdPlayArrow, MdPause } from 'react-icons/md'; // Importa os ícones de play/pause

// Interface atualizada para corresponder ao BannerForm.tsx
interface BannerItem {
  id: string;
  url: string;
  title?: string;
  subtitle?: string;
  link?: string;
  target?: string;
  buttonText?: string;
  buttonColor?: string;
}

interface HeroSliderProps {
  banners: {
    banners: BannerItem[];
  }[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [startX, setStartX] = useState<number | null>(null);
  const slides = banners[0]?.banners || [];
  const router = useRouter();

  useEffect(() => {
    if (!playing || slides.length === 0) return;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % slides.length), 8000); // Tempo de transição ajustado
    return () => clearTimeout(timer);
  }, [current, playing, slides.length]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setPlaying(false);
    setStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startX === null) return;
    const deltaX = e.clientX - startX;

    if (Math.abs(deltaX) > 50) {
      setCurrent((prev) => (deltaX > 0 ? (prev - 1 + slides.length) % slides.length : (prev + 1) % slides.length));
    }

    setStartX(null);
    setPlaying(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setPlaying(false);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > 50) {
      setCurrent((prev) => (deltaX > 0 ? (prev - 1 + slides.length) % slides.length : (prev + 1) % slides.length));
    }

    setStartX(null);
    setPlaying(true);
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-[70vh] md:h-[60vh] lg:h-[70vh] overflow-hidden shadow-2xl" // Sombra mais forte
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      id="inicio"
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100 z-0" : "opacity-0 z-0"}`}
        >
          <img src={slide.url} alt={slide.title || `Banner ${idx + 1}`} className="object-cover w-full h-full" />
        </div>
      ))}
      
      {/* Renderiza o conteúdo do banner ativo separadamente */}
      {slides[current] && (slides[current].title || slides[current].subtitle || slides[current].buttonText) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-6 md:p-10 text-center"> {/* Alinhamento centralizado */}
          <div className="container flex flex-col items-center justify-end w-full max-w-4xl"> {/* Ajusta container para centralizar */}
            {/* Título e Subtítulo */}
            <div className="flex-1 mb-8">
              {slides[current].title && (
                <h2 className="font-sans text-4xl md:text-5xl lg:text-7xl font-extrabold text-white drop-shadow-lg mb-4 leading-tight"> {/* Título maior e mais impactante */}
                  {slides[current].title}
                </h2>
              )}
              {slides[current].subtitle && (
                <>
                  <div className="w-24 border-b-2 border-accent mx-auto mb-6"></div> {/* Linha mais próxima do título, centralizada */}
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-100 drop-shadow mb-8"> {/* Subtítulo mais destacado */}
                    {slides[current].subtitle}
                  </p>
                </>
              )}
              {/* Botão com Link */}
              {slides[current].buttonText && slides[current].link && (
                <div className="mt-4">
                  <Link href={slides[current].link} passHref>
                    <button
                      className={`inline-block py-3 px-8 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl ${slides[current].buttonColor || "bg-orange-500 hover:bg-orange-600"} text-white`}
                    >
                      {slides[current].buttonText}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navegação e Controles */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3"> {/* Ajusta bottom e gap */}
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${idx === current ? "bg-orange-500" : "bg-gray-400 hover:bg-gray-200"}`} // Cores e tamanho ajustados
            onClick={() => setCurrent(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
          />
        ))}
      </div>

      <button
        className="absolute bottom-6 right-6 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white z-10 transition-colors duration-300" // Cor de fundo e hover ajustados
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pausar" : "Reproduzir"}
      >
        {playing ? (
          <MdPause className="w-5 h-5 text-gray-700" /> // Usando ícone de react-icons/md
        ) : (
          <MdPlayArrow className="w-5 h-5 text-gray-700" /> // Usando ícone de react-icons/md
        )}
      </button>
    </div>
  );
}
