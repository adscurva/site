// src/pages/api/crud/banner.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth"; // Importar getServerSession
import { authOptions } from "../auth/[...nextauth]"; // Importar authOptions
import prisma from "../../../../lib/prisma"; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // LOGS DE DEPURACAO GERAIS
  console.log(`\n--- [API /api/crud/banner] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/crud/banner] Método: ${req.method}`);
  console.log(`[API /api/crud/banner] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/crud/banner] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/crud/banner] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`[API /api/crud/banner] Variável de Ambiente NEXTAUTH_SECRET no runtime da API (início/fim): ${process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...${process.env.NEXTAUTH_SECRET.slice(-5)}` : "NÃO DEFINIDO"}`);
  console.log(`[API /api/crud/banner] Cookies da Requisição: ${req.headers.cookie || 'Nenhum cookie presente'}`);
  console.log(`--- [API /api/crud/banner] FIM DOS LOGS GERAIS ---\n`);

  // Lógica para lidar com a requisição GET (PÚBLICA)
  if (req.method === 'GET') {
    try {
      const bannerData = await prisma.banner.findUnique({
        where: { id: 1 }, // Assumindo um único registro de banner com ID 1
      });
      console.log(`[API /api/crud/banner] GET executado. Dados do banner: ${bannerData ? 'presentes' : 'ausentes'}.`);
      return res.status(200).json(bannerData);
    } catch (error) {
      console.error("[API /api/crud/banner] Erro ao buscar dados do banner:", error);
      return res.status(500).json({ message: "Erro ao buscar dados do banner" });
    }
  }

  // Para POST, exigimos autenticação ADMIN
  const session = await getServerSession(req, res, authOptions);

  console.log(`[API /api/crud/banner] Sessão Recebida para POST (JSON):`, JSON.stringify(session, null, 2));
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    console.warn(`[API /api/crud/banner] Acesso NEGADO para ${req.method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
    return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem gerenciar banners.' });
  }

  // Lógica para lidar com a requisição POST (salvar/atualizar banner)
  if (req.method === 'POST') {
    const { banners } = req.body;

    // Verifique se os dados estão sendo recebidos corretamente
    console.log('[API /api/crud/banner] Dados recebidos para salvar o banner:', { banners });

    try {
      const updatedBanners = await prisma.banner.upsert({
        where: { id: 1 }, // Assumindo um único registro de banner com ID 1
        update: { banners },
        create: { id: 1, banners },
      });
      console.log(`[API /api/crud/banner] POST executado. Banner atualizado/criado.`);
      return res.status(200).json(updatedBanners);
    } catch (error) {
      console.error("[API /api/crud/banner] Erro ao salvar os banners:", error);
      return res.status(500).json({ message: "Erro ao salvar os banners" });
    }
  }

  // Se o método não for GET nem POST, retorna 405
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
