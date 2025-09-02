// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {          // ❌ remove o '?' para obrigar que user exista
      id: string;    // ❌ id obrigatório
      role?: "ADMIN" | "USER" | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;      // ❌ id obrigatório
    role?: "ADMIN" | "USER" | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT type to include custom fields.
   */
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "ADMIN" | "USER" | null; 
    accessToken?: string; 
  }
}