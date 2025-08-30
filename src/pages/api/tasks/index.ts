import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Task, TaskStatusEnum } from '../../../types/task';
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  console.log(`\n--- [API /api/tasks/index] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/index] Método: ${req.method}`);
  console.log(`[API /api/tasks/index] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/index] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/index] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`[API /api/tasks/index] Variável de Ambiente NEXTAUTH_SECRET no runtime da API (início/fim): ${process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...${process.env.NEXTAUTH_SECRET.slice(-5)}` : "NÃO DEFINIDO"}`);
  console.log(`[API /api/tasks/index] Cookies da Requisição: ${req.headers.cookie || 'Nenhum cookie presente'}`);
  console.log(`[API /api/tasks/index] Sessão Recebida (JSON):`, JSON.stringify(session, null, 2));
  if (session) {
    console.log(`[API /api/tasks/index] User ID na sessão:`, session.user?.id);
    console.log(`[API /api/tasks/index] User Role na sessão:`, (session.user as any)?.role);
    console.log(`[API /api/tasks/index] Tipo da User Role:`, typeof (session.user as any)?.role);
  } else {
    console.log(`[API /api/tasks/index] Sessão ausente para a requisição.`);
  }
  console.log(`--- [API /api/tasks/index] FIM DOS LOGS DE SESSAO ---\n`);


  if (!session || (session.user as any)?.role !== 'ADMIN') {
    console.warn(`[API /api/tasks/index] Acesso NEGADO para ${req.method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
    return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem realizar esta operação.' });
  }

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
