// pages/politica-de-cookies.tsx

import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import Head from 'next/head';
import {
    MenuData,
    LinkItem
} from '../types/index';
import { MenuInterno } from 'components/MenuInterno';
import Footer from 'components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { Analytics } from '@vercel/analytics/next';

const prisma = new PrismaClient();

interface PoliticaDeCookiesProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<PoliticaDeCookiesProps> = async () => {
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

const PoliticaDeCookies = ({ menu }: PoliticaDeCookiesProps) => {
    return (
        <>
            <Head>
                <title>Política de Cookies | Curva Engenharia e Arquitetura</title>
                <meta name="description" content="Leia nossa Política de Cookies e entenda como utilizamos essas tecnologias para melhorar a sua experiência em nosso site." />
                
                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Política de Cookies da Curva Engenharia" />
                <meta property="og:description" content="Conheça a nossa política de privacidade e cookies. Sua segurança e transparência são nossa prioridade." />
                <meta property="og:image" content="https://curva-eng.vercel.app/images/logo.png" />
                <meta property="og:url" content="https://curva-eng.vercel.app/politica-de-cookies" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Política de Cookies" />
                <meta name="twitter:description" content="Leia sobre como a Curva Engenharia e Arquitetura utiliza cookies em seu site." />
                <meta name="twitter:image" content="https://curva-eng.vercel.app/images/logo.png" />
            </Head>

            <div className="py-16 min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="my-16 flex-grow p-8 max-w-4xl mx-auto">
                    {/* Conteúdo da política de cookies */}
                    <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900">
                        Política de Cookies
                    </h1>
                    <p className="mb-8 text-center text-gray-600">
                        Esta página descreve como a Curva Engenharia e Arquitetura utiliza cookies em seu site.
                    </p>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. O que são Cookies?</h2>
                        <p className="mb-4">
                            Cookies são pequenos arquivos de texto que são armazenados em seu computador ou dispositivo móvel quando você visita um site. Eles são amplamente utilizados para fazer sites funcionarem de forma mais eficiente, bem como para fornecer informações aos proprietários do site.
                        </p>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Como Usamos os Cookies</h2>
                        <p className="mb-4">
                            Utilizamos cookies para diversas finalidades em nosso site, incluindo:
                        </p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <span className="font-medium">Cookies Necessários:</span> Essenciais para o funcionamento básico do site, permitindo que você navegue e utilize os recursos.
                            </li>
                            <li>
                                <span className="font-medium">Cookies de Análise e Desempenho:</span> Para nos ajudar a entender como os visitantes interagem com o site, coletando informações de forma anônima. Isso nos permite melhorar a navegação e o conteúdo.
                            </li>
                            <li>
                                <span className="font-medium">Cookies de Funcionalidade:</span> Para lembrar suas preferências e escolhas, como idioma ou região, proporcionando uma experiência mais personalizada.
                            </li>
                        </ul>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Gerenciando suas Preferências de Cookies</h2>
                        <p className="mb-4">
                            Você tem o direito de decidir se aceita ou rejeita cookies. A maioria dos navegadores web aceita cookies automaticamente, mas você pode modificar as configurações do seu navegador para recusá-los, se preferir.
                        </p>
                        <p>
                            Para mais informações sobre como controlar cookies no seu navegador, visite as páginas de ajuda dos navegadores mais populares:
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            <li>Google Chrome</li>
                            <li>Mozilla Firefox</li>
                            <li>Microsoft Edge</li>
                            <li>Safari</li>
                        </ul>
                    </section>
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Mais Informações</h2>
                        <p>
                            Se você tiver alguma dúvida sobre nossa Política de Cookies, por favor, entre em contato conosco através de nossos canais de atendimento.
                        </p>
                        <p className="mt-4">
                            <Link href="/" className="text-primary hover:underline">
                                Voltar para a página inicial
                            </Link>
                        </p>
                    </section>
                </main>
                <Footer menuData={menu} />
                <WhatsAppButton />
            </div>
        </>
    );
};

export default PoliticaDeCookies;