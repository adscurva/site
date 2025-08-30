// src/pages/api/tasks/[id]/comments.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Mudado para 'id' para consistência com o caminho
  const taskId = id as string; // Garante que taskId é string

  if (typeof taskId !== 'string') {
    return res.status(400).json({ message: 'ID da tarefa inválido.' });
  }

  console.log(`\n--- [API /api/tasks/${taskId}/comments] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/${taskId}/comments] Método: ${req.method}`);
  console.log(`[API /api/tasks/${taskId}/comments] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/${taskId}/comments] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/${taskId}/comments] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`--- [API /api/tasks/${taskId}/comments] FIM DOS LOGS GERAIS ---\n`);

  const session = await getServerSession(req, res, authOptions);

  switch (req.method) {
    case 'GET':
      try {
        const comments = await prisma.comment.findMany({
          where: { taskId },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        const commentsWithViewers = await Promise.all(comments.map(async (comment) => {
          if (comment.viewedBy && comment.viewedBy.length > 0) {
            const viewedByUsers = await prisma.user.findMany({
              where: {
                id: {
                  in: comment.viewedBy,
                },
              },
              select: { id: true, name: true },
            });
            return { ...comment, viewedByUsers };
          }
          return { ...comment, viewedByUsers: [] };
        }));

        console.log(`[API /api/tasks/${taskId}/comments] GET executado. ${comments.length} comentários encontrados.`);
        return res.status(200).json(commentsWithViewers);
      } catch (e: any) {
        console.error(`[API /api/tasks/${taskId}/comments] Erro ao buscar comentários para a tarefa ${taskId}:`, e);
        return res.status(500).json({ message: 'Erro ao carregar comentários.', details: e.message });
      }

    case 'POST':
      const sessionPost = await getServerSession(req, res, authOptions);
      if (!sessionPost || (sessionPost.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/tasks/${taskId}/comments] Acesso NEGADO para POST. Motivo: ${!sessionPost ? 'Sessão Ausente' : `Role: ${(sessionPost?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem adicionar comentários.' });
      }

      const { message } = req.body;
      const authorId = sessionPost.user?.id;

      if (!message || !authorId) {
        return res.status(400).json({ message: 'Mensagem e ID do autor são obrigatórios.' });
      }

      try {
        const newComment = await prisma.comment.create({
          data: {
            message,
            authorId,
            taskId,
            viewedBy: [], // Inicialmente, ninguém visualizou
          },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        });
        console.log(`[API /api/tasks/${taskId}/comments] POST executado. Novo comentário ${newComment.id} criado.`);
        const newCommentWithViewers = { ...newComment, viewedByUsers: [] }; // Adicionado para consistência
        return res.status(201).json(newCommentWithViewers);
      } catch (e: any) {
        console.error(`[API /api/tasks/${taskId}/comments] Erro ao criar comentário para a tarefa ${taskId}:`, e);
        return res.status(500).json({ message: 'Erro ao criar comentário.', details: e.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
