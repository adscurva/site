import React from 'react';
import Image from 'next/image';
import { FaBullseye, FaEye, FaHandshake, FaCheckCircle } from 'react-icons/fa'; // Importa os ícones

const SobreNos: React.FC = () => {
  // Array de clientes (você pode substituir por seus logos reais)
  const clients = [
    { id: 1, name: "Cliente A", logo: "https://placehold.co/120x60/orange/white?text=Cliente+1" },
    { id: 2, name: "Cliente B", logo: "https://placehold.co/120x60/orange/white?text=Cliente+2" },
    { id: 3, name: "Cliente C", logo: "https://placehold.co/120x60/orange/white?text=Cliente+3" },
    { id: 4, name: "Cliente D", logo: "https://placehold.co/120x60/orange/white?text=Cliente+4" },
    { id: 5, name: "Cliente E", logo: "https://placehold.co/120x60/orange/white?text=Cliente+5" },
    { id: 6, name: "Cliente F", logo: "https://placehold.co/120x60/orange/white?text=Cliente+6" },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 py-16"> {/* Fundo suave */}
      <div className="container mx-auto px-4 md:px-8">
        {/* Seção de História */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-20 md:mb-32 max-w-7xl mx-auto">
          <div className="order-2 md:order-1 text-center md:text-left"> {/* Alinhamento de texto */}
            <h2 className="text-3xl md:text-5xl font-bold text-orange-500 mb-6">Nossa História</h2> {/* Título com cor de destaque */}
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              Desde a nossa fundação, temos nos dedicado a entregar projetos que superam expectativas. Cada desafio é uma oportunidade de inovar, e cada projeto concluído é um testemunho do nosso empenho em criar espaços que sejam não apenas belos, mas também funcionais, seguros e sustentáveis. Acreditamos que a colaboração e o detalhe são a chave para o sucesso em cada etapa.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Com uma equipe de profissionais altamente qualificados e apaixonados, atendemos a uma ampla gama de clientes, de pequenas reformas a grandes construções. Nosso crescimento é reflexo da confiança que nossos clientes depositam em nós e do nosso compromisso contínuo com a excelência.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="https://res.cloudinary.com/dacvhzjxb/image/upload/v1756187489/dresses/argn3tvqnxrumkbycf9h.jpg"
              alt="Equipe de engenharia e arquitetura em reunião"
              width={600}
              height={400}
              layout="responsive"
              style={{ objectFit: "cover" }}
              className="rounded-xl shadow-2xl transform transition-transform hover:scale-102 duration-300" // Sombra e hover effect
            />
          </div>
        </div>

        {/* Seção de Missão, Visão e Valores */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-8 md:p-12 mb-20 md:mb-32 max-w-7xl mx-auto">
          <h2 className="text-center text-4xl font-extrabold text-white mb-10 md:mb-16">Nossos Pilares</h2>
          <div className="flex flex-col md:flex-row items-start justify-between gap-10"> {/* Alinhamento e espaçamento */}
            <div className='flex-1 text-center md:text-left w-full'>
              <FaBullseye className="text-orange-500 text-5xl mx-auto md:mx-0 mb-4" /> {/* Ícone */}
              <h3 className="text-2xl font-bold text-orange-500 mb-3">Missão</h3>
              <p className="text-gray-200 leading-relaxed">
                Oferecer soluções inovadoras e personalizadas em engenharia e arquitetura, garantindo qualidade, segurança e satisfação total do cliente em cada etapa do projeto.
              </p>
            </div>
            <div className='flex-1 text-center md:text-left w-full'>
              <FaEye className="text-orange-500 text-5xl mx-auto md:mx-0 mb-4" /> {/* Ícone */}
              <h3 className="text-2xl font-bold text-orange-500 mb-3">Visão</h3>
              <p className="text-gray-200 leading-relaxed">
                Ser a empresa de referência no mercado, reconhecida pela excelência técnica, ética profissional e capacidade de transformar ideias em realidade.
              </p>
            </div>
            <div className='flex-1 text-center md:text-left w-full'>
              <FaHandshake className="text-orange-500 text-5xl mx-auto md:mx-0 mb-4" /> {/* Ícone */}
              <h3 className="text-2xl font-bold text-orange-500 mb-3">Valores</h3>
              <ul className="list-none text-gray-200 space-y-2 leading-relaxed"> {/* Removido list-disc */}
                <li><FaCheckCircle className="inline text-orange-500 mr-2" />Ética e Transparência</li>
                <li><FaCheckCircle className="inline text-orange-500 mr-2" />Compromisso com o Cliente</li>
                <li><FaCheckCircle className="inline text-orange-500 mr-2" />Inovação Contínua</li>
                <li><FaCheckCircle className="inline text-orange-500 mr-2" />Excelência Técnica</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Seção de Diferenciais */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-20 md:mb-32 max-w-7xl mx-auto">
          <div>
            <Image
              src="/images/projeto.jpg"
              alt="Projeto arquitetônico em andamento"
              width={600}
              height={400}
              layout="responsive"
              style={{ objectFit: "cover" }}
              className="rounded-xl shadow-2xl transform transition-transform hover:scale-102 duration-300" // Sombra e hover effect
            />
          </div>
          <div className="text-center md:text-left"> {/* Alinhamento de texto */}
            <h2 className="text-3xl md:text-5xl font-bold text-orange-500 mb-6">Nossos Diferenciais</h2>
            <ul className="list-none text-gray-700 space-y-4 text-lg leading-relaxed"> {/* Removido list-disc */}
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" /> {/* Ícone */}
                <span className="font-semibold text-gray-800">Planejamento Detalhado:</span> Foco em cada etapa do projeto para garantir eficiência e evitar surpresas.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" /> {/* Ícone */}
                <span className="font-semibold text-gray-800">Design Inovador:</span> Soluções criativas que unem estética e funcionalidade.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" /> {/* Ícone */}
                <span className="font-semibold text-gray-800">Acompanhamento Completo:</span> Suporte desde a concepção até a entrega das chaves.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" /> {/* Ícone */}
                <span className="font-semibold text-gray-800">Transparência Total:</span> Comunicação aberta e clara durante todo o processo.
              </li>
            </ul>
          </div>
        </div>

        {/* Nova Seção: Nossos Clientes */}
        {/* <div className="bg-gray-100 rounded-xl shadow-lg p-8 md:p-12 text-center max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">Parceiros de Confiança</h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
            Temos orgulho de construir relacionamentos duradouros e de atender a uma vasta gama de clientes, transformando suas visões em realidade.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
            {clients.map((client) => (
              <div key={client.id} className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                <Image
                  src={client.logo}
                  alt={`Logo do ${client.name}`}
                  width={120}
                  height={60}
                  className="grayscale hover:grayscale-0 transition-all duration-300 object-contain"
                />
              </div>
            ))}
          </div>
        </div> */}

      </div>
    </div>
  );
};

export default SobreNos;
