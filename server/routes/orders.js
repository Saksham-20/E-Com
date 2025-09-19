const express = require('express');
const { query, pool } = require('../database/config');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/orders/cart
// @desc    Get user's shopping cart
// @access  Private
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await query(`
      SELECT 
        ci.*,
        p.name as product_name,
        p.price,
        p.compare_price,
        p.sku,
        pi.image_url as product_image
      FROM cart_items ci
      JOIN cart c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE c.user_id = $1
      ORDER BY ci.created_at DESC
    `, [req.user.id]);

    res.json(cartItems.rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/cart/add
// @desc    Add item to shopping cart
// @access  Private
router.post('/cart/add', authenticateToken, [
  body('productId').isInt().withMessage('Product ID must be a valid integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('variantId').optional().isInt().withMessage('Variant ID must be a valid integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, variantId } = req.body;

    // Check if product exists and is active
    const product = await query(
      'SELECT * FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get or create cart for user
    let cartResult = await query(
      'SELECT id FROM cart WHERE user_id = $1',
      [req.user.id]
    );

    let cartId;
    if (cartResult.rows.length === 0) {
      const newCartResult = await query(
        'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
        [req.user.id]
      );
      cartId = newCartResult.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Check if item already exists in cart
    const existingItem = await query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item
      await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, variant_details) VALUES ($1, $2, $3, $4)',
        [cartId, productId, quantity, variantId ? { variant_id: variantId } : null]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/cart/update/:id
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/update/:id', authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    // Check if cart item belongs to user
    const cartItem = await query(`
      SELECT ci.* FROM cart_items ci
      JOIN cart c ON ci.cart_id = c.id
      WHERE ci.id = $1 AND c.user_id = $2
    `, [id, req.user.id]);

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update quantity
    await query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, id]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/orders/cart/remove/:id
// @desc    Remove item from shopping cart
// @access  Private
router.delete('/cart/remove/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cart item belongs to user and remove it
    const result = await query(`
      DELETE FROM cart_items 
      WHERE id = $1 AND cart_id IN (
        SELECT id FROM cart WHERE user_id = $2
      )
      RETURNING id
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/orders/cart/clear
// @desc    Clear entire shopping cart
// @access  Private
router.delete('/cart/clear', authenticateToken, async (req, res) => {
  try {
    // Clear all items from user's cart
    await query(`
      DELETE FROM cart_items 
      WHERE cart_id IN (
        SELECT id FROM cart WHERE user_id = $1
      )
    `, [req.user.id]);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/checkout
// @desc    Create new order from cart
// @access  Private
router.post('/checkout', authenticateToken, [
  body('items').isArray().withMessage('Items are required'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('paymentMethod').isString().withMessage('Payment method is required')
], async (req, res) => {
  try {
    console.log('Orders route: Checkout request received');
    console.log('Orders route: User:', req.user);
    console.log('Orders route: Body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Orders route: Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, billingAddress, paymentMethod, paymentDetails, notes } = req.body;


    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = 0; // Free shipping for now
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Set all orders to pending status initially
      let initialStatus = 'pending';

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (
          user_id, order_number, status, subtotal, tax_amount, 
          shipping_amount, total_amount, payment_method, 
          payment_intent_id, notes, shipping_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        req.user.id, orderNumber, initialStatus, subtotal, taxAmount,
        shippingAmount, totalAmount, paymentMethod, 
        JSON.stringify(paymentDetails || {}), notes || '',
        JSON.stringify(shippingAddress)
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price, total_price, variant_details
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          order.id, item.id, item.name, item.quantity, 
          item.price, item.price * item.quantity, 
          JSON.stringify(item.variant || {})
        ]);

        // Update product stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.id]
        );
      }

      await client.query('COMMIT');

      res.json({
        message: 'Order created successfully',
        order: order,
        orderNumber: order.order_number,
        total: order.total_amount
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
      [req.user.id]
    );

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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order
    const order = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const orderItems = await query(`
      SELECT 
        oi.*,
        p.sku,
        pi.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE oi.order_id = $1
    `, [id]);

    res.json({
      order: order.rows[0],
      items: orderItems.rows
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
