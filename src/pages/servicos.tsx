// pages/servicos.tsx

import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import { Menu as MenuComponent } from 'components/Menu';
import Footer from 'components/Footer';
import ServicosComponent from '../components/Servicos';
import {
    MenuData,
    LinkItem
} from '../types/index';
import { MenuInterno } from 'components/MenuInterno';
import { Analytics } from '@vercel/analytics/next';
import ParallaxBanner from 'components/ParallaxBanner';
import Breadcrumb from 'components/Breadcrumb';
import HeroBannerInternal from 'components/HeroBannerInternal';

const prisma = new PrismaClient();

interface ServicosPageProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<ServicosPageProps> = async () => {
    try {
        const menus = await prisma.menu.findMany();

        const rawMenu: any | null = menus.length > 0 ? menus[0] : null;

        let formattedMenu: MenuData | null = null;
        if (rawMenu && rawMenu.links && Array.isArray(rawMenu.links)) {
            const links: LinkItem[] = rawMenu.links.map((link: any) => ({
                id: link.id,
                text: link.text,
                url: link.url,
                target: link.target || '_self',
            }));

            formattedMenu = {
                logoUrl: rawMenu.logoUrl || '/images/logo.png',
                links: links,
            };
        }

        return {
            props: {
                menu: JSON.parse(JSON.stringify(formattedMenu)),
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do menu:", error);
        return {
            props: {
                menu: null,
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

const ServicosPage: React.FC<ServicosPageProps> = ({ menu }) => {
    return (
        <>
            <Head>
                <title>Projetos e Obras em Belém-PA | Serviços de Engenharia e Arquitetura Curva</title>
                <meta name="description" content="Conheça nossos serviços completos de engenharia civil, arquitetura, design de interiores e gerenciamento de obras em Belém-PA. Projetos residenciais, comerciais e institucionais com foco em inovação e qualidade." />
                <meta name="keywords" content="serviços de engenharia civil, projetos de arquitetura Belém, gerenciamento de obras, reformas, construção, design de interiores Belém, laudo técnico, projetos estruturais, paisagismo, Curva Engenharia e Arquitetura" />

                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Serviços de Engenharia e Arquitetura em Belém-PA" />
                <meta property="og:description" content="Nossa equipe oferece projetos e soluções completas em engenharia e arquitetura para projetos residenciais, comerciais e obras públicas." />
                <meta property="og:image" content="https://curva-eng.vercel.app/images/predios.jpg" />
                <meta property="og:url" content="https://curva-eng.vercel.app/servicos" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Serviços Curva Engenharia e Arquitetura" />
                <meta name="twitter:description" content="Projetos e soluções em engenharia, arquitetura e gestão de obras em Belém-PA. Transforme seu projeto em realidade." />
                <meta name="twitter:image" content="https://curva-eng.vercel.app/images/predios.jpg" />

            </Head>

            <div className="min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="flex-grow">
                    <Breadcrumb />
                    <HeroBannerInternal
                        imageUrl="https://res.cloudinary.com/dacvhzjxb/image/upload/v1756187743/dresses/weck42ticekzxt8fvjs0.jpg" // Sua imagem real
                        title="Soluções Completas para o Seu Projeto"
                        subtitle="Na Curva Engenharia e Arquitetura, unimos expertise técnica e inovação para entregar projetos que transformam ambientes e superam expectativas. Atuamos em múltiplos segmentos, garantindo soluções personalizadas e de alta qualidade para cada necessidade."
                    />
                    <ServicosComponent />
                    <ParallaxBanner
                        imageUrl="/images/predios.jpg"
                        title="Vamos iniciar o seu projeto?"
                        subtitle="Estamos lhe esperando!"
                        linkUrl="/contato"
                        buttonText="Entre em contato"
                        position="center"
                    />
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ServicosPage;