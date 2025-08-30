import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { DefaultJWT } from "next-auth/jwt";

// Estende o tipo de sessão para incluir o ID do usuário e a função
declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role?: "ADMIN" | "CLIENT"; // Inclua outras propriedades personalizadas aqui
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string; // Adicionado aqui para o tipo de usuário
    role?: "ADMIN" | "CLIENT"; // Inclua outras propriedades personalizadas aqui
  }
}

// Estende o tipo do token JWT para incluir o ID do usuário e a função
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role?: "ADMIN" | "CLIENT"; // Inclua outras propriedades personalizadas aqui
  }
}