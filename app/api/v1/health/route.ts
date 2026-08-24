import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let dbStatus = 'UNKNOWN';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = 'DISCONNECTED';
    dbError = err.message || 'Database connection error';
  }

  const rawUrl = process.env.DATABASE_URL || '';
  const sanitizedHost = rawUrl.includes('@')
    ? rawUrl.split('@')[1]?.split('/')[0]
    : rawUrl ? 'CUSTOM_URL_SET' : 'NOT_SET';

  return NextResponse.json({
    success: dbStatus === 'CONNECTED',
    data: {
      status: 'UP',
      database: dbStatus,
      dbHost: sanitizedHost,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      dbError,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}

