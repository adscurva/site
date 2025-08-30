// pages/index.tsx
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Script from 'next/script';
import HeroSlider from '../components/HeroSlider';
import WhatsAppButton from '../components/WhatsAppButton';
import DressesGallery from '../components/DressesGallery';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import LocationMap from '../components/LocationMap';
import Header from 'components/Header';
import { Menu as MenuComponent } from 'components/Menu';
import Hero from 'components/Hero';
import { Analytics } from "@vercel/analytics/next";
import {
    HomePageProps,
    ColecaoProps,
    ColecaoItem,
    MenuData,
    // Importa apenas LinkItem, não o tipo MenuProps da página
    LinkItem
} from '../types/index';
import PromotionsForm from 'components/PromotionsForm';
import FloatingButtons from 'components/FloatingButtons';
import { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import ParallaxBanner from 'components/ParallaxBanner';
import TimelineSection from 'components/TimelineSection';
import ServicesSection from 'components/ServicesSection';
import Footer from 'components/Footer';
import ContactForm from 'components/ContactForm';
import Projetos from 'components/Projetos';

// FUNÇÃO SLUGIFY
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
    try {
        const [banners, menus, testimonials, faqs, colecoes] = await Promise.all([
            prisma.banner.findMany(),
            prisma.menu.findMany(),
            prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } }),
            prisma.colecao.findMany({
                orderBy: {
                    order: 'asc',
                },
                include: {
                    items: {
                        orderBy: [
                            { view: 'desc' },
                            { like: 'desc' },
                        ],
                    },
                },
            }),
        ]);

        const colecoesComSlugs: ColecaoProps[] = colecoes.map((colecao: any) => ({
            ...colecao,
            slug: slugify(colecao.title),
            items: colecao.items.map((item: any) => ({
                ...item,
                slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
            }))
        }));

        const rawMenu: any | null = menus.length > 0 ? menus[0] : null;

        // O tipo do formattedMenu agora corresponde à estrutura esperada
        let formattedMenu: MenuData | null = null;
        if (rawMenu && rawMenu.links && Array.isArray(rawMenu.links)) {
            const links: LinkItem[] = rawMenu.links.map((link: any) => ({
                id: link.id,
                text: link.text,
                url: link.url,
            }));

            formattedMenu = {
                logoUrl: rawMenu.logoUrl || '/images/logo.png',
                links: links,
            };
        }

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)),
                // Passa o objeto formatado diretamente para a prop 'menu'
                menu: JSON.parse(JSON.stringify(formattedMenu)),
                testimonials: JSON.parse(JSON.stringify(testimonials)),
                faqs: JSON.parse(JSON.stringify(faqs)),
                colecoes: JSON.parse(JSON.stringify(colecoesComSlugs)),
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do banco de dados:", error);
        return {
            props: {
                banners: [],
                menu: null,
                testimonials: [],
                faqs: [],
                colecoes: [],
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

export default function Home({ banners, menu, testimonials, faqs, colecoes }: HomePageProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Curva Engenharia e Arquitetura",
        "image": "https://curvaeng.com.br/images/logo.png", // Mantenha ou altere a URL da imagem se precisar
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tv. da Estrela, 46, Marco",
            "addressLocality": "Belém",
            "addressRegion": "PA",
            "postalCode": "66093-065",
            "addressCountry": "BR"
        },
        "url": "https://curvaeng.com.br/",
        "telephone": "+5591985014093",
        "hasMap": "https://www.google.com/maps/place/R.+da+Estrela,+46+-+Marco,+Bel%C3%A9m+-+PA,+66093-065/",
        "areaServed": {
            "@type": "City",
            "name": "Belém"
        },
        "priceRange": "$$", // Exemplo: indicando uma faixa de preço
        "sameAs": [
            "https://www.instagram.com/curvaengenharia/", // Substitua pelo Instagram oficial
            "https://www.linkedin.com/company/curva-engenharia-e-arquitetura" // Substitua pelo Linkedin
        ]
    };

    const [showExitModal, setShowExitModal] = useState(false);

    useEffect(() => {
        const modalShownInSession = sessionStorage.getItem('exitModalShown');

        const handleMouseLeave = (e: MouseEvent) => {
            if (!modalShownInSession) {
                setShowExitModal(true);
                sessionStorage.setItem('exitModalShown', 'true');
            }
        };

        if (typeof window !== 'undefined') {
            document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (typeof window !== 'undefined') {
                document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <>
            <Head>
                <title>Curva Engenharia e Arquitetura | Projetos, Obras e Reformas em Belém-PA</title>
                <meta name="description" content="Especialistas em engenharia civil e arquitetura em Belém-PA. Projetos residenciais, comerciais, obras públicas e design de interiores com inovação e qualidade. Solicite um orçamento!" />
                <meta name="keywords" content="engenharia civil Belém, arquitetura Belém, projetos arquitetônicos, construção civil, reformas residenciais, obras públicas, laudo técnico, design de interiores, gerenciamento de obras, Belém-PA" />

                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Curva Engenharia e Arquitetura | Seu Projeto em Boas Mãos" />
                <meta property="og:description" content="Projetos de engenharia e arquitetura em Belém-PA. Do design de interiores à gestão de obras, transformamos sua ideia em realidade com inovação e confiança." />
                <meta property="og:image" content="https://curvaeng.com.br/images/predios.jpg" />
                <meta property="og:url" content="https://curvaeng.com.br" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Curva Engenharia e Arquitetura" />
                <meta name="twitter:description" content="Projetos e obras em Belém. Soluções completas em engenharia, arquitetura, reformas e design de interiores." />
                <meta name="twitter:image" content="https://curvaeng.com.br/images/predios.jpg" />

                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen">
                <Analytics />
                {/* O componente espera menuData={...}, e a prop 'menu' já tem essa estrutura */}
                <MenuComponent menuData={menu} />
                <HeroSlider banners={banners} />
                <main className="max-w-full mx-auto">
                    <Hero />
                    {/* <DressesGallery colecoes={colecoes} /> */}
                    <Header />
                    <ServicesSection />
                    <ParallaxBanner
                        imageUrl="/images/predios.jpg"
                        title="Vamos iniciar o seu projeto?"
                        subtitle="Estamos lhe esperando!"
                        linkUrl="/contato"
                        buttonText="Entre em contato"
                        position="center"
                    />
                    {/* <TimelineSection /> */}
                    <Projetos />
                    <Testimonials testimonials={testimonials} />
                    <ParallaxBanner
                        imageUrl="/images/aperto-mao.jpg"
                        title="Vamos construir algo incrível juntos?"
                        subtitle="Entre em contato e descubra como podemos transformar seu projeto em realidade com inovação e qualidade."
                        linkUrl="/contato"
                        buttonText="Fale conosco"
                        position="left"
                    />
                    <FAQ faqs={faqs} />
                    {/* <LocationMap /> */}
                    <Footer menuData={menu} />
                </main>
                <WhatsAppButton />
            </div>

            {/* Modal de Saída */}
            {showExitModal && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowExitModal(false);
                        }
                    }}
                >
                    <div
                        className="bg-primary-dark relative rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botão de fechar */}
                        <button
                            onClick={() => setShowExitModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Fechar"
                        >
                            <AiOutlineClose size={24} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}