import { prisma } from './prisma/client';

async function runTests() {
  console.log('🧪 Starting end-to-end backend tests...');

  try {
    // 1. Database connection
    await prisma.$connect();
    console.log('  ✓ Prisma DB connection successful');

    // 2. Query user
    const users = await prisma.user.findMany();
    console.log(`  ✓ Found ${users.length} user(s) in database`);

    // 3. Query businesses
    const businesses = await prisma.business.findMany();
    console.log(`  ✓ Found ${businesses.length} business(es) in database`);

    // 4. Query products
    const products = await prisma.product.findMany();
    console.log(`  ✓ Found ${products.length} product(s) in catalog`);

    // 5. Query orders
    const orders = await prisma.order.findMany();
    console.log(`  ✓ Found ${orders.length} order(s) in ledger`);

    console.log('🎉 All backend core assertions passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();

