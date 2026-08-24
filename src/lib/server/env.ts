export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-for-development',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || '',
};
