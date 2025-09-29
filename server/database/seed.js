const { query } = require('./config');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample users
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1-555-0123',
        is_admin: false,
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1-555-0124',
        is_admin: false,
      },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const exists = await query(
        'SELECT 1 FROM users WHERE email = $1',
        [user.email],
      );

      if (exists.rows.length === 0) {
        await query(`
          INSERT INTO users (email, password_hash, first_name, last_name, phone, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [user.email, hashedPassword, user.first_name, user.last_name, user.phone, true]);
      }
    }
    console.log('✅ Sample users created');

    // Get category IDs
    const categories = await query('SELECT id, slug FROM categories');
    const categoryMap = {};
    categories.rows.forEach(cat => categoryMap[cat.slug] = cat.id);

    // Products will be managed through the admin panel
    console.log('ℹ️  Products will be managed through the admin panel');

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME20',
        name: 'Welcome Discount',
        description: '20% off your first purchase',
        discount_type: 'percentage',
        discount_value: 20,
        minimum_order_amount: 1000,
        usage_limit: 100,
      },
      {
        code: 'LUXURY50',
        name: 'Luxury Savings',
        description: '$50 off orders over $500',
        discount_type: 'fixed',
        discount_value: 50,
        minimum_order_amount: 500,
        usage_limit: 50,
      },
    ];

    for (const coupon of coupons) {
      const exists = await query(
        'SELECT 1 FROM coupons WHERE code = $1',
        [coupon.code],
      );

      if (exists.rows.length === 0) {
        await query(`
          INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order_amount, usage_limit)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          coupon.code, coupon.name, coupon.description,
          coupon.discount_type, coupon.discount_value,
          coupon.minimum_order_amount, coupon.usage_limit,
        ]);
      }
    }
    console.log('✅ Sample coupons created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Your luxury e-commerce store is now ready with:');
    console.log('• Sample users (john.doe@example.com, jane.smith@example.com)');
    console.log('• Admin user (admin@luxury.com / admin123)');
    console.log('• Indian jewelry categories');
    console.log('• Discount coupons');
    console.log('• Empty product catalog (add products via admin panel)');
    console.log('\n🚀 Start your application:');
    console.log('1. Server: npm run dev');
    console.log('2. Client: cd client && npm start');
    console.log('3. Admin: Visit /admin to manage products');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
