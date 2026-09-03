// Verification script to fetch all major routes and verify HTTP 200 responses
const routes = [
  '/',
  '/buyer',
  '/buyer/cart',
  '/buyer/orders',
  '/merchant',
  '/merchant/products',
  '/merchant/orders',
  '/merchant/growth',
  '/merchant/passport',
  '/merchant/intelligence',
  '/merchant/automations',
  '/merchant/simulation',
  '/proofs',
  '/audit',
  '/demo',
  '/trust'
];

async function verifyAll() {
  console.log('Verifying all RACE routes...\n');
  let passCount = 0;
  let failCount = 0;

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        console.log(`✓ 200 OK: ${route}`);
        passCount++;
      } else {
        console.error(`✕ ${res.status} FAIL: ${route}`);
        failCount++;
      }
    } catch (err) {
      console.error(`✕ ERR: ${route} - ${err.message}`);
      failCount++;
    }
  }

  console.log(`\nSummary: ${passCount}/${routes.length} routes responded with 200 OK (${failCount} failures)`);
  if (failCount > 0) process.exit(1);
}

verifyAll();
