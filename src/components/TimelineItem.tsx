import React from 'react';

interface TimelineItemProps {
  title: string;
  icon: string;
  description: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ title, icon, description }) => {
  return (
    <div className="relative w-full md:w-1/2">
      {/* Ícone da Linha do Tempo (Círculo e Ícone SVG) */}
      <div className="absolute z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-accent-light text-white" style={{ left: '-50px', top: '50%', transform: 'translateY(-50%)' }}>
        <div dangerouslySetInnerHTML={{ __html: icon }} />
      </div>

      {/* Card de Conteúdo */}
      <div className="w-full p-6 bg-white rounded-lg shadow-md border-t-4 border-accent-light">
        <h3 className="text-2xl font-bold text-primary mb-2">{title}</h3>
        <p className="text-neutral-dark leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default TimelineItem;