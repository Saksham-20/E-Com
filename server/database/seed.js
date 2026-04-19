const bcrypt = require('bcryptjs');
const { query } = require('./config');
const { seedCategories, seedProducts } = require('./catalogSeedData');
require('dotenv').config();

async function ensureSampleUsers() {
  const users = [
    {
      email: 'john.doe@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1-555-0123',
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+1-555-0124',
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await query(
      `
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          phone,
          is_verified,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        ON CONFLICT (email)
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          phone = EXCLUDED.phone,
          updated_at = NOW()
      `,
      [
        user.email,
        hashedPassword,
        user.first_name,
        user.last_name,
        user.phone,
      ],
    );
  }

  console.log('✅ Sample users created');
}

async function ensureCategories() {
  const categoryMap = {};

  for (const category of seedCategories) {
    const result = await query(
      `
        INSERT INTO categories (
          name,
          slug,
          description,
          sort_order,
          is_active,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, true, NOW(), NOW())
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order,
          is_active = true,
          updated_at = NOW()
        RETURNING id, slug
      `,
      [
        category.name,
        category.slug,
        category.description,
        category.sortOrder || 0,
      ],
    );

    categoryMap[result.rows[0].slug] = result.rows[0].id;
  }

  console.log(`✅ ${seedCategories.length} catalog categories ready`);

  return categoryMap;
}

async function ensureSeededProducts(categoryMap) {
  for (const product of seedProducts) {
    const categoryId = categoryMap[product.categorySlug];

    if (!categoryId) {
      throw new Error(`Missing category for slug "${product.categorySlug}"`);
    }

    const productResult = await query(
      `
        INSERT INTO products (
          name,
          slug,
          description,
          short_description,
          price,
          compare_price,
          sku,
          weight,
          dimensions,
          category_id,
          is_active,
          is_featured,
          is_bestseller,
          is_new_arrival,
          stock_quantity,
          low_stock_threshold,
          meta_title,
          meta_description,
          attributes,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, true, $11, $12, $13, $14, $15,
          $16, $17, $18::jsonb, NOW(), NOW()
        )
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          short_description = EXCLUDED.short_description,
          price = EXCLUDED.price,
          compare_price = EXCLUDED.compare_price,
          sku = EXCLUDED.sku,
          weight = EXCLUDED.weight,
          dimensions = EXCLUDED.dimensions,
          category_id = EXCLUDED.category_id,
          is_active = EXCLUDED.is_active,
          is_featured = EXCLUDED.is_featured,
          is_bestseller = EXCLUDED.is_bestseller,
          is_new_arrival = EXCLUDED.is_new_arrival,
          stock_quantity = EXCLUDED.stock_quantity,
          low_stock_threshold = EXCLUDED.low_stock_threshold,
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          attributes = EXCLUDED.attributes,
          updated_at = NOW()
        RETURNING id
      `,
      [
        product.name,
        product.slug,
        product.description,
        product.shortDescription,
        product.price,
        product.comparePrice,
        product.sku,
        product.weight,
        product.dimensions,
        categoryId,
        product.isFeatured,
        product.isBestseller,
        product.isNewArrival,
        product.stockQuantity,
        product.lowStockThreshold || 5,
        product.metaTitle,
        product.metaDescription,
        JSON.stringify(product.attributes || {}),
      ],
    );

    const productId = productResult.rows[0].id;

    await query('DELETE FROM product_images WHERE product_id = $1', [productId]);

    for (const [index, image] of product.images.entries()) {
      await query(
        `
          INSERT INTO product_images (
            product_id,
            image_url,
            alt_text,
            sort_order,
            is_primary,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW())
        `,
        [
          productId,
          image.imageUrl,
          image.altText,
          index,
          index === 0,
        ],
      );
    }
  }

  console.log(`✅ ${seedProducts.length} starter products ready`);
}

async function ensureCoupons() {
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
      code: 'ECOM7500',
      name: 'Jewelry Event Credit',
      description: 'Flat Rs. 7,500 off premium jewelry orders',
      discount_type: 'fixed',
      discount_value: 7500,
      minimum_order_amount: 85000,
      usage_limit: 50,
    },
  ];

  for (const coupon of coupons) {
    await query(
      `
        INSERT INTO coupons (
          code,
          name,
          description,
          discount_type,
          discount_value,
          minimum_order_amount,
          usage_limit,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (code)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          discount_type = EXCLUDED.discount_type,
          discount_value = EXCLUDED.discount_value,
          minimum_order_amount = EXCLUDED.minimum_order_amount,
          usage_limit = EXCLUDED.usage_limit,
          updated_at = NOW()
      `,
      [
        coupon.code,
        coupon.name,
        coupon.description,
        coupon.discount_type,
        coupon.discount_value,
        coupon.minimum_order_amount,
        coupon.usage_limit,
      ],
    );
  }

  console.log('✅ Sample coupons created');
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    await ensureSampleUsers();
    const categoryMap = await ensureCategories();
    await ensureSeededProducts(categoryMap);
    await ensureCoupons();

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Your ECOM catalog is now ready with:');
    console.log(`• ${seedCategories.length} jewelry categories`);
    console.log(`• ${seedProducts.length} seeded luxury products`);
    console.log('• Sample customer accounts');
    console.log('• Welcome and event coupons');

    if (process.env.ADMIN_EMAIL) {
      console.log(`• Admin account configured for ${process.env.ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase().catch(() => {
    process.exit(1);
  });
}

module.exports = seedDatabase;
