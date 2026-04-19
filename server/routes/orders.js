const express = require('express');
const { query, pool } = require('../database/config');
const { authenticateToken } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');
const { body, validationResult } = require('express-validator');
const { checkoutLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's order history
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await query(`
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    // Get total count
    const totalCount = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [req.user.id],
    );

    res.json({
      orders: orders.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount.rows[0].total / limit),
        totalItems: parseInt(totalCount.rows[0].total),
        itemsPerPage: parseInt(limit),
      },
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', authenticateToken, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order
    const order = await query(
      `SELECT o.*,
              ua.id as shipping_address_id,
              ua.first_name as shipping_first_name,
              ua.last_name as shipping_last_name,
              ua.company as shipping_company,
              ua.address_line_1 as shipping_address_line_1,
              ua.address_line_2 as shipping_address_line_2,
              ua.city as shipping_city,
              ua.state as shipping_state,
              ua.postal_code as shipping_postal_code,
              ua.country as shipping_country,
              ua.phone as shipping_phone,
              ba.id as billing_address_id,
              ba.first_name as billing_first_name,
              ba.last_name as billing_last_name,
              ba.company as billing_company,
              ba.address_line_1 as billing_address_line_1,
              ba.address_line_2 as billing_address_line_2,
              ba.city as billing_city,
              ba.state as billing_state,
              ba.postal_code as billing_postal_code,
              ba.country as billing_country,
              ba.phone as billing_phone
       FROM orders o
       LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.id
       LEFT JOIN user_addresses ba ON o.billing_address_id = ba.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, req.user.id],
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const orderItems = await query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.sku,
        pi.image_url as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE oi.order_id = $1
    `, [id]);

    res.json({
      order: order.rows[0],
      items: orderItems.rows,
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authenticateToken, checkoutLimiter, [
  body('items').isArray().withMessage('Items are required'),
  body('shipping_address').isObject().withMessage('Shipping address is required'),
  body('billing_address').isObject().withMessage('Billing address is required'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shipping_address, billing_address, payment_method, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    for (const item of items) {
      if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ message: 'Each item must include a valid product_id and quantity' });
      }
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productIds = [...new Set(items.map((item) => item.product_id))];
      const productsResult = await client.query(
        `SELECT id, name, sku, price, stock_quantity
         FROM products
         WHERE id = ANY($1::uuid[]) AND is_active = true
         FOR UPDATE`,
        [productIds],
      );

      if (productsResult.rows.length !== productIds.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'One or more products are unavailable' });
      }

      const productsById = new Map(productsResult.rows.map((product) => [product.id, product]));
      const requestedQuantities = new Map();
      for (const item of items) {
        requestedQuantities.set(
          item.product_id,
          (requestedQuantities.get(item.product_id) || 0) + item.quantity,
        );
      }

      for (const [productId, requestedQty] of requestedQuantities.entries()) {
        const product = productsById.get(productId);
        if (!product || product.stock_quantity < requestedQty) {
          await client.query('ROLLBACK');
          return res.status(400).json({ message: `Insufficient stock for product ${productId}` });
        }
      }

      // Create shipping address
      const shippingResult = await client.query(`
        INSERT INTO user_addresses (user_id, address_type, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        req.user.id, 'shipping', shipping_address.first_name, shipping_address.last_name,
        shipping_address.company, shipping_address.address_line_1, shipping_address.address_line_2,
        shipping_address.city, shipping_address.state, shipping_address.postal_code,
        shipping_address.country, shipping_address.phone, false,
      ]);

      // Create billing address
      const billingResult = await client.query(`
        INSERT INTO user_addresses (user_id, address_type, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        req.user.id, 'billing', billing_address.first_name, billing_address.last_name,
        billing_address.company, billing_address.address_line_1, billing_address.address_line_2,
        billing_address.city, billing_address.state, billing_address.postal_code,
        billing_address.country, billing_address.phone, false,
      ]);

      // Calculate totals from trusted server-side product prices
      let subtotal = 0;
      for (const item of items) {
        const product = productsById.get(item.product_id);
        subtotal += Number(product.price) * item.quantity;
      }

      const taxAmount = subtotal * 0.08; // 8% tax
      const shippingAmount = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (order_number, user_id, status, subtotal, tax_amount, shipping_amount, total_amount, payment_status, payment_method, shipping_address_id, billing_address_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        orderNumber, req.user.id, 'pending', subtotal, taxAmount, shippingAmount,
        totalAmount, 'pending', payment_method, shippingResult.rows[0].id,
        billingResult.rows[0].id, notes,
      ]);

      // Create order items
      for (const item of items) {
        const product = productsById.get(item.product_id);
        const unitPrice = Number(product.price);

        await client.query(`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          orderResult.rows[0].id,
          item.product_id,
          product.name,
          product.sku || null,
          item.quantity,
          unitPrice,
          unitPrice * item.quantity,
        ]);
      }

      for (const [productId, requestedQty] of requestedQuantities.entries()) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [requestedQty, productId],
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        order: orderResult.rows[0],
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.post('/:id/cancel', authenticateToken, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists and belongs to user
    const order = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id],
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.rows[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.rows[0].status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', id],
      );

      // Restore product stock
      const orderItems = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id],
      );

      for (const item of orderItems.rows) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id],
        );
      }

      await client.query('COMMIT');

      res.json({ success: true, message: 'Order cancelled successfully' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order status (admin only)
// @access  Private (Admin)
router.put('/:id', authenticateToken, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, notes } = req.body;

    // Check if user is admin
    const user = await query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.id],
    );

    if (!user.rows[0]?.is_admin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      refunded: [],
    };

    const existingOrderResult = await query(
      'SELECT status FROM orders WHERE id = $1',
      [id],
    );

    if (existingOrderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = existingOrderResult.rows[0].status;
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    // Update order
    const result = await query(
      'UPDATE orders SET status = $1, tracking_number = $2, notes = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [status, tracking_number, notes, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, order: result.rows[0] });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
