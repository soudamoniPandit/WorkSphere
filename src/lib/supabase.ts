import { createClient, SupabaseClient } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

/**
 * Public / Browser Supabase Client.
 * Connects using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * Safe for use in browser contexts.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!clientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    clientInstance = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      publishableKey || 'placeholder-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return clientInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowserClient() as any;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
