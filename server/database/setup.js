const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  // Connect to default postgres database to create our database
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default database first
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'luxury_ecommerce']
    );

    if (dbExists.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'luxury_ecommerce'}`);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database already exists');
    }

    await client.end();

    // Now connect to our database and run schema
    const dbClient = new Client({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'luxury_ecommerce',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    await dbClient.connect();
    console.log('✅ Connected to luxury_ecommerce database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await dbClient.query(schema);
    console.log('✅ Database schema created successfully');

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminExists = await dbClient.query(
      "SELECT 1 FROM users WHERE email = $1",
      ['admin@luxury.com']
    );

    if (adminExists.rows.length === 0) {
      await dbClient.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, is_admin, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin@luxury.com', hashedPassword, 'Admin', 'User', true, true]);
      console.log('✅ Default admin user created (admin@luxury.com / admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample categories
    const categories = [
      { name: 'Jewelry', slug: 'jewelry', description: 'Exquisite jewelry collections' },
      { name: 'Watches', slug: 'watches', description: 'Luxury timepieces' },
      { name: 'Accessories', slug: 'accessories', description: 'Premium accessories' },
      { name: 'Home & Living', slug: 'home-living', description: 'Luxury home decor' }
    ];

    for (const category of categories) {
      const exists = await dbClient.query(
        "SELECT 1 FROM categories WHERE slug = $1",
        [category.slug]
      );
      
      if (exists.rows.length === 0) {
        await dbClient.query(`
          INSERT INTO categories (name, slug, description)
          VALUES ($1, $2, $3)
        `, [category.name, category.slug, category.description]);
      }
    }
    console.log('✅ Sample categories created');

    // Create sample brands
    const brands = [
      { name: 'Tiffany & Co.', slug: 'tiffany-co', description: 'Legendary luxury jewelry house' },
      { name: 'Cartier', slug: 'cartier', description: 'Prestigious French luxury goods' },
      { name: 'Rolex', slug: 'rolex', description: 'Swiss luxury watch manufacturer' },
      { name: 'Hermès', slug: 'hermes', description: 'French luxury goods manufacturer' }
    ];

    for (const brand of brands) {
      const exists = await dbClient.query(
        "SELECT 1 FROM brands WHERE slug = $1",
        [brand.slug]
      );
      
      if (exists.rows.length === 0) {
        await dbClient.query(`
          INSERT INTO brands (name, slug, description)
          VALUES ($1, $2, $3)
        `, [brand.name, brand.slug, brand.description]);
      }
    }
    console.log('✅ Sample brands created');

    await dbClient.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run db:seed (to populate with sample products)');
    console.log('2. Start the server: npm run dev');
    console.log('3. Start the client: cd client && npm start');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
