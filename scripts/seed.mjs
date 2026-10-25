process.env.AUTO_SEED = 'false';

const { getDatabase } = await import('../lib/db/index.js');
const { seedDatabase } = await import('../lib/db/seed.js');

const reset = process.argv.includes('--reset');
const database = await getDatabase();

const [{ count }] = await database.query(
  'SELECT count(*)::int AS count FROM users',
);

if (Number(count) > 0 && !reset) {
  console.error(
    'Martify already has data. Run `npm run db:reset` to wipe and reseed.',
  );
  await database.close();
  process.exit(1);
}

if (reset) {
  const tables = [
    'affiliates',
    'notifications',
    'returns',
    'payouts',
    'ledger_entries',
    'payments',
    'order_items',
    'orders',
    'flash_sale_items',
    'flash_sales',
    'coupons',
    'addresses',
    'wishlist_items',
    'reviews',
    'product_variants',
    'products',
    'categories',
    'subscriptions',
    'promotions',
    'banners',
    'platform_settings',
    'sellers',
    'users',
  ];
  await database.exec(
    `TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`,
  );
  console.log('Cleared existing Martify data.');
}

await seedDatabase(database);
await database.close();

console.log('');
console.log('Martify seed complete.');
console.log('  Customer  demo@martify.co.ke / Demo1234!');
console.log('  Seller    amina@sokoyard.co.ke / Seller123!');
console.log('  Seller    brian@technest.co.ke / Seller123!');
console.log('  Admin     admin@martify.co.ke / Admin123!');
console.log('');
console.log('These accounts are for local demos only. Never ship them to production.');
