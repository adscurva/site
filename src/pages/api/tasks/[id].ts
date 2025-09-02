import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Task, TaskStatusEnum } from '../../../types/task';
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const session = await getServerSession(req, res, authOptions);

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'ID da tarefa inválido.' });
    }

    switch (req.method) {
        case 'GET':
            try {
                const task = await prisma.task.findUnique({
                    where: { id },
                    include: {
                        assignedTo: {
                            select: { id: true, name: true },
                        },
                        author: {
                            select: { id: true, name: true },
                        },
                        projeto: { // NOVO: Inclui os dados do projeto
                            select: { id: true, title: true },
                        },
                    },
                });

                if (!task) {
                    return res.status(404).json({ message: 'Tarefa não encontrada.' });
                }
                res.status(200).json(task);
            } catch (e: any) {
                console.error(`[API /api/tasks/${id}] Erro ao buscar tarefa:`, e);
                res.status(500).json({ message: 'Erro interno do servidor ao buscar a tarefa.' });
            }
            break;

        case 'PUT':
            try {
                const { title, description, status, priority, dueDate, assignedToId, projetoId } = req.body;

                // Validação básica dos campos obrigatórios
                if (!title || !status || priority === undefined || !assignedToId) {
                    return res.status(400).json({ message: 'Campos obrigatórios (title, status, priority, assignedToId) faltando.' });
                }

                if (!Object.values(TaskStatusEnum).includes(status)) {
                    return res.status(400).json({ message: 'Status da tarefa inválido.' });
                }
                const validatedStatus = status as TaskStatusEnum;

                // Construir o objeto de dados para o Prisma
                const updateData: {
                    title: string;
                    description?: string | null;
                    status: TaskStatusEnum;
                    priority: number;
                    dueDate?: Date | null;
                    assignedTo: { connect: { id: string } };
                    projeto?: { connect: { id: string } } | { disconnect: boolean };
                } = {
                    title,
                    status: validatedStatus,
                    priority: Number(priority), // Garante que priority seja um número
                    assignedTo: { connect: { id: assignedToId } }, // CORREÇÃO: Usar connect para relacionamento
                };

                // Lida com a descrição (pode ser null)
                if (description !== undefined) {
                    updateData.description = description;
                } else {
                    updateData.description = null; // Garante que se não for fornecido, seja null no DB
                }

                // Lida com a data de vencimento (pode ser null)
                if (dueDate) {
                    updateData.dueDate = new Date(dueDate);
                } else {
                    updateData.dueDate = null;
                }

                // Lida com o relacionamento de projeto (pode ser null ou desconectado)
                if (projetoId) {
                    updateData.projeto = { connect: { id: projetoId } };
                } else {
                    updateData.projeto = { disconnect: true }; // Desconecta se projetoId for null/vazio
                }

                const updatedTask = await prisma.task.update({
                    where: { id },
                    data: updateData, // Usar o objeto updateData construído
                    include: {
                        assignedTo: {
                            select: { id: true, name: true },
                        },
                        author: {
                            select: { id: true, name: true },
                        },
                        projeto: { // Inclui o projeto na resposta após a atualização
                            select: { id: true, title: true },
                        },
                    },
                });
                res.status(200).json(updatedTask);
            } catch (e: any) {
                console.error(`[API /api/tasks/${id}] Erro ao atualizar tarefa:`, e);
                // Tratamento mais específico para erros do Prisma
                if (e.name === 'PrismaClientValidationError') {
                    return res.status(400).json({
                        message: 'Erro de validação nos dados da tarefa. Verifique os campos fornecidos.',
                        details: e.message
                    });
                }
                res.status(500).json({ message: 'Erro interno do servidor ao atualizar a tarefa.', details: e.message });
            }
            break;

        case 'DELETE':
            try {
                await prisma.task.delete({
                    where: { id },
                });
                res.status(204).end();
            } catch (e: any) {
                console.error(`[API /api/tasks/${id}] Erro ao deletar tarefa:`, e);
                res.status(500).json({ message: 'Erro interno do servidor ao deletar a tarefa.' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
