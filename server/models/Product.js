const db = require('../database/config');

class Product {
  static async create(productData) {
    try {
      const {
        name,
        description,
        price,
        originalPrice,
        category,
        brand,
        sku,
        stock,
        images,
        tags,
        specifications,
        variants,
      } = productData;

      const [result] = await db.execute(
        `INSERT INTO products (name, description, price, originalPrice, category, brand, sku, stock, images, tags, specifications, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          name,
          description,
          price,
          originalPrice || null,
          category,
          brand,
          sku,
          stock,
          JSON.stringify(images || []),
          JSON.stringify(tags || []),
          JSON.stringify(specifications || {}),
        ],
      );

      const productId = result.insertId;

      // Create variants if provided
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          await db.execute(
            `INSERT INTO product_variants (productId, name, price, stock, sku, specifications) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              productId,
              variant.name,
              variant.price,
              variant.stock,
              variant.sku,
              JSON.stringify(variant.specifications || {}),
            ],
          );
        }
      }

      return productId;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [id],
      );

      if (rows.length === 0) return null;

      const product = rows[0];

      // Parse JSON fields
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          product.images = [];
        }
      }

      if (product.tags) {
        try {
          product.tags = JSON.parse(product.tags);
        } catch (e) {
          product.tags = [];
        }
      }

      if (product.specifications) {
        try {
          product.specifications = JSON.parse(product.specifications);
        } catch (e) {
          product.specifications = {};
        }
      }

      // Get variants
      const [variants] = await db.execute(
        'SELECT * FROM product_variants WHERE productId = ?',
        [id],
      );

      // Parse variant specifications
      variants.forEach(variant => {
        if (variant.specifications) {
          try {
            variant.specifications = JSON.parse(variant.specifications);
          } catch (e) {
            variant.specifications = {};
          }
        }
      });

      product.variants = variants;

      return product;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        brand,
        search,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = options;

      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      if (brand) {
        whereClause += ' AND brand = ?';
        params.push(brand);
      }

      if (search) {
        whereClause += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (minPrice !== undefined) {
        whereClause += ' AND price >= ?';
        params.push(minPrice);
      }

      if (maxPrice !== undefined) {
        whereClause += ' AND price <= ?';
        params.push(maxPrice);
      }

      if (inStock !== undefined) {
        if (inStock) {
          whereClause += ' AND stock > 0';
        } else {
          whereClause += ' AND stock = 0';
        }
      }

      const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
      const productsQuery = `
        SELECT * FROM products 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const [countResult] = await db.execute(countQuery, params);
      const [products] = await db.execute(productsQuery, [...params, parseInt(limit), offset]);

      // Parse JSON fields for each product
      products.forEach(product => {
        if (product.images) {
          try {
            product.images = JSON.parse(product.images);
          } catch (e) {
            product.images = [];
          }
        }

        if (product.tags) {
          try {
            product.tags = JSON.parse(product.tags);
          } catch (e) {
            product.tags = [];
          }
        }

        if (product.specifications) {
          try {
            product.specifications = JSON.parse(product.specifications);
          } catch (e) {
            product.specifications = {};
          }
        }
      });

      const totalPages = Math.ceil(countResult[0].total / limit);

      return {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: countResult[0].total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const allowedFields = [
        'name', 'description', 'price', 'originalPrice', 'category',
        'brand', 'sku', 'stock', 'images', 'tags', 'specifications',
      ];

      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          if (['images', 'tags', 'specifications'].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push('updatedAt = NOW()');
      values.push(id);

      const [result] = await db.execute(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Delete variants first
        await connection.execute(
          'DELETE FROM product_variants WHERE productId = ?',
          [id],
        );

        // Delete product
        const [result] = await connection.execute(
          'DELETE FROM products WHERE id = ?',
          [id],
        );

        await connection.commit();
        return result.affectedRows > 0;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateStock(id, quantity, operation = 'decrease') {
    try {
      let query;
      if (operation === 'decrease') {
        query = 'UPDATE products SET stock = GREATEST(0, stock - ?), updatedAt = NOW() WHERE id = ?';
      } else if (operation === 'increase') {
        query = 'UPDATE products SET stock = stock + ?, updatedAt = NOW() WHERE id = ?';
      } else {
        query = 'UPDATE products SET stock = ?, updatedAt = NOW() WHERE id = ?';
      }

      const [result] = await db.execute(query, [quantity, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getCategories() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category',
      );

      return rows.map(row => row.category);
    } catch (error) {
      throw error;
    }
  }

  static async getBrands() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand',
      );

      return rows.map(row => row.brand);
    } catch (error) {
      throw error;
    }
  }

  static async getRelatedProducts(categoryId, currentProductId, limit = 4) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM products 
         WHERE category = ? AND id != ? 
         ORDER BY RAND() 
         LIMIT ?`,
        [categoryId, currentProductId, limit],
      );

      // Parse JSON fields
      rows.forEach(product => {
        if (product.images) {
          try {
            product.images = JSON.parse(product.images);
          } catch (e) {
            product.images = [];
          }
        }
      });

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getFeaturedProducts(limit = 8) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM products 
         WHERE featured = true 
         ORDER BY createdAt DESC 
         LIMIT ?`,
        [limit],
      );

      // Parse JSON fields
      rows.forEach(product => {
        if (product.images) {
          try {
            product.images = JSON.parse(product.images);
          } catch (e) {
            product.images = [];
          }
        }
      });

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getProductStats() {
    try {
      const [totalProducts] = await db.execute('SELECT COUNT(*) as total FROM products');
      const [categoryStats] = await db.execute('SELECT category, COUNT(*) as count FROM products GROUP BY category');
      const [stockStats] = await db.execute('SELECT COUNT(*) as outOfStock FROM products WHERE stock = 0');

      return {
        totalProducts: totalProducts[0].total,
        categoryBreakdown: categoryStats,
        outOfStock: stockStats[0].outOfStock,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
