import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth"; // Importar getServerSession
import { authOptions } from "../auth/[...nextauth]"; // Importar authOptions
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // LOGS DE DEPURACAO GERAIS
  console.log(`\n--- [API /api/crud/faqs] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/crud/faqs] Método: ${req.method}`);
  console.log(`[API /api/crud/faqs] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/crud/faqs] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/crud/faqs] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`[API /api/crud/faqs] Variável de Ambiente NEXTAUTH_SECRET no runtime da API (início/fim): ${process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...${process.env.NEXTAUTH_SECRET.slice(-5)}` : "NÃO DEFINIDO"}`);
  console.log(`[API /api/crud/faqs] Cookies da Requisição: ${req.headers.cookie || 'Nenhum cookie presente'}`);
  console.log(`--- [API /api/crud/faqs] FIM DOS LOGS GERAIS ---\n`);

  // Lógica para lidar com a requisição GET (PÚBLICA)
  if (req.method === 'GET') {
    try {
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      console.log(`[API /api/crud/faqs] GET executado. ${faqs.length} FAQs encontradas.`);
      return res.status(200).json(faqs);
    } catch (error) {
      console.error("[API /api/crud/faqs] Erro ao buscar FAQs:", error);
      return res.status(500).json({ message: 'Erro ao buscar FAQs.' });
    }
  }

  // Para POST, PUT, DELETE, exigimos autenticação ADMIN
  const session = await getServerSession(req, res, authOptions);

  console.log(`[API /api/crud/faqs] Sessão Recebida para ${req.method} (JSON):`, JSON.stringify(session, null, 2));
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    console.warn(`[API /api/crud/faqs] Acesso NEGADO para ${req.method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
    return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem gerenciar FAQs.' });
  }

  if (req.method === 'POST') {
    const { pergunta, resposta } = req.body;
    if (!pergunta || !resposta) {
      return res.status(400).json({ message: 'A pergunta e a resposta são obrigatórias.' });
    }
    try {
      await prisma.fAQ.create({
        data: {
          pergunta,
          resposta,
        },
      });
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      console.log(`[API /api/crud/faqs] POST executado. Nova FAQ criada.`);
      return res.status(200).json(faqs);
    } catch (error) {
      console.error("[API /api/crud/faqs] Erro ao criar a FAQ:", error);
      return res.status(500).json({ message: 'Erro ao criar a FAQ.' });
    }
  } else if (req.method === 'PUT') {
    const { id, pergunta, resposta } = req.body;
    if (!id || !pergunta || !resposta) {
      return res.status(400).json({ message: 'ID, pergunta e resposta são obrigatórios.' });
    }
    try {
      await prisma.fAQ.update({
        where: { id },
        data: {
          pergunta,
          resposta,
        },
      });
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      console.log(`[API /api/crud/faqs] PUT executado. FAQ ${id} atualizada.`);
      return res.status(200).json(faqs);
    } catch (error) {
      console.error("[API /api/crud/faqs] Erro ao atualizar a FAQ:", error);
      return res.status(500).json({ message: 'Erro ao atualizar a FAQ.' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'O ID é obrigatório para a exclusão.' });
    }
    try {
      await prisma.fAQ.delete({
        where: { id },
      });
      const faqs = await prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } });
      console.log(`[API /api/crud/faqs] DELETE executado. FAQ ${id} excluída.`);
      return res.status(200).json(faqs);
    } catch (error) {
      console.error("[API /api/crud/faqs] Erro ao excluir a FAQ:", error);
      return res.status(500).json({ message: 'Erro ao excluir a FAQ.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
