import { useState } from "react"
import { FaPlus, FaMinus } from "react-icons/fa" // Importa os ícones de mais e menos

// Dados para a seção de serviços
const servicesList = [
  {
    title: "Consultoria Especializada",
    description: "Otimização e inovação para seu projeto, com foco em eficiência e resultados comprovados. Nossos consultores especializados guiam você em cada etapa.",
  },
  {
    title: "Gerenciamento de Obras",
    description: "Qualidade e eficiência na execução, do planejamento à entrega. Garantimos que seu projeto seja concluído dentro do prazo e orçamento, com a máxima excelência.",
  },
  {
    title: "Projetos Arquitetônicos e Engenharia",
    description: "Planejamento inteligente e funcional, transformando suas ideias em realidade. Desenvolvemos projetos inovadores e sustentáveis, adaptados às suas necessidades.",
  },
  {
    title: "Reformas e Manutenção",
    description: "Revitalização de espaços com alto padrão de qualidade e atenção aos detalhes. Realizamos reformas que valorizam seu imóvel e atendem suas expectativas.",
  },
  {
    title: "Construção de Alto Padrão",
    description: "Residências e obras públicas com excelência, durabilidade e design exclusivo. Comprometimento com a segurança e a satisfação do cliente em cada construção.",
  },
]

// Dados para os números de destaque
const stats = [
  { value: "100%", label: "Qualidade" },
  { value: "+15 anos", label: "de história" },
  { value: "+2k", label: "Projetos" },
]

export default function Header() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-28 bg-gray-800"> {/* Aumenta o padding vertical */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Coluna da esquerda: Conteúdo de texto e números */}
          <div className="flex flex-col gap-6">
            <h2 className="w-full text-4xl md:text-5xl font-extrabold text-orange-500 leading-tight max-w-2xl mx-auto md:mx-0 text-center md:text-left"> {/* Ajusta largura e alinhamento */}
              Soluções completas<br /><small className="text-gray-300 font-medium">para seu empreendimento</small> {/* Ajusta cor e peso da fonte */}
            </h2>
            <p className="text-white text-lg leading-relaxed max-w-xl mx-auto md:mx-0 text-center md:text-left"> {/* Ajusta largura e alinhamento */}
              Da concepção à execução, oferecemos projetos inteligentes, gestão eficiente e construção de alto padrão. Combinamos inovação, tecnologia e experiência para entregar soluções personalizadas que agregam valor, qualidade e sustentabilidade ao seu empreendimento.
            </p>

            {/* Números de destaque */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-8 sm:gap-12 mt-8"> {/* Ajusta justificação e margem superior */}
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="text-4xl font-bold text-orange-500">{stat.value}</span>
                  <span className="text-white text-lg font-medium">{stat.label}</span> {/* Aumenta o peso da fonte */}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da direita: Lista de serviços em formato de "acordeão" */}
          <div className="flex flex-col gap-4 mt-8 md:mt-0 max-w-xl mx-auto md:mx-0"> {/* Ajusta largura máxima e alinhamento */}
            {servicesList.map((service, index) => (
              <div key={index} className="rounded-lg shadow-md overflow-hidden transition-all duration-300 bg-gray-700"> {/* Fundo mais escuro */}
                <button
                  className="w-full text-left p-6 bg-gray-700 hover:bg-gray-600 transition-colors flex justify-between items-center text-white" /* Cores ajustadas */
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl md:text-2xl font-semibold">{service.title}</span> {/* Ajusta tamanho da fonte */}
                  </div>
                  <span className="text-2xl font-bold text-orange-500">
                    {open === index ? <FaMinus /> : <FaPlus />} {/* Ícones de mais/menos */}
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    open === index ? 'max-h-96 opacity-100 p-6 pt-0 bg-gray-700' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-300"> {/* Cor do texto ajustada */}
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
