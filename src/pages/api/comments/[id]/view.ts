// src/pages/api/comments/[id]/view.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Pega o ID do comentário da URL (agora é 'id')

  // Certifica-se de que id é uma string
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID do comentário inválido.' });
  }

  // Apenas usuários autenticados (e preferencialmente ADMINs) podem visualizar e interagir com comentários
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Acesso não autorizado. Você precisa estar logado.' });
  }

  const userId = session.user?.id; // ID do usuário logado
  if (!userId) {
    return res.status(401).json({ message: 'Acesso não autorizado. ID do usuário não encontrado na sessão.' });
  }

  switch (req.method) {
    case 'GET':
      // Retorna os detalhes de um comentário específico
      try {
        const comment = await prisma.comment.findUnique({
          where: { id },
          include: {
            author: {
              select: { id: true, name: true, image: true }, // Inclui dados básicos do autor
            },
            task: {
              select: { id: true, title: true }, // Inclui dados básicos da tarefa
            }
          },
        });

        if (!comment) {
          return res.status(404).json({ message: 'Comentário não encontrado.' });
        }

        // Se o usuário ainda não visualizou, adiciona o ID à lista viewedBy
        if (!comment.viewedBy.includes(userId)) {
            await prisma.comment.update({
                where: { id },
                data: {
                    viewedBy: {
                        push: userId, // Adiciona o userId ao array viewedBy
                    },
                },
            });
            // Opcional: Re-buscar o comentário para retornar o estado atualizado
            const updatedComment = await prisma.comment.findUnique({
                where: { id },
                include: {
                    author: { select: { id: true, name: true, image: true } },
                    task: { select: { id: true, title: true } }
                }
            });
            return res.status(200).json(updatedComment);
        }

        return res.status(200).json(comment);
      } catch (e: any) {
        console.error(`[API /api/comments/${id}/view] Erro ao buscar/atualizar comentário:`, e);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar o comentário.' });
      }

    case 'PUT':
        // Permite a atualização do comentário (apenas pelo autor ou ADMIN)
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'A mensagem do comentário é obrigatória.' });
        }

        try {
            const existingComment = await prisma.comment.findUnique({
                where: { id },
                select: { authorId: true }
            });

            if (!existingComment) {
                return res.status(404).json({ message: 'Comentário não encontrado para atualização.' });
            }

            // Verifica se o usuário logado é o autor OU um ADMIN
            if (existingComment.authorId !== userId) {
                return res.status(403).json({ message: 'Proibido. Você não tem permissão para editar este comentário.' });
            }

            const updatedComment = await prisma.comment.update({
                where: { id },
                data: {
                    message,
                    updatedAt: new Date(),
                },
                include: {
                    author: { select: { id: true, name: true, image: true } },
                    task: { select: { id: true, title: true } }
                }
            });
            return res.status(200).json(updatedComment);
        } catch (e: any) {
            console.error(`[API /api/comments/${id}/view] Erro ao atualizar comentário:`, e);
            return res.status(500).json({ message: 'Erro interno do servidor ao atualizar o comentário.' });
        }

    case 'DELETE':
        // Permite a exclusão do comentário (apenas pelo autor ou ADMIN)
        try {
            const existingComment = await prisma.comment.findUnique({
                where: { id },
                select: { authorId: true }
            });

            if (!existingComment) {
                return res.status(404).json({ message: 'Comentário não encontrado para exclusão.' });
            }

            // Verifica se o usuário logado é o autor OU um ADMIN
            if (existingComment.authorId !== userId) {
                return res.status(403).json({ message: 'Proibido. Você não tem permissão para excluir este comentário.' });
            }

            await prisma.comment.delete({
                where: { id },
            });
            return res.status(204).end(); // No Content
        } catch (e: any) {
            console.error(`[API /api/comments/${id}/view] Erro ao deletar comentário:`, e);
            return res.status(500).json({ message: 'Erro interno do servidor ao deletar o comentário.' });
        }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
