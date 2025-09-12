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
        is_admin: false
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1-555-0124',
        is_admin: false
      }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const exists = await query(
        "SELECT 1 FROM users WHERE email = $1",
        [user.email]
      );
      
      if (exists.rows.length === 0) {
        await query(`
          INSERT INTO users (email, password_hash, first_name, last_name, phone, is_verified)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [user.email, hashedPassword, user.first_name, user.last_name, user.phone, true]);
      }
    }
    console.log('✅ Sample users created');

    // Get category and brand IDs
    const categories = await query("SELECT id, slug FROM categories");
    const brands = await query("SELECT id, slug FROM brands");

    const categoryMap = {};
    const brandMap = {};
    
    categories.rows.forEach(cat => categoryMap[cat.slug] = cat.id);
    brands.rows.forEach(brand => brandMap[brand.slug] = brand.id);

    // Create sample products
    const products = [
      {
        name: 'Tiffany Setting Engagement Ring',
        slug: 'tiffany-setting-engagement-ring',
        description: 'The iconic Tiffany Setting engagement ring features a brilliant-cut diamond raised above the band in a six-prong setting, allowing maximum light to reflect through the stone.',
        short_description: 'Iconic engagement ring with brilliant-cut diamond',
        price: 15000.00,
        compare_price: 18000.00,
        sku: 'TIFF-ER-001',
        category_id: categoryMap['jewelry'],
        brand_id: brandMap['tiffany-co'],
        stock_quantity: 5,
        is_featured: true,
        is_bestseller: true,
        meta_title: 'Tiffany Setting Engagement Ring - Luxury Diamond Ring',
        meta_description: 'Discover the iconic Tiffany Setting engagement ring with brilliant-cut diamond. Timeless elegance and exceptional craftsmanship.'
      },
      {
        name: 'Cartier Love Bracelet',
        slug: 'cartier-love-bracelet',
        description: 'The Cartier Love bracelet is an iconic piece of jewelry that symbolizes eternal love. Crafted in 18k gold with a unique screw design.',
        short_description: 'Iconic love bracelet in 18k gold',
        price: 8500.00,
        compare_price: 9500.00,
        sku: 'CART-LB-001',
        category_id: categoryMap['jewelry'],
        brand_id: brandMap['cartier'],
        stock_quantity: 8,
        is_featured: true,
        meta_title: 'Cartier Love Bracelet - 18k Gold Luxury Bracelet',
        meta_description: 'The iconic Cartier Love bracelet in 18k gold. A symbol of eternal love and luxury craftsmanship.'
      },
      {
        name: 'Rolex Submariner Date',
        slug: 'rolex-submariner-date',
        description: 'The Rolex Submariner Date is the reference among diving watches. Waterproof to a depth of 300 meters, it features a unidirectional rotatable bezel with Cerachrom insert.',
        short_description: 'Iconic diving watch with date function',
        price: 12500.00,
        compare_price: 14000.00,
        sku: 'ROLEX-SD-001',
        category_id: categoryMap['watches'],
        brand_id: brandMap['rolex'],
        stock_quantity: 3,
        is_featured: true,
        is_bestseller: true,
        meta_title: 'Rolex Submariner Date - Luxury Diving Watch',
        meta_description: 'The iconic Rolex Submariner Date diving watch. Waterproof to 300m with exceptional precision and luxury design.'
      },
      {
        name: 'Hermès Birkin Bag',
        slug: 'hermes-birkin-bag',
        description: 'The Hermès Birkin bag is one of the most coveted luxury handbags in the world. Handcrafted by skilled artisans using the finest leathers and materials.',
        short_description: 'Iconic luxury handbag in premium leather',
        price: 12000.00,
        compare_price: 15000.00,
        sku: 'HERM-BB-001',
        category_id: categoryMap['accessories'],
        brand_id: brandMap['hermes'],
        stock_quantity: 2,
        is_featured: true,
        is_new_arrival: true,
        meta_title: 'Hermès Birkin Bag - Luxury Leather Handbag',
        meta_description: 'The iconic Hermès Birkin bag. Handcrafted luxury handbag using the finest materials and exceptional craftsmanship.'
      },
      {
        name: 'Tiffany & Co. Atlas Ring',
        slug: 'tiffany-atlas-ring',
        description: 'The Tiffany Atlas ring features the iconic Atlas design with Roman numerals. Available in sterling silver, 18k gold, and platinum.',
        short_description: 'Classic Atlas ring with Roman numerals',
        price: 2500.00,
        compare_price: 3000.00,
        sku: 'TIFF-AR-001',
        category_id: categoryMap['jewelry'],
        brand_id: brandMap['tiffany-co'],
        stock_quantity: 12,
        is_bestseller: true,
        meta_title: 'Tiffany Atlas Ring - Classic Roman Numeral Design',
        meta_description: 'The classic Tiffany Atlas ring featuring the iconic Roman numeral design. Available in precious metals.'
      },
      {
        name: 'Cartier Santos Watch',
        slug: 'cartier-santos-watch',
        description: 'The Cartier Santos watch combines aviation heritage with luxury design. Features a square case with exposed screws and a comfortable leather strap.',
        short_description: 'Aviation-inspired luxury timepiece',
        price: 7800.00,
        compare_price: 8500.00,
        sku: 'CART-SW-001',
        category_id: categoryMap['watches'],
        brand_id: brandMap['cartier'],
        stock_quantity: 6,
        is_featured: true,
        meta_title: 'Cartier Santos Watch - Aviation Heritage Timepiece',
        meta_description: 'The Cartier Santos watch combining aviation heritage with luxury design. Square case with exposed screws.'
      }
    ];

    for (const product of products) {
      const exists = await query(
        "SELECT 1 FROM products WHERE slug = $1",
        [product.slug]
      );
      
      if (exists.rows.length === 0) {
        const result = await query(`
          INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, category_id, brand_id, stock_quantity, is_featured, is_bestseller, is_new_arrival, meta_title, meta_description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id
        `, [
          product.name, product.slug, product.description, product.short_description,
          product.price, product.compare_price, product.sku, product.category_id,
          product.brand_id, product.stock_quantity, product.is_featured,
          product.is_bestseller, product.is_new_arrival, product.meta_title,
          product.meta_description
        ]);

        const productId = result.rows[0].id;

        // Add product images
        const images = [
          {
            image_url: `https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center`,
            alt_text: `${product.name} - Main view`,
            is_primary: true
          },
          {
            image_url: `https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop&crop=center`,
            alt_text: `${product.name} - Detail view`,
            is_primary: false
          }
        ];

        for (let i = 0; i < images.length; i++) {
          await query(`
            INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
            VALUES ($1, $2, $3, $4, $5)
          `, [productId, images[i].image_url, images[i].alt_text, i, images[i].is_primary]);
        }
      }
    }
    console.log('✅ Sample products created');

    // Create sample product reviews
    const reviews = [
      {
        product_slug: 'tiffany-setting-engagement-ring',
        user_email: 'john.doe@example.com',
        rating: 5,
        title: 'Absolutely Stunning!',
        comment: 'This ring exceeded all my expectations. The diamond sparkles beautifully and the craftsmanship is impeccable.'
      },
      {
        product_slug: 'cartier-love-bracelet',
        user_email: 'jane.smith@example.com',
        rating: 5,
        title: 'Timeless Elegance',
        comment: 'The Cartier Love bracelet is everything I hoped for. It\'s elegant, comfortable, and the gold quality is exceptional.'
      },
      {
        product_slug: 'rolex-submariner-date',
        user_email: 'john.doe@example.com',
        rating: 5,
        title: 'Perfect Diving Watch',
        comment: 'This Rolex is a masterpiece. The precision, build quality, and classic design make it worth every penny.'
      }
    ];

    for (const review of reviews) {
      const product = await query(
        "SELECT id FROM products WHERE slug = $1",
        [review.product_slug]
      );
      
      const user = await query(
        "SELECT id FROM users WHERE email = $1",
        [review.user_email]
      );

      if (product.rows.length > 0 && user.rows.length > 0) {
        const exists = await query(
          "SELECT 1 FROM product_reviews WHERE product_id = $1 AND user_id = $2",
          [product.rows[0].id, user.rows[0].id]
        );

        if (exists.rows.length === 0) {
          await query(`
            INSERT INTO product_reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            product.rows[0].id, user.rows[0].id, review.rating,
            review.title, review.comment, true, true
          ]);
        }
      }
    }
    console.log('✅ Sample reviews created');

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME20',
        name: 'Welcome Discount',
        description: '20% off your first purchase',
        discount_type: 'percentage',
        discount_value: 20,
        minimum_order_amount: 1000,
        usage_limit: 100
      },
      {
        code: 'LUXURY50',
        name: 'Luxury Savings',
        description: '$50 off orders over $500',
        discount_type: 'fixed',
        discount_value: 50,
        minimum_order_amount: 500,
        usage_limit: 50
      }
    ];

    for (const coupon of coupons) {
      const exists = await query(
        "SELECT 1 FROM coupons WHERE code = $1",
        [coupon.code]
      );
      
      if (exists.rows.length === 0) {
        await query(`
          INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order_amount, usage_limit)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          coupon.code, coupon.name, coupon.description,
          coupon.discount_type, coupon.discount_value,
          coupon.minimum_order_amount, coupon.usage_limit
        ]);
      }
    }
    console.log('✅ Sample coupons created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Your luxury e-commerce store is now ready with:');
    console.log('• Sample users (john.doe@example.com, jane.smith@example.com)');
    console.log('• Luxury products from top brands');
    console.log('• Sample reviews and ratings');
    console.log('• Discount coupons');
    console.log('\n🚀 Start your application:');
    console.log('1. Server: npm run dev');
    console.log('2. Client: cd client && npm start');

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
