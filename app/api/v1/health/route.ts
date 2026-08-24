import { NextResponse } from 'next/server';
import { supabase } from '@/lib/server/supabase';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const hasSecretKey = Boolean(process.env.SUPABASE_SECRET_KEY);
  const hasPublishableKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return NextResponse.json({
    success: dbStatus === 'CONNECTED',
    data: {
      status: 'UP',
      database: dbStatus,
      supabaseUrlConfigured: Boolean(supabaseUrl),
      supabaseSecretKeyConfigured: hasSecretKey,
      supabasePublishableKeyConfigured: hasPublishableKey,
      dbError,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}
