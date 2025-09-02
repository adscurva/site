import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    // Substitua pelo acesso ao seu banco de dados
    const file = await prisma.file.findUnique({
      where: { id: String(id) },
    });

    if (!file) return res.status(404).json({ error: 'Arquivo não encontrado' });

    // Fetch do arquivo real (Cloudinary ou outro storage)
    const response = await fetch(file.url);
    if (!response.ok) throw new Error('Falha ao baixar o arquivo do storage');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Define headers para download com nome correto
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    res.send(buffer);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao baixar o arquivo' });
  }
}
