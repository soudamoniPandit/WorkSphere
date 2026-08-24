const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('--- 1. Testing Database Connection ---');
  console.log('Connecting to:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : 'NO URL');
  
  const startTime = Date.now();
  const userCount = await prisma.user.count();
  const elapsed = Date.now() - startTime;
  console.log(`✅ Successfully connected to Supabase! Current user count in database: ${userCount} (Response time: ${elapsed}ms)`);

  console.log('\n--- 2. Testing User Registration (Freelancer) ---');
  const bcrypt = require('bcrypt');
  const testEmail = 'demo_tester@worksphere.com';
  const testPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // Delete test user if exists from prior test
  await prisma.user.deleteMany({ where: { email: testEmail } });

  const createdUser = await prisma.user.create({
    data: {
      email: testEmail,
      password: hashedPassword,
      fullName: 'Sudha Tester',
      role: 'FREELANCER',
      freelancerProfile: {
        create: {
          title: 'Senior Full Stack Engineer',
          bio: 'Verified test freelancer profile.',
        },
      },
    },
    include: {
      freelancerProfile: true,
    },
  });
  console.log(`✅ Created test user: ${createdUser.email} (ID: ${createdUser.id}, Role: ${createdUser.role})`);

  console.log('\n--- 3. Testing User Login Verification ---');
  const foundUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  
  if (!foundUser) {
    throw new Error('User not found during login check');
  }

  const isMatch = await bcrypt.compare(testPassword, foundUser.password);
  if (!isMatch) {
    throw new Error('Password mismatch');
  }
  console.log(`✅ Login authentication SUCCESSFUL for: ${foundUser.email}`);

  console.log('\n--- 4. Testing Client User Registration ---');
  const clientEmail = 'demo_client@worksphere.com';
  await prisma.user.deleteMany({ where: { email: clientEmail } });

  const createdClient = await prisma.user.create({
    data: {
      email: clientEmail,
      password: hashedPassword,
      fullName: 'Sudha Client',
      role: 'CLIENT',
      clientProfile: {
        create: {
          companyName: 'WorkSphere Labs Inc.',
          description: 'Hiring top tech talent.',
        },
      },
    },
    include: {
      clientProfile: true,
    },
  });
  console.log(`✅ Created test client: ${createdClient.email} (ID: ${createdClient.id}, Role: ${createdClient.role})`);

  console.log('\n========================================');
  console.log('🎉 ALL DATABASE & LOGIN TESTS PASSED 100%!');
  console.log('========================================');
  console.log('You can now log in on mobile with either of these accounts:');
  console.log('Account 1:');
  console.log('  Email: demo_tester@worksphere.com');
  console.log('  Password: Password123!');
  console.log('Account 2:');
  console.log('  Email: demo_client@worksphere.com');
  console.log('  Password: Password123!');
}

main()
  .catch((err) => {
    console.error('❌ Database connection / login test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
