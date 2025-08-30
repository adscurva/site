import React from 'react';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { BsPencilSquare, BsTools } from 'react-icons/bs';
import { AiOutlineTeam } from 'react-icons/ai';

const services = [
  {
    title: "Construção",
    description: "Executamos projetos de engenharia de alto padrão, garantindo precisão técnica e inovação. Nossa atuação abrange desde residências exclusivas até grandes obras de infraestrutura, com foco em durabilidade e eficiência.",
    subText: "Construção de Edifícios; Obras de Infraestrutura; Gerenciamento de Canteiro.",
    icon: <HiOutlineBuildingOffice2 className="h-7 w-7 text-white" />, // Ícone levemente maior
  },
  {
    title: "Projetos",
    description: "Desenvolvemos soluções completas em arquitetura, engenharia e design de interiores. Criamos projetos que unem estética, funcionalidade e viabilidade técnica, desde a concepção inicial até os detalhes executivos.",
    subText: "Projetos Arquitetônicos; Projetos Estruturais; Projetos de Instalações; Design de Interiores.",
    icon: <BsPencilSquare className="h-7 w-7 text-white" />, // Ícone levemente maior
  },
  {
    title: "Reformas e Manutenção",
    description: "Especialistas em revitalizar e modernizar espaços. Realizamos reformas e manutenções com agilidade e qualidade, transformando ambientes de forma estratégica para valorizar o imóvel.",
    subText: "Reformas Residenciais; Adequação de Espaços Comerciais; Manutenção Preventiva e Corretiva.",
    icon: <BsTools className="h-7 w-7 text-white" />, // Ícone levemente maior
  },
  {
    title: "Consultoria e Gestão",
    description: "Oferecemos consultoria especializada em todas as etapas do seu projeto. Com vasta experiência em gerenciamento e fiscalização, asseguramos a otimização de custos e o cumprimento de prazos com excelência.",
    subText: "Planejamento e Viabilidade; Gerenciamento de Obras; Fiscalização Técnica.",
    icon: <AiOutlineTeam className="h-7 w-7 text-white" />, // Ícone levemente maior
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-28"> {/* Aumenta o padding vertical */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Título da Seção - Mais destaque */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12 md:mb-16">Nossa Atuação</h2>

        {/* Grade de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14"> {/* Aumenta o espaçamento entre os cards */}
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-gray-800 flex flex-col md:flex-row items-center md:items-start gap-6 p-8 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-2xl duration-300" // Remove max-w-xs e mx-auto, aumenta padding e melhora shadow no hover
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center"> {/* Círculo do ícone ligeiramente maior */}
                {service.icon}
              </div>
              <div className="flex-1 text-center md:text-left"> {/* Centraliza texto em mobile, alinha à esquerda em desktop */}
                <h3 className="text-2xl font-bold text-orange-500 mb-2">{service.title}</h3>
                <p className="text-gray-200 mb-4">{service.description}</p> {/* Cor do texto ajustada para contraste */}
                <div className="text-sm text-gray-400"> {/* Cor do texto ajustada */}
                  <p className="text-orange-500 font-semibold">Serviços associados:</p>
                  <p className='text-gray-300'>{service.subText}</p> {/* Cor do texto ajustada */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
