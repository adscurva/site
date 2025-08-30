// src/pages/api/crud/menu.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const menuData = await prisma.menu.findUnique({
                where: { id: 1 },
            });
            return res.status(200).json(menuData);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar menu" });
        }
    }
    
    // A partir daqui, todas as requisições exigem autenticação
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Acesso não autorizado.' });
    }

    if (req.method === 'POST') {
      const { logoUrl, links } = req.body;

      try {
        const updatedMenu = await prisma.menu.upsert({
          where: { id: 1 },
          update: { logoUrl, links },
          create: { id: 1, logoUrl, links },
        });
        return res.status(200).json(updatedMenu);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao salvar o menu" });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}