import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth"; // Importar getServerSession
import { authOptions } from "../auth/[...nextauth]"; // Importar authOptions
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // LOGS DE DEPURACAO GERAIS
  console.log(`\n--- [API /api/crud/projetos] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/crud/projetos] Método: ${method}`);
  console.log(`[API /api/crud/projetos] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/crud/projetos] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/crud/projetos] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`[API /api/crud/projetos] Variável de Ambiente NEXTAUTH_SECRET no runtime da API (início/fim): ${process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...${process.env.NEXTAUTH_SECRET.slice(-5)}` : "NÃO DEFINIDO"}`);
  console.log(`[API /api/crud/projetos] Cookies da Requisição: ${req.headers.cookie || 'Nenhum cookie presente'}`);
  console.log(`--- [API /api/crud/projetos] FIM DOS LOGS GERAIS ---\n`);

  // Lógica para lidar com a requisição GET (PÚBLICA)
  if (method === 'GET') {
    try {
      const projetos = await prisma.projetos.findMany({
        include: {
          items: true,
        },
        orderBy: {
          order: 'asc',
        }
      });
      console.log(`[API /api/crud/projetos] GET executado. ${projetos.length} projetos encontrados.`);
      return res.status(200).json({ success: true, projetos });
    } catch (e: any) {
      console.error("[API /api/crud/projetos] Erro ao buscar projetos:", e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Para POST, PUT, DELETE, exigimos autenticação ADMIN
  const session = await getServerSession(req, res, authOptions);

  console.log(`[API /api/crud/projetos] Sessão Recebida para ${method} (JSON):`, JSON.stringify(session, null, 2));
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    console.warn(`[API /api/crud/projetos] Acesso NEGADO para ${method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
    return res.status(401).json({ success: false, message: 'Acesso não autorizado. Apenas administradores podem gerenciar projetos.' });
  }

  switch (method) {
    case 'POST':
      try {
        // Agora usando 'publico' na desestruturação e no objeto de dados
        const { title, subtitle, description, order, publico, items } = req.body;
        const novoProjeto = await prisma.projetos.create({
          data: {
            title,
            subtitle,
            description,
            order,
            publico: publico ?? false, // Garante que publico seja definido, padrão para false se não enviado
            items: {
              createMany: {
                data: items.map((item: any) => ({
                  local: item.local,
                  tipo: item.tipo,
                  detalhes: item.detalhes,
                  img: item.img,
                })),
              },
            },
          },
        });
        console.log(`[API /api/crud/projetos] POST executado. Novo projeto ${novoProjeto.id} criado.`);
        res.status(201).json({ success: true, projeto: novoProjeto });
      } catch (e: any) {
        console.error("[API /api/crud/projetos] Erro ao criar projeto:", e);
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    case 'PUT':
      try {
        // Agora usando 'publico' na desestruturação e no objeto de dados
        const { id, title, subtitle, description, order, publico, items } = req.body;

        // Exclui todas as fotos existentes para o projeto antes de criar as novas
        await prisma.projetoFoto.deleteMany({
            where: { projetoId: id },
        });

        const projetoAtualizado = await prisma.projetos.update({
          where: { id },
          data: {
            title,
            subtitle,
            description,
            order,
            publico: publico ?? false, // Garante que publico seja definido, padrão para false se não enviado
            items: {
              createMany: {
                data: items.map((item: any) => ({
                  local: item.local,
                  tipo: item.tipo,
                  detalhes: item.detalhes,
                  img: item.img,
                })),
              },
            },
          },
        });
        console.log(`[API /api/crud/projetos] PUT executado. Projeto ${id} atualizado.`);
        res.status(200).json({ success: true, projeto: projetoAtualizado });
      } catch (e: any) {
        console.error("[API /api/crud/projetos] Erro ao atualizar projeto:", e);
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    case 'DELETE':
      try {
        const { id, isItem } = req.body;
        if (isItem) {
          await prisma.projetoFoto.delete({ where: { id } });
          console.log(`[API /api/crud/projetos] DELETE executado. Foto ${id} excluída.`);
          res.status(200).json({ success: true, message: "Foto excluída com sucesso." });
        } else {
          // Antes de deletar o projeto, delete todas as fotos relacionadas
          await prisma.projetoFoto.deleteMany({ where: { projetoId: id } });
          await prisma.projetos.delete({ where: { id } });
          console.log(`[API /api/crud/projetos] DELETE executado. Projeto ${id} excluído.`);
          res.status(200).json({ success: true, message: "Projeto excluído com sucesso." });
        }
      } catch (e: any) {
        console.error("[API /api/crud/projetos] Erro ao deletar projeto:", e);
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
