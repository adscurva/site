import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import Footer from '../components/Footer';
import { LinkItem, MenuData } from '../types';
import ContactForm from '../components/ContactForm';
import ContactSection from '../components/ContactSection';
import HeroBannerInternal from '../components/HeroBannerInternal';
import Breadcrumb from '../components/Breadcrumb';
import { Analytics } from '@vercel/analytics/next';
import { MenuInterno } from 'components/MenuInterno';


const prisma = new PrismaClient();

interface ContactPageProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<ContactPageProps> = async () => {
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

const ContactPage: React.FC<ContactPageProps> = ({ menu }) => {
    return (
        <>
            <Head>
                <title>Contato | Curva Engenharia e Arquitetura</title>
                <meta name="description" content="Entre em contato com a Curva Engenharia e Arquitetura para agendar uma consulta, obter um orçamento ou saber mais sobre nossos serviços." />
                <meta name="keywords" content="contato engenharia Belém, orçamento arquitetura, falar com engenheiro, consultoria engenharia, telefone construtora, email Curva Engenharia, endereço Belém-PA" />

                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Contato | Curva Engenharia e Arquitetura" />
                <meta property="og:description" content="Entre em contato e vamos construir seu futuro juntos." />
                <meta property="og:image" content="https://curva-eng.vercel.app/images/contato-og.jpg" />
                <meta property="og:url" content="https://curva-eng.vercel.app/contato" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Entre em Contato | Curva Engenharia" />
                <meta name="twitter:description" content="Tire suas dúvidas e solicite um orçamento." />
                <meta name="twitter:image" content="https://curva-eng.vercel.app/images/contato-og.jpg" />
            </Head>

            <div className="min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="flex-grow bg-gray-50">
                    <Breadcrumb />
                    <HeroBannerInternal
                        imageUrl="/images/aperto-mao.jpg" // Imagem gerada ou sua própria imagem
                        title="Entre em Contato Conosco"
                        subtitle="Estamos aqui para transformar suas ideias em realidade. Preencha o formulário ou use nossos contatos diretos abaixo para dar o próximo passo no seu projeto."
                    />
                    {/* Container principal para o formulário e detalhes de contato */}
                    <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">
                        {/* Formulário de Contato */}
                        <div>
                            <ContactForm />
                        </div>
                        {/* Detalhes de Contato */}
                        <div>
                            <ContactSection />
                        </div>
                    </div>
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ContactPage;
