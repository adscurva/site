import React from 'react';
import { Timeline, TimelineItem, TimelinePoint, TimelineContent } from 'flowbite-react';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { BsPencilSquare, BsTools } from 'react-icons/bs';
import { AiOutlineTeam } from 'react-icons/ai';

const services = [
  {
    title: "Construção",
    description: "Executamos projetos de engenharia de alto padrão, garantindo precisão técnica e inovação. Nossa atuação abrange desde residências exclusivas até grandes obras de infraestrutura, com foco em durabilidade e eficiência.",
    subText: "Construção de Edifícios; Obras de Infraestrutura; Gerenciamento de Canteiro.",
    icon: <HiOutlineBuildingOffice2 className="h-6 w-6" />,
  },
  {
    title: "Projetos",
    description: "Desenvolvemos soluções completas em arquitetura e engenharia. Criamos projetos que unem estética, funcionalidade e viabilidade técnica, desde a concepção inicial até os detalhes executivos.",
    subText: "Projetos Arquitetônicos; Projetos Estruturais; Projetos de Instalações.",
    icon: <BsPencilSquare className="h-6 w-6" />,
  },
  {
    title: "Reformas e Manutenção",
    description: "Especialistas em revitalizar e modernizar espaços. Realizamos reformas e manutenções com agilidade e qualidade, transformando ambientes de forma estratégica para valorizar o imóvel.",
    subText: "Reformas Residenciais; Adequação de Espaços Comerciais; Manutenção Preventiva e Corretiva.",
    icon: <BsTools className="h-6 w-6" />,
  },
  {
    title: "Consultoria e Gestão",
    description: "Oferecemos consultoria especializada em todas as etapas do seu projeto. Com vasta experiência em gerenciamento e fiscalização, asseguramos a otimização de custos e o cumprimento de prazos com excelência.",
    subText: "Planejamento e Viabilidade; Gerenciamento de Obras; Fiscalização Técnica.",
    icon: <AiOutlineTeam className="h-6 w-6" />,
  },
];

const TimelineSection: React.FC = () => {
  return (
    <section className="bg-gray-50 white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Nossa atuação</h2>

        <div className="relative">
          {/* Linha vertical central para desktop e mobile */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
          
          <Timeline className="mx-auto max-w-4xl">
            {services.map((service, index) => {
              const isEven = index % 2 === 0;

              return (
                <div key={index} className={`bg-white flex flex-col md:flex-row items-center relative md:space-x-12 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Container do Card */}
                  <div className={`w-full md:w-1/2 relative z-10 p-4 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="p-6 rounded-lg border border-orange-400 shadow-md">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>

                  {/* Círculo do Ícone e SubTexto */}
                  <div className={`flex items-center gap-4 mt-6 md:mt-0 
                                  ${isEven ? 'md:justify-end md:ml-auto' : 'md:justify-start md:mr-auto'}`}>
                    <div className={`relative z-20 flex-shrink-0 w-12 h-12 rounded-full bg-orange-400 text-white flex items-center justify-center 
                                   ${!isEven ? 'md:order-last md:ml-4' : 'md:order-first md:mr-4'}`}>
                      {service.icon}
                    </div>

                    <div className="w-48 text-sm text-gray-500 whitespace-pre-line hidden md:block">
                      {service.subText}
                    </div>
                  </div>
                </div>
              );
            })}
          </Timeline>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;