// src/pages/api/stats/item-like.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { itemId } = req.body;

    if (!itemId) {
        return res.status(400).json({ message: 'ID do item é obrigatório.' });
    }

    try {
        // Passo 1: Buscar o item para verificar os valores atuais de like e view
        const item = await prisma.colecaoItem.findUnique({
            where: { id: itemId },
            select: {
                like: true,
                view: true,
            },
        });

        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }

        // Passo 2: Preparar os dados para a atualização com base nos valores atuais
        let updateData: { like?: number | { increment: number }; view?: number | { increment: number }; } = {};

        // Se like for null, define para 1. Caso contrário, incrementa.
        if (item.like === null) {
            updateData.like = 1;
        } else {
            updateData.like = { increment: 1 };
        }

        // Se view for null, define para 1. Caso contrário, incrementa.
        if (item.view === null) {
            updateData.view = 1;
        } else {
            updateData.view = { increment: 1 };
        }
        
        // Passo 3: Executar a atualização condicional
        const updatedItem = await prisma.colecaoItem.update({
            where: { id: itemId },
            data: updateData,
            select: {
                id: true,
                like: true,
                view: true,
            }
        });

        res.status(200).json({ success: true, item: updatedItem });
    } catch (error) {
        console.error('Erro ao curtir item:', error);
        res.status(500).json({ message: 'Erro ao processar a requisição.' });
    } finally {
        await prisma.$disconnect();
    }
}