import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ message: 'ID inválido' });

  switch (req.method) {
    case 'GET':
      try {
        const file = await prisma.file.findUnique({
          where: { id },
          include: {
            projeto: { select: { id: true, title: true } },
            task: { select: { id: true, title: true } },
            uploadedBy: { select: { id: true, name: true } },
          },
        });

        if (!file) return res.status(404).json({ message: 'Arquivo não encontrado' });

        // Se for PDF, podemos redirecionar para a URL diretamente
        if (file.mimetype === 'application/pdf') {
          // Redireciona para o PDF no Cloudinary ou qualquer host externo
          return res
            .setHeader('Content-Disposition', `inline; filename="${file.filename}"`)
            .redirect(file.url);
        }

        // Para outros tipos de arquivo, retornamos JSON normalmente
        return res.status(200).json(file);
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao buscar arquivo', error: err });
      }

    case 'PUT':
      if ((session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      try {
        const { projetoId, taskId } = req.body;
        const updatedFile = await prisma.file.update({
          where: { id },
          data: {
            projetoId: projetoId || null,
            taskId: taskId || null,
          },
          include: {
            projeto: { select: { id: true, title: true } },
            task: { select: { id: true, title: true } },
            uploadedBy: { select: { id: true, name: true } },
          },
        });
        return res.status(200).json(updatedFile);
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao atualizar arquivo', error: err });
      }

    case 'DELETE':
      if ((session.user as any)?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      try {
        await prisma.file.delete({ where: { id } });
        return res.status(200).json({ message: 'Arquivo excluído com sucesso' });
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao excluir arquivo', error: err });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Método ${req.method} não permitido.` });
  }
}
