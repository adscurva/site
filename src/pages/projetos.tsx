import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import Footer from '../components/Footer';
import ProjetosComponent from '../components/Projetos'; // Renomeado para evitar conflito com o nome da página
import HeroBannerInternal from '../components/HeroBannerInternal'; // Importa o novo banner interno
import {
    MenuData,
    LinkItem
} from '../types/index';
import { Analytics } from '@vercel/analytics/next';
import Breadcrumb from '../components/Breadcrumb';
import { MenuInterno } from '../components/MenuInterno'; // Ajuste o caminho se necessário

const prisma = new PrismaClient();

interface ProjetosPageProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<ProjetosPageProps> = async () => {
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

const ProjetosPage: React.FC<ProjetosPageProps> = ({ menu }) => {
    return (
        <>
            <Head>
                <title>Portfólio de Projetos | Engenharia, Arquitetura e Reformas em Belém-PA</title>
                <meta name="description" content="Explore nosso portfólio de projetos de engenharia e arquitetura em Belém-PA. Veja nossos cases de sucesso em projetos residenciais, comerciais, institucionais e de obras públicas. Experiência e qualidade comprovadas!" />
                <meta name="keywords" content="portfólio engenharia Belém, projetos de arquitetura, cases de sucesso, projetos residenciais Belém, obras comerciais, projetos governamentais, reformas e construção, projetos concluídos, galeria de obras" />

                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Portfólio de Projetos | Curva Engenharia e Arquitetura" />
                <meta property="og:description" content="Conheça nossos projetos em Belém-PA. Do design de interiores à gestão de obras, veja como transformamos ideias em realidade." />
                <meta property="og:image" content="https://curva-eng.vercel.app/images/portfolio.jpg" /> {/* Verifique esta URL, ou use uma imagem específica do projeto */}
                <meta property="og:url" content="https://curva-eng.vercel.app/projetos" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Portfólio de Projetos Concluídos" />
                <meta name="twitter:description" content="Veja nossos projetos de sucesso em engenharia, arquitetura e reformas em Belém-PA." />
                <meta name="twitter:image" content="https://curva-eng.vercel.app/images/portfolio.jpg" /> {/* Verifique esta URL */}
            </Head>


            <div className="min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="flex-grow">
                    <Breadcrumb />
                    <HeroBannerInternal
                        imageUrl="https://res.cloudinary.com/dacvhzjxb/image/upload/v1756202307/dresses/cld96tpxnlfwhoe4hjxt.jpg" // Substitua pela imagem real que você gerar
                        title="Nosso Portfólio de Projetos"
                        subtitle="Explore nossos projetos de engenharia e arquitetura, e veja como transformamos ideias em realidade com excelência e inovação."
                    />
                    <ProjetosComponent /> {/* Seu componente de projetos */}
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ProjetosPage;
