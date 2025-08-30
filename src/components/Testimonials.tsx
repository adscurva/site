import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md"; // Importando os ícones de seta

// Define a tipagem dos dados que serão passados para o componente
interface Testimonial {
  id: string;
  name: string;
  content: string;
  type: string;
}

// Define a tipagem das props do componente
interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0); // Estado para controlar o depoimento visível
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0); // Stores the translate value before a drag starts
  const carouselTrackRef = useRef<HTMLDivElement>(null); // Ref for the div that holds and moves all testimonials
  const itemRef = useRef<HTMLDivElement>(null); // Ref for a single testimonial item to get its width
  const carouselViewportRef = useRef<HTMLDivElement>(null); // Ref for the overflow-hidden div

  // Determine how many testimonials to show based on screen width
  const getItemsToShow = useCallback(() => {
    if (typeof window === 'undefined') return 1; // Default for SSR
    return window.innerWidth >= 768 ? 3 : 1; // 3 on desktop (md breakpoint), 1 on mobile
  }, []);

  // Update the carousel's position based on currentIndex
  const updateCarouselPosition = useCallback(() => {
    if (carouselTrackRef.current && itemRef.current && carouselViewportRef.current) {
      const itemsToShow = getItemsToShow();
      const gapX = 24; // Equivalent to Tailwind's gap-x-6 (1.5rem = 24px)

      // Get the true width of a single item (content + padding + border)
      const singleItemRenderedWidth = itemRef.current.offsetWidth; 
      
      let newTranslateX = 0;

      if (itemsToShow === 1) { // Mobile: Display 1 item and center it
        const viewportWidth = carouselViewportRef.current.offsetWidth; // Get outer width including padding
        const carouselContentWidth = carouselTrackRef.current.scrollWidth; // Total scrollable width of the track

        // Calculate the center point of the current item on the track
        const currentItemCenterOnTrack = (currentIndex * (singleItemRenderedWidth + gapX)) + (singleItemRenderedWidth / 2);
        
        // Calculate the translation needed to center the current item in the viewport
        newTranslateX = (viewportWidth / 2) - currentItemCenterOnTrack;
        
        // Ensure the translation doesn't go too far left or right (optional, but good for bounds)
        const maxTranslateX = 0; // Don't translate further right than the start
        const minTranslateX = viewportWidth - carouselContentWidth; // Don't translate further left than the end
        newTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));


      } else { // Desktop: Display 3 items, align to start of a group
        newTranslateX = -currentIndex * (singleItemRenderedWidth + gapX);
      }
      
      carouselTrackRef.current.style.transform = `translateX(${newTranslateX}px)`;
      carouselTrackRef.current.style.transition = 'transform 0.5s ease-in-out';
      setPrevTranslate(newTranslateX); // Update prevTranslate for the next drag operation
    }
  }, [currentIndex, getItemsToShow, testimonials.length]); 

  // Effect to update carousel position on initial load and window resize
  useEffect(() => {
    updateCarouselPosition();
    window.addEventListener('resize', updateCarouselPosition);
    return () => {
      window.removeEventListener('resize', updateCarouselPosition);
    };
  }, [updateCarouselPosition]);

  // Handle next testimonial navigation
  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= testimonials.length) { 
        return 0; 
      }
      return nextIndex;
    });
  }, [testimonials.length]);

  // Handle previous testimonial navigation
  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      if (nextIndex < 0) {
        return testimonials.length - 1; 
      }
      return nextIndex;
    });
  }, [testimonials.length]);

  // --- Touch and Mouse Drag/Swipe Handlers ---

  const startDrag = useCallback((clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transition = 'none'; // Disable transition during drag
      const transformValue = carouselTrackRef.current.style.transform;
      const currentTranslateX = transformValue ? parseFloat(transformValue.replace('translateX(', '').replace('px)', '')) : 0;
      setPrevTranslate(currentTranslateX);
    }
  }, []);

  const moveDrag = useCallback((clientX: number) => {
    if (!isDragging) return;
    const dragAmount = clientX - startX;
    setCurrentTranslate(dragAmount);
    if (carouselTrackRef.current) {
        carouselTrackRef.current.style.transform = `translateX(${prevTranslate + dragAmount}px)`;
    }
  }, [isDragging, startX, prevTranslate]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    const movedBy = currentTranslate;
    const threshold = 70; // Pixels para considerar um swipe/drag significativo

    if (movedBy < -threshold) { // Swiped/Dragged left
        handleNext();
    } else if (movedBy > threshold) { // Swiped/Dragged right
        handlePrev();
    } else {
        // Snap back to current item if not enough movement
        updateCarouselPosition();
    }
    setCurrentTranslate(0); // Reset drag translate
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transition = 'transform 0.5s ease-in-out'; // Re-enable transition
    }
  }, [currentTranslate, handleNext, handlePrev, updateCarouselPosition]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => startDrag(e.touches[0].clientX), [startDrag]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => moveDrag(e.touches[0].clientX), [moveDrag]);
  const handleTouchEnd = useCallback(endDrag, [endDrag]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => startDrag(e.clientX), [startDrag]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => moveDrag(e.clientX), [moveDrag]);
  const handleMouseUp = useCallback(endDrag, [endDrag]);
  const handleMouseLeave = useCallback(() => { // End drag if mouse leaves element
    if (isDragging) {
      endDrag();
    }
  }, [isDragging, endDrag]);

  // Render nothing if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-100 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Depoimentos
          </h2>
          <p className="text-gray-700 font-medium text-lg mt-4">O que nossos clientes dizem</p>
        </div>
        
        {/* Carousel container with overflow hidden to clip testimonials */}
        <div ref={carouselViewportRef} className="relative flex items-center overflow-hidden md:px-0"> {/* Removed px-4 here, it's now applied to article itself */}
          {/* Navigation button for previous testimonial */}
          <button
            onClick={handlePrev}
            className="absolute left-2 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 md:-left-12"
            aria-label="Depoimento anterior"
            style={{ top: '50%', transform: 'translateY(-50%)' }} // Vertically center buttons
          >
            <MdOutlineArrowBackIos size={24} />
          </button>

          {/* Carousel track that holds all testimonials and slides */}
          <div 
            ref={carouselTrackRef}
            className="flex gap-x-6 w-full" // Ensure track takes full width and manages gaps
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ 
                transform: `translateX(${prevTranslate + currentTranslate}px)`,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            {testimonials.map((t, index) => (
              <article
                key={t.id}
                ref={index === 0 ? itemRef : null} 
                className={`flex-shrink-0 p-7 bg-white rounded-xl shadow-lg border-2 border-orange-100 transform transition-transform duration-500 ease-in-out
                            ${getItemsToShow() === 1 ? 'w-[calc(100vw-2rem)]' : 'md:w-[calc((100%-2*1.5rem)/3)]'}`} /* Adjusted width for mobile to account for screen padding */
                aria-label={`Depoimento de ${t.name}`}
              >
                <div className="flex items-start mb-4">
                  <span className="text-orange-500 text-4xl leading-none mr-2">“</span>
                  <p className="text-gray-700 text-lg md:text-xl italic leading-relaxed flex-1 w-fit">
                    {t.content}
                  </p>
                  <span className="text-orange-500 text-4xl leading-none ml-2">”</span>
                </div>
                <div className="text-right mt-6">
                  <span className="block font-semibold text-gray-800 text-lg md:text-xl">
                    — {t.name}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Navigation button for next testimonial */}
          <button
            onClick={handleNext}
            className="absolute right-2 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 md:-right-12"
            aria-label="Próximo depoimento"
            style={{ top: '50%', transform: 'translateY(-50%)' }} // Vertically center buttons
          >
            <MdOutlineArrowForwardIos size={24} />
          </button>
        </div>
        
        {/* Page indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
              } transition-colors duration-300`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>

        <p className="text-center text-gray-700 mt-12 px-4">
          Já é nosso cliente?{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://g.page/r/Cb0i7CwI5XQuEBM/review"
            className="text-orange-500 hover:text-orange-600 transition-colors font-bold"
          >
            Conte-nos como foi sua experiência
          </a>
          .
        </p>
      </div>

      {/* Estilos para a animação de fade-in */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
