import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Defina a interface para o usuário, correspondente ao que o frontend espera
interface User {
  id: string;
  name: string | null; // A interface foi corrigida para aceitar null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas a requisição GET é suportada para esta rota
  if (req.method === 'GET') {
    try {
      // Busca a lista de usuários da tabela 'User' usando o Prisma
      const prismaUsers = await prisma.user.findMany({
        // Adicione um select ou include para garantir que apenas os campos necessários sejam retornados
        select: {
          id: true,
          name: true,
        },
      });

      // Mapeia os dados do Prisma para o formato esperado pelo frontend
      const users: User[] = prismaUsers.map(user => ({
        id: user.id,
        name: user.name,
      }));

      // Retorna a lista de usuários com status 200 OK
      res.status(200).json({ users });
    } catch (e: any) {
      console.error('Erro ao buscar usuários:', e);
      res.status(500).json({ success: false, message: 'Falha ao carregar a lista de usuários do banco de dados.' });
    }
  } else {
    // Se a requisição não for GET, retorna 405 Method Not Allowed
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
