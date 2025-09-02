// pages/api/files/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho para seu cliente Prisma
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // Verifica se o usuário está autenticado E se as informações do usuário estão disponíveis na sessão
  if (!session || !session.user || !session.user.id) {
    console.warn('[API /api/files] Acesso NEGADO. Motivo: Sessão ausente ou informações de usuário incompletas.');
    return res.status(401).json({ message: 'Acesso não autorizado. É necessário estar logado e com informações de usuário completas.' });
  }

  switch (req.method) {
    case 'POST':
      // Lógica para CRIAR um novo registro de arquivo
      {
        const { url, filename, mimetype, taskId, projetoId } = req.body;

        // Validação dos dados essenciais
        if (!url || !filename || !mimetype) {
          return res.status(400).json({ message: 'URL, nome do arquivo e tipo MIME são obrigatórios.' });
        }

        try {
          // Cria o novo registro de arquivo no banco de dados
          const newFile = await prisma.file.create({
            data: {
              url,
              filename,
              mimetype,
              uploadedById: session.user.id, // O usuário logado é o responsável por "vincular" este arquivo
              taskId: taskId || null,        // Opcional: vincula à tarefa se fornecido, caso contrário, null
              projetoId: projetoId || null,  // Opcional: vincula ao projeto se fornecido, caso contrário, null
              createdAt: new Date(),
            },
            include: {
              uploadedBy: {
                select: { id: true, name: true },
              },
              task: {
                select: { id: true, title: true }, // Inclui info da tarefa se vinculado
              },
              projeto: {
                select: { id: true, title: true }, // Inclui info do projeto se vinculado
              },
            },
          });

          console.log(`[API /api/files] POST executado. Novo arquivo ${newFile.filename} (${newFile.id}) criado.`);
          return res.status(201).json(newFile); // Retorna o objeto File recém-criado
        } catch (e: any) {
          console.error(`[API /api/files] Erro ao criar registro de arquivo:`, e);
          return res.status(500).json({ message: 'Erro interno do servidor ao criar o registro do arquivo.', error: e.message });
        }
      }

    case 'GET':
      // Lógica para LISTAR todos os arquivos (ou filtrar por taskId/projectId se houver query params)
      {
        try {
          const { taskId, projetoId } = req.query; // Pega filtros dos query parameters

          const whereClause: any = {};
          if (taskId && typeof taskId === 'string') {
            whereClause.taskId = taskId;
          }
          if (projetoId && typeof projetoId === 'string') {
            whereClause.projetoId = projetoId;
          }

          const files = await prisma.file.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined, // Aplica filtro se houver
            orderBy: { createdAt: 'desc' }, // Ordena os arquivos por data de criação (mais recentes primeiro)
            include: {
              uploadedBy: {
                select: { id: true, name: true },
              },
              task: {
                select: { id: true, title: true },
              },
              projeto: {
                select: { id: true, title: true },
              },
            },
          });
          console.log(`[API /api/files] GET executado. ${files.length} arquivos encontrados.`);
          return res.status(200).json(files);
        } catch (error) {
          console.error(`[API /api/files] Erro ao buscar arquivos:`, error);
          return res.status(500).json({ message: 'Erro interno do servidor ao buscar arquivos.' });
        }
      }

    case 'DELETE':
      if ((session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      try {
        const { fileId } = req.body; // espera receber o ID do arquivo
        if (!fileId) {
          return res.status(400).json({ message: 'ID do arquivo é obrigatório.' });
        }
        await prisma.file.delete({ where: { id: fileId } });
        return res.status(200).json({ message: 'Arquivo excluído com sucesso' });
      } catch (err) {
        console.error('[API /api/files] Erro ao excluir arquivo:', err);
        return res.status(500).json({ message: 'Erro ao excluir arquivo', error: err });
      }

    default:
      // Retorna 405 para métodos HTTP não suportados
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ message: `Método ${req.method} não permitido. Use POST ou GET.` });
  }
}
