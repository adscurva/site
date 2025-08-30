import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { FaHome, FaRegBuilding, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import ZoomableImage from './ZoomableImage'; // Importa o componente ZoomableImage

// Definições de tipo com base no seu schema.prisma e na API
interface ProjetoFoto {
    id: string;
    local: string;
    tipo: string;
    detalhes: string;
    img: string; // URL da imagem
}

interface Projeto {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    order: number;
    publico: boolean; // CORRIGIDO: Agora usa 'publico' para corresponder ao backend
    items: ProjetoFoto[];
}

const Projetos: React.FC = () => {
    const [projects, setProjects] = useState<Projeto[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('todos');
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/crud/projetos", { method: "GET" });
            const data = await res.json();
            if (res.ok && data.success) {
                // CORRIGIDO: Filtro aplicado para 'publico: true'
                const publicProjetos = data.projetos.filter((p: Projeto) => p.publico);
                setProjects(publicProjetos.sort((a: Projeto, b: Projeto) => a.order - b.order));
            } else {
                console.error("Erro ao carregar projetos:", data.message);
            }
        } catch (e) {
            console.error("Erro ao conectar com a API de projetos.", e);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (project: Projeto) => {
        setSelectedProject(project);
        setShowModal(true);
        setCurrentImageIndex(0); // Reinicia o slider
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProject(null);
    };

    const handleNextImage = () => {
        if (selectedProject) {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % selectedProject.items.length
            );
        }
    };

    const handlePrevImage = () => {
        if (selectedProject) {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex - 1 + selectedProject.items.length) % selectedProject.items.length
            );
        }
    };

    // Extrai todas as categorias únicas dos projetos *já filtrados por publico*
    const allCategories = Array.from(new Set(projects.flatMap(p => p.items.map(i => i.tipo))));

    const filteredProjects = activeCategory === 'todos'
        ? projects
        : projects.filter(projeto => projeto.items.some(item => item.tipo === activeCategory));

    // Função para mapear tipo para um ícone
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Residencial':
                return <FaHome size={20} className="mr-2" />;
            case 'Comercial':
                return <FaBuilding size={20} className="mr-2" />;
            case 'Público':
                return <FaRegBuilding size={20} className="mr-2" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 py-16 md:py-24"> {/* Fundo consistente com outros componentes */}
            <div className="container mx-auto px-4 md:px-8">

                {/* Título e Introdução */}
                <div className="text-center mb-12 md:mb-16 max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight"> {/* Estilo aprimorado */}
                        Portfólio de Projetos
                    </h1>
                    <p className="max-w-4xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed"> {/* Texto mais legível */}
                        Cada projeto é uma história de sucesso. Explore nossa galeria de trabalhos e veja como a Curva Engenharia e Arquitetura transforma ideias em realidade, com excelência e inovação.
                    </p>
                </div>

                {/* Botões de Filtro */}
                <div className="flex flex-wrap justify-center gap-4 my-12">
                    <button
                        onClick={() => setActiveCategory('todos')}
                        className={`px-6 py-2 rounded-full font-bold transition-colors duration-300 flex items-center shadow-md ${
                            activeCategory === 'todos' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Todos
                    </button>
                    {allCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2 rounded-full font-bold transition-colors duration-300 flex items-center shadow-md ${
                                activeCategory === category ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {getCategoryIcon(category)} {category}
                        </button>
                    ))}
                </div>

                {/* Galeria de Projetos */}
                {loading ? (
                    <p className="text-center text-gray-600 text-xl py-10">Carregando projetos...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((projeto) => (
                            <div key={projeto.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-102 hover:shadow-xl duration-300"> {/* Cards mais profissionais */}
                                <div className="relative h-60 w-full">
                                    <Image
                                        src={projeto.items[0].img} // Mostra a primeira foto
                                        alt={projeto.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-t-xl transition-transform duration-500 hover:scale-110" // Arredonda só em cima
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">{projeto.title}</h3> {/* Título maior */}
                                    <p className="text-gray-600 text-base leading-relaxed mb-4">{projeto.subtitle}</p> {/* Subtítulo mais legível */}
                                    <button
                                        onClick={() => openModal(projeto)}
                                        className="inline-flex items-center px-5 py-2 bg-orange-500 text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition-colors duration-300"
                                    >
                                        Ver Projeto <span className="ml-2" aria-hidden="true">&rarr;</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chamada para Ação (Call to Action) */}
                <div className="bg-gray-800 rounded-xl shadow-xl p-8 md:p-12 text-center mt-20 md:mt-32 max-w-5xl mx-auto"> {/* CTA com fundo escuro */}
                    <p className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-relaxed"> {/* Texto maior e mais impactante */}
                        Não encontrou o que procura?
                    </p>
                    <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                        Nós criamos uma solução sob medida para você.
                    </p>
                    <a
                        href="/contato"
                        className="inline-block bg-orange-500 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-300 transform hover:-translate-y-1" // Botão mais robusto
                    >
                        Fale Conosco
                    </a>
                </div>

            </div>

            {/* Modal do Projeto */}
            {showModal && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-5xl w-full max-h-[95vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>

                        {/* Botão de fechar */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-200 hover:text-white bg-gray-800/70 p-2 rounded-full transition-colors z-20" // Botão de fechar mais elegante
                            aria-label="Fechar"
                        >
                            <AiOutlineClose size={24} />
                        </button>

                        {/* Slider de Imagens com Zoom */}
                        <div className="relative w-full h-[60vh] md:h-[75vh] mb-6 rounded-lg overflow-hidden flex items-center justify-center bg-gray-200"> {/* Altura responsiva */}
                            <ZoomableImage
                                src={selectedProject.items[currentImageIndex].img}
                                alt={selectedProject.items[currentImageIndex].detalhes}
                            />

                            {/* Botões do slider */}
                            {selectedProject.items.length > 1 && ( // Só mostra botões se houver mais de uma imagem
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition-colors z-30"
                                        aria-label="Imagem anterior"
                                    >
                                        <MdOutlineArrowBackIos size={28} />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/80 transition-colors z-30"
                                        aria-label="Próxima imagem"
                                    >
                                        <MdOutlineArrowForwardIos size={28} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Detalhes do Projeto */}
                        <div className="w-full h-auto">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3"> {/* Título maior e mais forte */}
                                {selectedProject.title}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 mb-4 font-medium"> {/* Subtítulo mais destacado */}
                                {selectedProject.subtitle}
                            </p>
                            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6"> {/* Descrição mais legível */}
                                {selectedProject.description}
                            </p>

                            {/* Detalhes da Foto Atual */}
                            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100"> {/* Estilo aprimorado para detalhes da foto */}
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Detalhes da Imagem</h3>
                                <p className="text-gray-700 font-medium mb-1">
                                    Tipo: <span className="font-normal text-gray-600">{selectedProject.items[currentImageIndex].tipo}</span>
                                </p>
                                <p className="text-gray-700 font-medium mb-1">
                                    Local: <span className="font-normal text-gray-600">{selectedProject.items[currentImageIndex].local}</span>
                                </p>
                                <p className="text-gray-700 font-medium">
                                    Detalhes: <span className="font-normal text-gray-600">{selectedProject.items[currentImageIndex].detalhes}</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Projetos;
