const pool = require('../database/config');

const productController = {
  // Get all products with pagination and filtering
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        search,
        minPrice,
        maxPrice,
        rating,
        sortBy = 'newest'
      } = req.query;

      let query = `
        SELECT p.*, 
               COUNT(r.id) as review_count,
               COALESCE(AVG(r.rating), 0) as average_rating
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id
      `;

      const whereConditions = [];
      const queryParams = [];
      let paramCount = 0;

      // Add category filter
      if (category) {
        paramCount++;
        whereConditions.push(`p.category = $${paramCount}`);
        queryParams.push(category);
      }

      // Add search filter
      if (search) {
        paramCount++;
        whereConditions.push(`(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      // Add price range filter
      if (minPrice) {
        paramCount++;
        whereConditions.push(`p.price >= $${paramCount}`);
        queryParams.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        paramCount++;
        whereConditions.push(`p.price <= $${paramCount}`);
        queryParams.push(parseFloat(maxPrice));
      }

      // Add rating filter
      if (rating) {
        paramCount++;
        whereConditions.push(`p.rating >= $${paramCount}`);
        queryParams.push(parseFloat(rating));
      }

      // Build WHERE clause
      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      // Add GROUP BY for aggregation
      query += ` GROUP BY p.id`;

      // Add sorting
      switch (sortBy) {
        case 'price-low':
          query += ` ORDER BY p.price ASC`;
          break;
        case 'price-high':
          query += ` ORDER BY p.price DESC`;
          break;
        case 'rating':
          query += ` ORDER BY average_rating DESC`;
          break;
        case 'popularity':
          query += ` ORDER BY p.sales_count DESC`;
          break;
        case 'newest':
        default:
          query += ` ORDER BY p.created_at DESC`;
          break;
      }

      // Add pagination
      const offset = (page - 1) * limit;
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      queryParams.push(parseInt(limit));

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      queryParams.push(offset);

      // Execute query
      const result = await pool.query(query, queryParams);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM products p';
      if (whereConditions.length > 0) {
        countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        products: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        message: 'Internal server error while fetching products'
      });
    }
  },

  // Get single product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(`
        SELECT p.*, 
               COUNT(r.id) as review_count,
               COALESCE(AVG(r.rating), 0) as average_rating
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      const product = result.rows[0];

      // Get product images
      const imagesResult = await pool.query(
        'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
        [id]
      );

      // Get product variants
      const variantsResult = await pool.query(
        'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY sort_order',
        [id]
      );

      // Get related products
      const relatedResult = await pool.query(`
        SELECT p.*, 
               COUNT(r.id) as review_count,
               COALESCE(AVG(r.rating), 0) as average_rating
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id
        WHERE p.category = $1 AND p.id != $2
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 4
      `, [product.category, id]);

      res.json({
        product: {
          ...product,
          images: imagesResult.rows,
          variants: variantsResult.rows,
          related: relatedResult.rows
        }
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        message: 'Internal server error while fetching product'
      });
    }
  },

  // Create new product (admin only)
  async createProduct(req, res) {
    try {
      const {
        name,
        description,
        price,
        originalPrice,
        category,
        stock,
        sku,
        weight,
        dimensions
      } = req.body;

      const result = await pool.query(`
        INSERT INTO products (name, description, price, original_price, category, stock, sku, weight, dimensions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [name, description, price, originalPrice, category, stock, sku, weight, dimensions]);

      res.status(201).json({
        message: 'Product created successfully',
        product: result.rows[0]
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        message: 'Internal server error while creating product'
      });
    }
  },

  // Update product (admin only)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateFields = req.body;

      // Build dynamic update query
      const setClause = [];
      const values = [];
      let paramCount = 0;

      Object.keys(updateFields).forEach(key => {
        if (key !== 'id') {
          paramCount++;
          setClause.push(`${key} = $${paramCount}`);
          values.push(updateFields[key]);
        }
      });

      if (setClause.length === 0) {
        return res.status(400).json({
          message: 'No fields to update'
        });
      }

      paramCount++;
      values.push(id);

      const query = `
        UPDATE products 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      res.json({
        message: 'Product updated successfully',
        product: result.rows[0]
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        message: 'Internal server error while updating product'
      });
    }
  },

  // Delete product (admin only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      res.json({
        message: 'Product deleted successfully',
        product: result.rows[0]
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        message: 'Internal server error while deleting product'
      });
    }
  },

  // Get product categories
  async getCategories(req, res) {
    try {
      const result = await pool.query(`
        SELECT category, COUNT(*) as product_count
        FROM products
        GROUP BY category
        ORDER BY product_count DESC
      `);

      res.json({
        categories: result.rows
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        message: 'Internal server error while fetching categories'
      });
    }
  }
};

module.exports = productController;
