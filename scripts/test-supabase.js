const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

console.log('--- 1. Testing Supabase HTTPS API Connection ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Prefix:', supabaseKey ? supabaseKey.split('_').slice(0, 2).join('_') + '_...' : 'NOT_FOUND');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Secret Key is missing in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const startTime = Date.now();
  const { data: users, count, error } = await supabase.from('users').select('id, email', { count: 'exact' });
  
  if (error) {
    throw new Error(`Failed to query Supabase: ${error.message} (Code: ${error.code})`);
  }

  const elapsed = Date.now() - startTime;
  console.log(`✅ Successfully connected to Supabase via HTTPS REST API!`);
  console.log(`   User count in database: ${count || (users ? users.length : 0)} (Response time: ${elapsed}ms)`);
}

main().catch((err) => {
  console.error('❌ Supabase test failed:', err);
  process.exit(1);
});
