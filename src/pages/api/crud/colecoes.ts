import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { ColecaoProps, ColecaoItem } from '../../../types';

const prisma = new PrismaClient();

// Função para gerar o slug a partir de uma string
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/-+$/, '');
}

// O tipo auxiliar foi ajustado para refletir a estrutura do retorno do Prisma
// A tipagem já é inferida corretamente, então esta definição é mais para clareza
type PrismaColecaoWithItems = Omit<ColecaoProps, 'slug'> & {
    items: ColecaoItem[];
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Bloco try...finally para garantir que o prisma.$disconnect() seja chamado
    try {
        const { method } = req;

        switch (method) {
            case 'GET':
                try {
                    const colecoes = await prisma.colecao.findMany({
                        include: {
                            items: {
                                // CORRIGIDO: A ordenação dos itens é feita aqui, no backend.
                                orderBy: [
                                    { like: 'desc' }, // Ordena pelos mais curtidos primeiro
                                    { view: 'desc' }, // Em caso de empate, ordena pelos mais visualizados
                                ],
                                select: { // Especifica os campos para incluir de ColecaoItem
                                    id: true,
                                    productMark: true,
                                    productModel: true,
                                    cor: true,
                                    img: true,
                                    slug: true,
                                    colecaoId: true,
                                    size: true,
                                    price: true,
                                    price_card: true,
                                    like: true, // Campo 'like'
                                    view: true,  // Campo 'view'
                                },
                            },
                        },
                        orderBy: {
                            order: {
                                sort: 'asc',
                                nulls: 'last',
                            },
                        },
                    });

                    // Removida a tipagem explícita desnecessária para o parâmetro do .map
                    const colecoesComSlugs: ColecaoProps[] = colecoes.map((colecao) => ({
                        ...colecao,
                        slug: slugify(colecao.title),
                        items: colecao.items.map((item) => ({
                            ...item,
                            slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
                        }))
                    }));

                    return res.status(200).json({ success: true, colecoes: colecoesComSlugs });
                } catch (error) {
                    console.error('Erro ao buscar coleções:', error);
                    return res.status(500).json({ success: false, message: 'Erro ao buscar coleções.' });
                }

            case 'POST':
                try {
                    const { title, subtitle, description, bgcolor, buttonText, buttonUrl, order, items } = req.body as ColecaoProps;

                    const itemsWithSlugs = (items || []).map((item: ColecaoItem) => ({
                        ...item,
                        slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
                    }));

                    const createdColecao = await prisma.colecao.create({
                        data: {
                            title,
                            subtitle,
                            description,
                            bgcolor,
                            buttonText,
                            buttonUrl,
                            order,
                            items: {
                                create: itemsWithSlugs.map(item => ({
                                    ...item,
                                    // Garante que like e view sejam inicializados se não forem fornecidos
                                    like: item.like ?? 0,
                                    view: item.view ?? 0,
                                })),
                            },
                        },
                        include: {
                            items: true,
                        },
                    });
                    return res.status(201).json({ success: true, data: createdColecao });
                } catch (error) {
                    console.error('Erro ao criar coleção:', error);
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
                }

            case 'PUT':
                try {
                    const { id, items, ...rest } = req.body as ColecaoProps & { id: string };

                    if (!id) {
                        return res.status(400).json({ success: false, message: 'ID da coleção é obrigatório para atualização.' });
                    }

                    const updatedColecao = await prisma.colecao.update({
                        where: { id },
                        data: {
                            title: rest.title,
                            subtitle: rest.subtitle,
                            description: rest.description,
                            bgcolor: rest.bgcolor,
                            buttonText: rest.buttonText,
                            buttonUrl: rest.buttonUrl,
                            order: rest.order,
                        },
                    });

                    if (items && Array.isArray(items)) {
                        const itemsWithSlugs = items.map((item: ColecaoItem) => ({
                            ...item,
                            slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
                        }));

                        const transaction = itemsWithSlugs.map((item: ColecaoItem) => {
                            if (item.id) {
                                return prisma.colecaoItem.update({
                                    where: { id: item.id },
                                    data: {
                                        ...item,
                                        like: item.like ?? 0,
                                        view: item.view ?? 0,
                                    },
                                });
                            } else {
                                return prisma.colecaoItem.create({
                                    data: {
                                        ...item,
                                        colecaoId: id,
                                        like: item.like ?? 0,
                                        view: item.view ?? 0,
                                    },
                                });
                            }
                        });
                        await prisma.$transaction(transaction);
                    }

                    const colecaoComItensAtualizados = await prisma.colecao.findUnique({
                        where: { id },
                        include: { items: true },
                    });

                    return res.status(200).json({ success: true, data: colecaoComItensAtualizados });
                } catch (error) {
                    console.error('Erro ao atualizar coleção:', error);
                    return res.status(500).json({ success: false, message: 'Erro ao atualizar coleção.' });
                }

            case 'DELETE':
                try {
                    const { id } = req.query;

                    if (!id || typeof id !== 'string') {
                        return res.status(400).json({ success: false, message: 'ID da coleção é obrigatório para exclusão.' });
                    }

                    await prisma.colecao.delete({
                        where: { id },
                    });

                    return res.status(200).json({ success: true, message: 'Coleção excluída com sucesso.' });
                } catch (error) {
                    console.error('Erro ao excluir coleção:', error);
                    return res.status(500).json({ success: false, message: 'Erro ao excluir coleção.' });
                }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Método ${method} não permitido`);
        }
    } finally {
        await prisma.$disconnect();
    }
}