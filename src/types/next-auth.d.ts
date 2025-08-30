// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in session type to include accessToken and custom user fields.
   */
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      role?: "ADMIN" | "USER" | null; 
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in user type to include custom fields.
   */
  interface User extends DefaultUser {
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