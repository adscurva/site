import React from 'react';
import Image from 'next/image'; // Importando Image do next/image para otimização
import { FaHome, FaRegBuilding, FaBuilding, FaCheckCircle } from 'react-icons/fa'; // Ícones para os serviços e listas

const Servicos: React.FC = () => {
  return (
    <div className="bg-gray-50 text-gray-800 py-24 md:py-32"> {/* Fundo consistente com SobreNos */}
      <div className="container mx-auto px-4 md:px-8">
        {/* Serviços Residenciais */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-20 md:mb-32 max-w-7xl mx-auto">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-500 mb-6 flex items-center justify-center md:justify-start"> {/* Título com cor de destaque e ícone */}
              <FaHome className="text-orange-500 mr-4 text-4xl" /> Projetos Residenciais
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              Transformamos sonhos em lares. Seja para construir sua casa do zero, reformar um apartamento ou revitalizar um condomínio, nossa equipe de engenheiros e arquitetos se dedica a criar espaços que combinam conforto, funcionalidade e a sua personalidade. 
            </p>
            <ul className="list-none text-gray-700 space-y-3 text-lg leading-relaxed"> {/* Removido list-disc, adicionado FaCheckCircle */}
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Arquitetura e Design:</span> Do conceito inicial ao projeto final, soluções inovadoras que otimizam cada metro quadrado.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Gestão de Obras:</span> Acompanhamento completo da execução, garantindo a qualidade, o cumprimento de prazos e a transparência em cada etapa.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Projetos de Interiores e Paisagismo:</span> Criamos ambientes internos e externos que inspiram e oferecem bem-estar.
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/images/serv1.jpg"
              alt="Projeto de arquitetura residencial"
              width={600}
              height={400}
              layout="responsive"
              style={{ objectFit: "cover" }}
              className="rounded-xl shadow-2xl transform transition-transform hover:scale-102 duration-300" // Sombra e hover effect
            />
          </div>
        </div>

        {/* Serviços Comerciais (imagem à esquerda) */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-20 md:mb-32 max-w-7xl mx-auto">
          <div>
            <Image
              src="/images/serv2.jpg"
              alt="Projeto de arquitetura comercial"
              width={600}
              height={400}
              layout="responsive"
              style={{ objectFit: "cover" }}
              className="rounded-xl shadow-2xl transform transition-transform hover:scale-102 duration-300" // Sombra e hover effect
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-500 mb-6 flex items-center justify-center md:justify-start">
              <FaRegBuilding className="text-orange-500 mr-4 text-4xl" /> Soluções para Empresas e Construtoras
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              Atendemos à demanda de empresas e construtoras, oferecendo serviços técnicos especializados que garantem a viabilidade e a excelência de grandes projetos. Nossa expertise se estende à construção de edifícios, condomínios e complexos habitacionais.
            </p>
            <ul className="list-none text-gray-700 space-y-3 text-lg leading-relaxed">
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Projetos Estruturais:</span> Elaboração de projetos técnicos sólidos, eficientes e seguros para qualquer tipo de edificação.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Urbanização e Loteamento:</span> Planejamento e execução de obras de urbanização, transformando espaços em áreas de desenvolvimento.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Consultoria Técnica:</span> Suporte especializado para otimização de projetos e análise de viabilidade.
              </li>
            </ul>
          </div>
        </div>

        {/* Serviços Públicos */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center max-w-7xl mx-auto">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-500 mb-6 flex items-center justify-center md:justify-start">
              <FaBuilding className="text-orange-500 mr-4 text-4xl" /> Obras Governamentais e Públicas
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              Possuímos experiência comprovada no desenvolvimento de projetos e execução de obras para o setor público. Atuamos com rigor e transparência na construção e reforma de prédios governamentais, escolas, hospitais e delegacias, contribuindo para a infraestrutura do país.
            </p>
            <ul className="list-none text-gray-700 space-y-3 text-lg leading-relaxed">
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Projetos e Reformas:</span> Atendimento às especificações de projetos institucionais com a máxima eficiência.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Fiscalização e Acompanhamento:</span> Garantia de que a execução da obra segue todos os padrões técnicos e regulamentares.
              </li>
              <li>
                <FaCheckCircle className="inline text-orange-500 mr-3 text-2xl align-middle" />
                <span className="font-semibold text-gray-800">Consultoria e Gestão de Contratos:</span> Especialistas em processos licitatórios e gestão de contratos públicos.
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/images/serv3.jpg"
              alt="Projeto de arquitetura governamental"
              width={600}
              height={400}
              layout="responsive"
              style={{ objectFit: "cover" }}
              className="rounded-xl shadow-2xl transform transition-transform hover:scale-102 duration-300" // Sombra e hover effect
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Servicos;
