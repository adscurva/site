// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Resend } from 'resend';
import prisma from "../../../../lib/prisma"; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

const resend = new Resend(process.env.RESEND_API_KEY);

// LOGS DE DEPURACAO PARA VARIAVEIS DE AMBIENTE DENTRO DA CONFIGURACAO NEXTAUTH
console.log("--- NEXTAUTH CONFIG LOADED ---");
console.log("process.env.NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
// Log do NEXTAUTH_SECRET truncado para segurança, mas indicando se está presente e tem um valor esperado
console.log("process.env.NEXTAUTH_SECRET (início/fim):", process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...${process.env.NEXTAUTH_SECRET.slice(-5)}` : "NÃO DEFINIDO");
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
console.log("process.env.EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("--- END NEXTAUTH CONFIG LOGS ---");

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier: email, url, provider: { from } }) {
                await resend.emails.send({
                    from: from || "onboarding@resend.dev",
                    to: email,
                    subject: "Link de login para o site Curva Engenharia",
                    html: `Clique neste link para entrar: <a href="${url}">${url}</a>`,
                });
            },
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const userFromDb = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true },
                });
                token.id = user.id;
                (token as any).role = userFromDb?.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = (token as any).id;
                (session.user as any).role = (token as any).role;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    // debug: process.env.NODE_ENV === "development", // Você pode ativar isso para mais logs internos do NextAuth se necessário
};

export default NextAuth(authOptions);
