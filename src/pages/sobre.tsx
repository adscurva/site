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
    ColecaoItem
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
import SobreNos from 'components/SobreNos';
import { MenuInterno } from 'components/MenuInterno';
import Breadcrumb from 'components/Breadcrumb';
import HeroBannerInternal from 'components/HeroBannerInternal';

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

        const menu: any | null = menus.length > 0 ? menus[0] : null;

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)),
                menu: JSON.parse(JSON.stringify(menu)),
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

export default function SobrePage({ banners, menu, testimonials, faqs, colecoes }: HomePageProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Curva Engenharia e Arquitetura",
        "image": "https://curva-eng.vercel.app/images/logo.png",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tv. da Estrela, 46, Marco",
            "addressLocality": "Belém",
            "addressRegion": "PA",
            "postalCode": "66093-065",
            "addressCountry": "BR"
        },
        "url": "https://curva-eng.vercel.app/sobre",
        "telephone": "+5591985014093",
        "hasMap": "https://www.google.com/maps/place/R.+da+Estrela,+46+-+Marco,+Bel%C3%A9m+-+PA,+66093-065/",
        "areaServed": {
            "@type": "City",
            "name": "Belém"
        },
        "priceRange": "$$",
        "sameAs": [
            "https://www.instagram.com/curvaengenharia/",
            "https://www.linkedin.com/company/curva-engenharia-e-arquitetura"
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
                <title>Sobre a Curva Engenharia e Arquitetura | Nossa História e Missão em Belém-PA</title>
                <meta name="description" content="Conheça a Curva Engenharia e Arquitetura. Nossa equipe de especialistas em Belém-PA oferece soluções inovadoras em engenharia civil, arquitetura e gerenciamento de obras, transformando desafios em projetos de sucesso." />
                <meta name="keywords" content="história Curva Engenharia, equipe de engenharia Belém, missão e valores, expertise em construção, projetos de engenharia Belém, arquitetos em Belém-PA, portfólio de obras" />

                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Conheça a Curva Engenharia | História, Missão e Expertise" />
                <meta property="og:description" content="Nossa equipe de especialistas em Belém-PA está pronta para transformar seu projeto em realidade com qualidade, inovação e confiança." />
                <meta property="og:image" content="https://curva-eng.vercel.app/images/aperto-mao.jpg" />
                <meta property="og:url" content="https://curva-eng.vercel.app/sobre" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Sobre a Curva Engenharia e Arquitetura" />
                <meta name="twitter:description" content="Conheça nossa equipe de engenheiros e arquitetos em Belém-PA. Projetos personalizados com foco em inovação e qualidade." />
                <meta name="twitter:image" content="https://curva-eng.vercel.app/images/aperto-mao.jpg" />

                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen">
                <Breadcrumb />
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="max-w-full mx-auto">
                    <HeroBannerInternal
                        imageUrl="https://res.cloudinary.com/dacvhzjxb/image/upload/v1756187489/dresses/argn3tvqnxrumkbycf9h.jpg" // Sua imagem real
                        title="Conheça a Curva Engenharia e Arquitetura"
                        subtitle="Nascemos com a missão de transformar ambientes e concretizar sonhos, unindo expertise técnica, design inovador e um compromisso inabalável com a qualidade e a satisfação do cliente."
                    />
                    <SobreNos />
                    <Testimonials testimonials={testimonials} />
                    <ParallaxBanner
                        imageUrl="/images/aperto-mao.jpg"
                        title="Vamos construir algo incrível juntos?"
                        subtitle="Entre em contato e descubra como podemos transformar seu projeto em realidade com inovação e qualidade."
                        linkUrl="/contato"
                        buttonText="Fale conosco"
                        position="left"
                    />
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
                        className="bg-primary relative rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 scale-100"
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