// src/pages/api/tasks/[id]/mark-viewed.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query; // PEGA O 'id' DA URL

  if (Array.isArray(id)) {
    id = id[0];
  }

  if (typeof id !== 'string' || !id) {
    console.error('[API /api/tasks/[id]/mark-viewed] Erro: ID da tarefa inválido ou ausente.');
    return res.status(400).json({ message: 'ID da tarefa inválido ou ausente.' });
  }

  const session = await getServerSession(req, res, authOptions);

  // Alteração: Agora qualquer usuário autenticado pode marcar como visualizado.
  // A restrição para 'ADMIN' foi removida.
  if (!session) {
    console.warn(`[API /api/tasks/${id}/mark-viewed] Acesso NEGADO: Sessão ausente.`);
    return res.status(401).json({ message: 'Acesso não autorizado. É necessário estar logado.' });
  }

  const userId = session.user?.id;
  if (!userId) {
    console.error(`[API /api/tasks/${id}/mark-viewed] Erro: ID do usuário ausente na sessão.`);
    return res.status(400).json({ message: 'ID do usuário ausente.' });
  }

  console.log(`\n--- [API /api/tasks/${id}/mark-viewed] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/${id}/mark-viewed] Método: ${req.method}`);
  console.log(`[API /api/tasks/${id}/mark-viewed] Usuário: ${userId}`);
  console.log(`--- [API /api/tasks/${id}/mark-viewed] FIM DOS LOGS GERAIS ---\n`);


  if (req.method === 'POST') {
    try {
      // Busca a tarefa e seus comentários para garantir que o comentário existe
      const task = await prisma.task.findUnique({
        where: { id: id },
        include: { comments: true },
      });

      if (!task) {
        console.warn(`[API /api/tasks/${id}/mark-viewed] Tarefa não encontrada com ID: ${id}`);
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      let updatedCount = 0;
      // Itera sobre cada comentário e atualiza APENAS se o userId não estiver lá
      for (const comment of task.comments) {
        if (!comment.viewedBy.includes(userId)) {
          await prisma.comment.update({
            where: { id: comment.id },
            data: {
              viewedBy: {
                push: userId // Adiciona o userId ao array viewedBy
              }
            }
          });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`[API /api/tasks/${id}/mark-viewed] Sucesso: ${updatedCount} comentários atualizados para o usuário ${userId}.`);
      } else {
        console.log(`[API /api/tasks/${id}/mark-viewed] Nenhum comentário novo para atualizar para o usuário ${userId}.`);
      }

      return res.status(200).json({ message: 'Visualização registrada com sucesso.' });
    } catch (error: any) {
      console.error(`[API /api/tasks/${id}/mark-viewed] Erro ao registrar visualização para a tarefa ${id} pelo usuário ${userId}:`, error);
      return res.status(500).json({ message: 'Erro interno do servidor ao registrar visualização.', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
