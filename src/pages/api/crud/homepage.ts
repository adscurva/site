import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    if (req.method === 'GET') {
        try {
            const sections = await prisma.homepageSection.findMany({
                orderBy: {
                    order: 'asc',
                },
            });
            return res.status(200).json(sections);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar as sessões.' });
        }
    }

    if (req.method === 'POST') {
        const { sections } = req.body;
        if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({ error: 'Dados inválidos.' });
        }
        try {
            await prisma.$transaction(
                sections.map((section: any) =>
                    prisma.homepageSection.upsert({
                        where: { id: section.id },
                        update: {
                            order: section.order,
                            content: section.content,
                        },
                        create: {
                            id: section.id,
                            type: section.type,
                            order: section.order,
                            content: section.content,
                        },
                    })
                )
            );
            return res.status(200).json({ message: 'Sessões salvas com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao salvar as sessões.' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'ID da sessão não fornecido.' });
        }
        try {
            await prisma.homepageSection.delete({
                where: { id: String(id) },
            });
            return res.status(200).json({ message: 'Sessão removida com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao remover a sessão.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}