// src/pages/api/promotions-subscribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }

    try {
        // Verifica se o email já está cadastrado para evitar duplicatas
        const existingSubscriber = await prisma.subscriber.findUnique({
            where: { email },
        });

        if (existingSubscriber) {
            return res.status(409).json({ message: 'Este email já está cadastrado em nossa newsletter.' });
        }

        // Salva os dados na tabela de subscribers/marketing
        await prisma.subscriber.create({
            data: {
                name,
                email,
                phone,
            },
        });

        // Envia o email de boas-vindas
        await resend.emails.send({
            from: "Curva Engenharia <contato@curvaeng.com.br>", // Altere para seu email verificado
            to: email,
            subject: `Bem-vindo(a) à Newsletter da Curva Engenharia, ${name}!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Bem-vindo(a), ${name}!</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                        .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                        .header img { max-width: 150px; }
                        .content p { margin-bottom: 15px; }
                        .cta-button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #3B82F6; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://res.cloudinary.com/dacvhzjxb/image/upload/v1756158564/dresses/xmwkqh4agbzztujfz3x7.png" alt="Logo Curva Engenharia e Arquitetura" />
                        </div>
                        <div class="content">
                            <p>Olá, ${name}!</p>
                            <p>Seja bem-vindo(a) à nossa newsletter! Agradecemos o seu interesse em acompanhar os projetos e as novidades da <strong>Curva Engenharia e Arquitetura</strong>.</p>
                            <p>A partir de agora, você receberá conteúdos exclusivos sobre nossos cases de sucesso, insights do setor e tendências em engenharia civil e arquitetura.</p>
                            <p>Estamos prontos para transformar sua visão em realidade.</p>
                            <p>Atenciosamente,</p>
                            <p>A equipe Curva Engenharia e Arquitetura.</p>
                            <p><a href="https://curva-eng.vercel.app/projetos" class="cta-button">Ver nosso Portfólio de Projetos</a></p>
                        </div>
                        <div class="footer">
                            <p>Curva Engenharia e Arquitetura - Obras e Projetos em Belém-PA.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return res.status(200).json({ success: true, message: 'Inscrição na newsletter realizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar na newsletter:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}
