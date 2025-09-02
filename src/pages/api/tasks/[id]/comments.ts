// src/pages/api/tasks/[id]/comments.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "../../../../../lib/prisma"; // ajuste se necessário

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const taskId = id as string;

  if (typeof taskId !== "string") {
    return res.status(400).json({ message: "ID da tarefa inválido." });
  }

  console.log(`\n--- [API /api/tasks/${taskId}/comments] INÍCIO ---`);
  console.log(`[API /api/tasks/${taskId}/comments] Método: ${req.method}`);
  console.log(`[API /api/tasks/${taskId}/comments] Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/${taskId}/comments] Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/${taskId}/comments] NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
  console.log(`--- [API /api/tasks/${taskId}/comments] FIM DOS LOGS ---\n`);

  const session = await getServerSession(req, res, authOptions);

  switch (req.method) {
    case "GET":
      try {
        const comments = await prisma.comment.findMany({
          where: { taskId },
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        });

        const commentsWithViewers = await Promise.all(
          comments.map(async (comment) => {
            if (comment.viewedBy?.length) {
              const viewedByUsers = await prisma.user.findMany({
                where: { id: { in: comment.viewedBy } },
                select: { id: true, name: true },
              });
              return { ...comment, viewedByUsers };
            }
            return { ...comment, viewedByUsers: [] };
          })
        );

        return res.status(200).json(commentsWithViewers);
      } catch (e: any) {
        console.error(`[API /api/tasks/${taskId}/comments] Erro ao buscar comentários:`, e);
        return res.status(500).json({ message: "Erro ao carregar comentários.", details: e.message });
      }

    case "POST":
      // ✅ Checagem segura
      if (!session?.user?.id) {
        return res.status(401).json({ message: "É necessário estar autenticado para comentar." });
      }

      const { message } = req.body;
      const authorId = session.user.id; // agora seguro, porque checamos acima

      if (!message) {
        return res.status(400).json({ message: "Mensagem é obrigatória." });
      }

      try {
        const newComment = await prisma.comment.create({
          data: { message, authorId, taskId, viewedBy: [] },
          include: { author: { select: { id: true, name: true } } },
        });

        const newCommentWithViewers = { ...newComment, viewedByUsers: [] };
        return res.status(201).json(newCommentWithViewers);
      } catch (e: any) {
        console.error(`[API /api/tasks/${taskId}/comments] Erro ao criar comentário:`, e);
        return res.status(500).json({ message: "Erro ao criar comentário.", details: e.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
