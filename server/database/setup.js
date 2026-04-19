const fs = require('fs');
const path = require('path');
const { pool } = require('./config');
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

  // Use the shared pool from config.js
  console.log('📡 Using shared database pool for connection');

  const runSafeQuery = async (sql, description) => {
    try {
      await pool.query(sql);
      if (description) {
        console.log(`✅ ${description}`);
      }
      return true;
    } catch (error) {
      console.warn(`⚠️ ${description || 'Query'} failed:`, error.message);
      return false;
    }
  };

  const runCompatibilityMigrations = async () => {
    console.log('🔄 Running compatibility migrations...');

    // Users table compatibility for older schemas.
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)", 'Ensured users.email column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)", 'Ensured users.password_hash column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)", 'Ensured users.first_name column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)", 'Ensured users.last_name column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)", 'Ensured users.phone column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE", 'Ensured users.is_admin column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE", 'Ensured users.is_verified column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP", 'Ensured users.created_at column');
    await runSafeQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP", 'Ensured users.updated_at column');

    // Backfill missing emails to avoid auth queries failing on legacy rows.
    await runSafeQuery("UPDATE users SET email = CONCAT('legacy_', id::text, '@legacy.local') WHERE email IS NULL OR TRIM(email) = ''", 'Backfilled missing users.email values');
    await runSafeQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL", 'Ensured users.email unique index');

    // Ensure core product browsing tables exist even on partial/legacy installs.
    await runSafeQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Ensured categories table');

    await runSafeQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        short_description VARCHAR(500),
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        compare_price DECIMAL(10,2),
        sku VARCHAR(100),
        stock_quantity INTEGER DEFAULT 0,
        category_id UUID,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_bestseller BOOLEAN DEFAULT FALSE,
        is_new_arrival BOOLEAN DEFAULT FALSE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Ensured products table');

    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0", 'Ensured products.price column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255)", 'Ensured products.slug column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description VARCHAR(500)", 'Ensured products.short_description column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price DECIMAL(10,2)", 'Ensured products.compare_price column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)", 'Ensured products.sku column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0", 'Ensured products.stock_quantity column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID", 'Ensured products.category_id column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE", 'Ensured products.is_active column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE", 'Ensured products.is_featured column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE", 'Ensured products.is_bestseller column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE", 'Ensured products.is_new_arrival column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255)", 'Ensured products.meta_title column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT", 'Ensured products.meta_description column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP", 'Ensured products.created_at column');
    await runSafeQuery("ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP", 'Ensured products.updated_at column');

    await runSafeQuery(`
      CREATE TABLE IF NOT EXISTS product_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Ensured product_images table');

    await runSafeQuery(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID,
        user_id UUID,
        rating INTEGER,
        title VARCHAR(255),
        comment TEXT,
        is_verified_purchase BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Ensured product_reviews table');

    await runSafeQuery("CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)", 'Ensured products.category_id index');
    await runSafeQuery("CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)", 'Ensured products.is_active index');
    await runSafeQuery("CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)", 'Ensured product_images.product_id index');
    await runSafeQuery("CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id)", 'Ensured product_reviews.product_id index');
  };

  try {
    // Test the pool connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL via shared pool');

    // Always apply schema idempotently so older/partial schemas are upgraded.
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    try {
      console.log('🔄 Applying database schema...');
      await pool.query(schema);
      console.log('✅ Database schema applied successfully');
    } catch (error) {
      console.error('⚠️ Schema apply had issues, continuing with compatibility migrations:', error.message);
      console.error('⚠️ Error code:', error.code);
    }

    await runCompatibilityMigrations();

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping default admin creation');
    }

    try {
      if (adminEmail && adminPassword) {
        // Check if admin user already exists
        const existingAdmin = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND is_admin = $2',
          [adminEmail, true],
        );

        if (existingAdmin.rows.length === 0) {
          const hashedPassword = await bcrypt.hash(adminPassword, 12);

          await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, is_admin, is_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [adminEmail, hashedPassword, 'Admin', 'User', true, true],
          );
          console.log(`✅ Default admin user created for ${adminEmail}`);
        } else {
          console.log('✅ Admin user already exists');
        }
      }
    } catch (error) {
      console.error('❌ Admin user creation failed:', error.message);
      // Don't throw, continue with categories
    }

    // Create default categories
    try {
      const categories = [
        { name: 'Rings', slug: 'rings', description: 'Beautiful rings for every occasion' },
        { name: 'Necklaces', slug: 'necklaces', description: 'Elegant necklaces and pendants' },
        { name: 'Earrings', slug: 'earrings', description: 'Stunning earrings for all styles' },
        { name: 'Bracelets', slug: 'bracelets', description: 'Charming bracelets and bangles' },
        { name: 'Watches', slug: 'watches', description: 'Luxury timepieces' },
      ];

      for (const category of categories) {
        const existingCategory = await pool.query(
          'SELECT id FROM categories WHERE name = $1',
          [category.name],
        );

        if (existingCategory.rows.length === 0) {
          await pool.query(
            'INSERT INTO categories (name, slug, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
            [category.name, category.slug, category.description],
          );
        }
      }
      console.log('✅ Indian jewelry categories created');
    } catch (error) {
      console.error('❌ Category creation failed:', error.message);
      // Don't throw, continue
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Update frontend API URL to: https://luxury-ecommerce-api.onrender.com');
    console.log('2. Add Cloudinary credentials for image uploads');
    console.log('3. Test your deployment!');

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

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
