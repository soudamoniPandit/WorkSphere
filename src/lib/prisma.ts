import { PrismaClient } from '@prisma/client';

const rawDbUrl = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^["']|["']$/g, '').trim()
  : undefined;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: rawDbUrl
      ? {
          db: {
            url: rawDbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


