import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  let dbStatus = 'UNKNOWN';
  let dbError: string | null = null;

  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      dbStatus = 'DISCONNECTED';
      dbError = error.message;
    } else {
      dbStatus = 'CONNECTED';
    }
  } catch (err: any) {
    dbStatus = 'DISCONNECTED';
    dbError = err.message || 'Supabase connection error';
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

  return NextResponse.json({
    success: dbStatus === 'CONNECTED',
    data: {
      status: 'UP',
      database: dbStatus,
      supabaseConfigured: Boolean(supabaseUrl),
      supabaseUrlHost: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, '') : 'NOT_CONFIGURED',
      dbError,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}
