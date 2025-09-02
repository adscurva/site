import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Task, TaskStatusEnum } from '../../../types/task';
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    try {
      const { projetoId } = req.query; // Pega o projetoId da query string

      const whereClause: any = {};
      if (projetoId && typeof projetoId === 'string') {
        whereClause.projetoId = projetoId;
      }

      const tasks = await prisma.task.findMany({
        where: whereClause, // Aplica o filtro de projeto
        include: {
          author: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
          projeto: { // NOVO: Inclui os dados do projeto
            select: { id: true, title: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.status(200).json(tasks);
    } catch (e: any) {
      console.error(`[API /api/tasks/index] Erro ao buscar tarefas:`, e);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar as tarefas.' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, status, priority, dueDate, assignedToId, authorId, projetoId } = req.body; // NOVO: Pega projetoId do corpo

      if (!title || !status || priority === undefined || !dueDate || !assignedToId || !authorId) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
      }

      if (!Object.values(TaskStatusEnum).includes(status)) {
        return res.status(400).json({ message: 'Status da tarefa inválido.' });
      }
      const validatedStatus = status as TaskStatusEnum;

      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status: validatedStatus as any,
          priority,
          dueDate: new Date(dueDate),
          assignedToId,
          authorId,
          ...(projetoId && { projetoId: projetoId }), // NOVO: Conecta ao projeto se projetoId for fornecido
        },
        include: {
          author: {
            select: { id: true, name: true }
          },
          assignedTo: {
            select: { id: true, name: true }
          },
          projeto: { // NOVO: Inclui o projeto na resposta após a criação
            select: { id: true, title: true },
          },
        }
      });
      res.status(201).json(newTask);
    } catch (e: any) {
      console.error(`[API /api/tasks/index] Erro ao criar tarefa:`, e);
      res.status(500).json({ message: 'Erro interno do servidor ao criar a tarefa.' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
