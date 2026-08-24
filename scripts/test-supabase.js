const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

console.log('--- 1. Testing Supabase HTTPS API Connection ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 12)}...` : 'NOT_FOUND');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing in environment variables.');
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

  console.log('\n--- 2. Testing User Registration via Pure Supabase SDK ---');
  const testEmail = 'supabase_tester@worksphere.com';
  const testPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // Clean prior test user
  await supabase.from('users').delete().eq('email', testEmail);

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email: testEmail,
      password: hashedPassword,
      full_name: 'Supabase Tester',
      role: 'FREELANCER',
    })
    .select('id, email, full_name, role')
    .single();

  if (userError || !user) {
    throw new Error(`Failed to insert test user: ${userError?.message}`);
  }

  console.log(`✅ Created test freelancer: ${user.email} (ID: ${user.id})`);

  // Create freelancer profile
  const { data: profile, error: profileError } = await supabase
    .from('freelancer_profiles')
    .insert({
      user_id: user.id,
      title: 'Senior Cloud Engineer',
      bio: 'Pure Supabase SDK integration test.',
      hourly_rate: 85,
    })
    .select('id, title')
    .single();

  if (profileError || !profile) {
    throw new Error(`Failed to insert profile: ${profileError?.message}`);
  }
  console.log(`✅ Created profile: ${profile.title} (ID: ${profile.id})`);

  console.log('\n--- 3. Testing User Authentication & Query ---');
  const { data: authUser, error: authError } = await supabase
    .from('users')
    .select('id, email, password, full_name, role')
    .eq('email', testEmail)
    .single();

  if (authError || !authUser) {
    throw new Error(`User lookup failed: ${authError?.message}`);
  }

  const isPasswordValid = await bcrypt.compare(testPassword, authUser.password);
  if (!isPasswordValid) {
    throw new Error('Password check failed.');
  }

  console.log(`✅ Password comparison & authentication SUCCESSFUL for: ${authUser.email}`);

  console.log('\n======================================================');
  console.log('🎉 PURE SUPABASE CLIENT INTEGRATION VERIFIED 100%!');
  console.log('======================================================');
}

main().catch((err) => {
  console.error('❌ Supabase test failed:', err);
  process.exit(1);
});
