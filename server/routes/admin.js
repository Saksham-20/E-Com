const express = require('express');
const { query } = require('../database/config');
const { authenticateToken } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply admin auth to all routes
router.use(authenticateToken, adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get total products
    const totalProducts = await pool.query('SELECT COUNT(*) as count FROM products');
    
    // Get total orders
    const totalOrders = await pool.query('SELECT COUNT(*) as count FROM orders');
    
    // Get total users
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_admin = false');
    
    // Get total revenue
    const totalRevenue = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE status IN ('delivered', 'shipped', 'processing')
    `);
    
    // Get recent orders
    const recentOrders = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    // Get low stock products
    const lowStockProducts = await pool.query(`
      SELECT * FROM products 
      WHERE inventory_quantity <= low_stock_threshold 
      AND is_active = true
      ORDER BY inventory_quantity ASC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalProducts: parseInt(totalProducts.rows[0].count),
        totalOrders: parseInt(totalOrders.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalRevenue: parseFloat(totalRevenue.rows[0].revenue)
      },
      recentOrders: recentOrders.rows,
      lowStockProducts: lowStockProducts.rows
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products for admin
// @access  Admin
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        col.name as collection_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN collections col ON p.collection_id = col.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      queryParams.push(category);
    }

    if (status) {
      paramCount++;
      query += ` AND p.is_active = $${paramCount}`;
      queryParams.push(status === 'active');
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const products = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const countParams = [];
    paramCount = 0;

    if (search) {
      paramCount++;
      countQuery += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      countQuery += ` AND c.slug = $${paramCount}`;
      countParams.push(category);
    }

    if (status) {
      paramCount++;
      countQuery += ` AND p.is_active = $${paramCount}`;
      countParams.push(status === 'active');
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      products: products.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.rows[0].total / limit),
        totalItems: parseInt(totalCount.rows[0].total),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Admin
router.post('/products', [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isInt().withMessage('Category ID must be a valid integer'),
  body('sku').trim().notEmpty().withMessage('SKU is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, shortDescription, price, comparePrice, sku,
      categoryId, collectionId, material, weight, dimensions,
      inventoryQuantity, lowStockThreshold, metaTitle, metaDescription
    } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if SKU already exists
    const existingSku = await pool.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existingSku.rows.length > 0) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    // Create product
    const newProduct = await pool.query(`
      INSERT INTO products (
        name, slug, description, short_description, price, compare_price, sku,
        category_id, collection_id, material, weight, dimensions,
        inventory_quantity, low_stock_threshold, meta_title, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      name, slug, description, shortDescription, price, comparePrice, sku,
      categoryId, collectionId, material, weight, dimensions,
      inventoryQuantity || 0, lowStockThreshold || 5, metaTitle, metaDescription
    ]);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct.rows[0]
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Admin
router.put('/products/:id', [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Generate slug if name changed
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(updateData[key]);
      }
    });

    updateValues.push(id);
    paramCount++;
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    const updateQuery = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updatedProduct = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct.rows[0]
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete - set as inactive
    await pool.query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Admin
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        u.first_name, u.last_name, u.email,
        COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (o.order_number ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` GROUP BY o.id, u.first_name, u.last_name, u.email ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const orders = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;

    const countParams = [];
    paramCount = 0;

    if (status) {
      paramCount++;
      countQuery += ` AND o.status = $${paramCount}`;
      countParams.push(status);
    }

    if (search) {
      paramCount++;
      countQuery += ` AND (o.order_number ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      orders: orders.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.rows[0].total / limit),
        totalItems: parseInt(totalCount.rows[0].total),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Check if order exists
    const existingOrder = await pool.query('SELECT id FROM orders WHERE id = $1', [id]);
    if (existingOrder.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    res.json({ message: 'Order status updated successfully' });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
