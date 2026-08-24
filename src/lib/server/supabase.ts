import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClientInstance: SupabaseClient | null = null;

/**
 * Server-only Supabase Client.
 * Connects using NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.
 * The secret key is never exposed to the client/browser.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!serverClientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';

    if (!supabaseUrl || !supabaseSecretKey) {
      // Return a safe lazy client instance that will report configuration error on actual query
      serverClientInstance = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseSecretKey || 'placeholder-key',
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
      return serverClientInstance;
    }

    serverClientInstance = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClientInstance;
}

/**
 * Singleton server Supabase instance for Next.js Route Handlers and Services.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseServerClient() as any;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
