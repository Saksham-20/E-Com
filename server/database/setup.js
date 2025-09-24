const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  // Debug environment variables
  console.log('🔍 Environment variables:');
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Check if we have DATABASE_URL (Render's preferred format)
  let dbConfig;
  if (process.env.DATABASE_URL) {
    console.log('📡 Using DATABASE_URL for connection');
    dbConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  } else {
    console.log('📡 Using individual DB environment variables');
    dbConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'postgres', // Connect to default database first
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  // Connect to default postgres database to create our database
  const client = new Client(dbConfig);

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
    let dbClientConfig;
    if (process.env.DATABASE_URL) {
      // Use DATABASE_URL but override the database name
      const url = new URL(process.env.DATABASE_URL);
      url.pathname = `/${process.env.DB_NAME || 'luxury_ecommerce'}`;
      dbClientConfig = {
        connectionString: url.toString(),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    } else {
      dbClientConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'luxury_ecommerce',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }
    
    const dbClient = new Client(dbClientConfig);

    await dbClient.connect();
    console.log('✅ Connected to luxury_ecommerce database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    try {
      await dbClient.query(schema);
      console.log('✅ Database schema created successfully');
    } catch (error) {
      if (error.code === '42710') { // Object already exists
        console.log('✅ Database schema already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@luxurystore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminExists = await dbClient.query(
      "SELECT 1 FROM users WHERE email = $1",
      [adminEmail]
    );

    if (adminExists.rows.length === 0) {
      await dbClient.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, is_admin, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [adminEmail, hashedPassword, 'Admin', 'User', true, true]);
      console.log(`✅ Default admin user created (${adminEmail} / ${adminPassword})`);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create Indian jewelry categories
    const categories = [
      { name: 'Necklaces', slug: 'necklaces', description: 'Traditional and modern Indian necklaces', sort_order: 1 },
      { name: 'Earrings', slug: 'earrings', description: 'Elegant Indian earrings and jhumkas', sort_order: 2 },
      { name: 'Bangles & Bracelets', slug: 'bangles-bracelets', description: 'Traditional bangles and modern bracelets', sort_order: 3 },
      { name: 'Rings', slug: 'rings', description: 'Beautiful Indian rings and engagement rings', sort_order: 4 },
      { name: 'Anklets', slug: 'anklets', description: 'Traditional Indian anklets and payals', sort_order: 5 },
      { name: 'Nose Rings', slug: 'nose-rings', description: 'Traditional Indian nose rings and studs', sort_order: 6 },
      { name: 'Mangalsutras', slug: 'mangalsutras', description: 'Sacred mangalsutras and wedding jewelry', sort_order: 7 },
      { name: 'Temple Jewelry', slug: 'temple-jewelry', description: 'Traditional South Indian temple jewelry', sort_order: 8 },
      { name: 'Kundan Sets', slug: 'kundan-sets', description: 'Royal Kundan jewelry sets', sort_order: 9 },
      { name: 'Polki Sets', slug: 'polki-sets', description: 'Traditional Polki diamond sets', sort_order: 10 },
      { name: 'Meenakari', slug: 'meenakari', description: 'Colorful Meenakari enamel jewelry', sort_order: 11 },
      { name: 'Antique Jewelry', slug: 'antique-jewelry', description: 'Vintage and antique Indian jewelry', sort_order: 12 }
    ];

    for (const category of categories) {
      const exists = await dbClient.query(
        "SELECT 1 FROM categories WHERE slug = $1",
        [category.slug]
      );
      
      if (exists.rows.length === 0) {
        await dbClient.query(`
          INSERT INTO categories (name, slug, description, sort_order)
          VALUES ($1, $2, $3, $4)
        `, [category.name, category.slug, category.description, category.sort_order]);
      }
    }
    console.log('✅ Indian jewelry categories created');

    // Optionally run seed data
    if (process.env.RUN_SEED === 'true') {
      console.log('🌱 Running database seed...');
      try {
        const seedDatabase = require('./seed');
        await seedDatabase();
        console.log('✅ Database seeded with sample data');
      } catch (error) {
        console.log('⚠️ Seed failed, continuing without sample data:', error.message);
      }
    }

    await dbClient.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n📋 Next steps:');
    console.log('1. Update frontend API URL to: https://luxury-ecommerce-api.onrender.com');
    console.log('2. Add Cloudinary credentials for image uploads');
    console.log('3. Test your deployment!');

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
