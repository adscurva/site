// src/pages/colecoes/[collectionSlug]/[itemSlug].tsx

import { GetServerSideProps } from 'next';
import Home from '../../index';
import { PrismaClient } from '@prisma/client';

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Este getServerSideProps deve ser idêntico ao da página inicial para garantir que todos os dados
    // estejam disponíveis para o componente Home.
    const prisma = new PrismaClient();
    try {
        const [banners, menus, testimonials, faqs, colecoes] = await Promise.all([
            prisma.banner.findMany(), prisma.menu.findMany(),
            prisma.testimonial.findMany(),
            prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } }),
            prisma.colecao.findMany({
                include: { items: true },
            }),
        ]);
        const menu = menus.length > 0 ? menus[0] : null;

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)), menu: JSON.parse(JSON.stringify(menu)),
                testimonials: JSON.parse(JSON.stringify(testimonials)), faqs: JSON.parse(JSON.stringify(faqs)),
                colecoes: JSON.parse(JSON.stringify(colecoes)),
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do banco de dados:", error);
        return { props: { banners: [], menu: null, testimonials: [], faqs: [], colecoes: [], }, };
    } finally {
        await prisma.$disconnect();
    }
};

export default function ItemPage(props: any) {
    // Apenas renderiza o componente Home com as props
    return <Home {...props} />;
}