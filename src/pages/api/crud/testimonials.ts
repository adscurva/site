// src/pages/api/crud/testimonials.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        return res.status(401).json({ message: 'Acesso não autorizado.' });
    }

    // Lógica para obter todos os depoimentos
    if (req.method === 'GET') {
        try {
            const testimonials = await prisma.testimonial.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return res.status(200).json(testimonials);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao buscar depoimentos.' });
        }
    }

    // Lógica para criar ou atualizar um depoimento
    if (req.method === 'POST') {
        const { id, name, type, content } = req.body;
        if (!name || !type || !content) {
            return res.status(400).json({ message: 'Dados inválidos.' });
        }

        try {
            if (id) {
                // Lógica de edição
                const updatedTestimonial = await prisma.testimonial.update({
                    where: { id },
                    data: { name, type, content },
                });
                return res.status(200).json(updatedTestimonial);
            } else {
                // Lógica de criação
                const newTestimonial = await prisma.testimonial.create({
                    data: { name, type, content },
                });
                return res.status(201).json(newTestimonial);
            }
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao salvar o depoimento.' });
        }
    }

    // Lógica para deletar um depoimento
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'ID não fornecido.' });
        }

        try {
            await prisma.testimonial.delete({
                where: { id: String(id) },
            });
            return res.status(200).json({ message: 'Depoimento excluído com sucesso.' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao excluir o depoimento.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}