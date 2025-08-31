import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        return res.status(401).json({ message: 'Acesso não autorizado.' });
    }

    switch (req.method) {
        case 'GET':
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

        case 'POST':
            // Lógica para criar um novo depoimento
            const { name: postName, type: postType, content: postContent } = req.body;
            if (!postName || !postType || !postContent) {
                return res.status(400).json({ message: 'Dados inválidos para criação.' });
            }
            try {
                const newTestimonial = await prisma.testimonial.create({
                    data: { name: postName, type: postType, content: postContent },
                });
                // Retorna o novo depoimento criado
                return res.status(201).json(newTestimonial);
            } catch (error) {
                return res.status(500).json({ message: 'Erro ao criar o depoimento.' });
            }

        case 'PUT':
            // Lógica para editar um depoimento existente
            const { id: putId, name: putName, type: putType, content: putContent } = req.body;
            if (!putId || !putName || !putType || !putContent) {
                return res.status(400).json({ message: 'Dados inválidos para edição.' });
            }
            try {
                const updatedTestimonial = await prisma.testimonial.update({
                    where: { id: putId },
                    data: { name: putName, type: putType, content: putContent },
                });
                // Retorna o depoimento editado
                return res.status(200).json(updatedTestimonial);
            } catch (error) {
                console.error("Erro ao editar depoimento:", error);
                return res.status(500).json({ message: 'Erro ao editar o depoimento.' });
            }

        case 'DELETE':
            // Lógica para deletar um depoimento
            // A API agora busca o ID no corpo da requisição, conforme o frontend envia
            const { id: deleteId } = req.body;
            if (!deleteId) {
                return res.status(400).json({ message: 'ID não fornecido.' });
            }
            try {
                await prisma.testimonial.delete({
                    where: { id: deleteId },
                });
                return res.status(200).json({ message: 'Depoimento excluído com sucesso.' });
            } catch (error) {
                console.error("Erro ao excluir depoimento:", error);
                return res.status(500).json({ message: 'Erro ao excluir o depoimento.' });
            }

        default:
            // Define os métodos permitidos
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
