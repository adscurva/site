// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Garante que apenas uma instância do PrismaClient seja criada no ambiente de desenvolvimento
// Isso evita problemas de "hot-reloading" no Next.js
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export default prisma;
