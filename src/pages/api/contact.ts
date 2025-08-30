// pages/api/contact.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, phone, serviceOfInterest, message } = req.body;

  // Validação básica dos campos obrigatórios
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Nome, e-mail e mensagem são obrigatórios.' });
  }

  try {
    // Salva os dados do contato no banco de dados
    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        serviceOfInterest,
        message,
      },
    });

    // Envia o e-mail de confirmação para o cliente
    await resend.emails.send({
      from: "Curva Engenharia e Arquitetura <contato@curvaeng.com.br>", // Altere esta linha
      to: email,
      subject: `Confirmação de Recebimento - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Confirmação de Contato</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { color: #A9876D; }
            .content p { margin-bottom: 15px; }
            .cta-button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #A9876D; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Curva Engenharia e Arquitetura</h1>
            </div>
            <div class="content">
              <p>Olá, ${name}!</p>
              <p>Agradecemos o seu contato. Recebemos a sua mensagem com sucesso e nossa equipe já está analisando as suas informações. Em breve, entraremos em contato para dar continuidade ao seu projeto.</p>
              <p>Atenciosamente,</p>
              <p>A equipe da Curva Engenharia e Arquitetura.</p>
            </div>
            <div class="footer">
              <p>Este é um e-mail automático. Por favor, não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(201).json({ success: true, contact: newContact, message: 'Mensagem enviada com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao salvar contato no banco de dados ou enviar e-mail:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor ao salvar sua mensagem.' });
  }
}