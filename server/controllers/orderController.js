const { query, pool } = require('../database/config');

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause = `WHERE o.status = $${paramCount}`;
      params.push(status);
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `;

    const ordersQuery = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, u.first_name, u.last_name, u.email
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const countResult = await query(countQuery, params);
    const ordersResult = await query(ordersQuery, [...params, parseInt(limit), offset]);

    const totalPages = Math.ceil(countResult.rows[0].total / limit);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.sku,
            pi.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
          WHERE oi.order_id = $1
        `, [order.id]);

        return {
          ...order,
          items: itemsResult.rows,
          customer_name: `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'N/A',
          customer_email: order.email || 'N/A'
        };
      })
    );

    res.json({
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(countResult.rows[0].total),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get orders for a specific user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = $1';
    const ordersQuery = `
      SELECT * FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const countResult = await query(countQuery, [userId]);
    const ordersResult = await query(ordersQuery, [userId, parseInt(limit), offset]);

    const totalPages = Math.ceil(countResult.rows[0].total / limit);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.sku,
            pi.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
          WHERE oi.order_id = $1
        `, [order.id]);

        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    res.json({
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(countResult.rows[0].total),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let orderQuery = `
      SELECT 
        o.*,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const params = [id];

    if (!isAdmin) {
      orderQuery += ' AND o.user_id = $2';
      params.push(userId);
    }

    const orderResult = await query(orderQuery, params);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.sku,
        pi.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE oi.order_id = $1
    `, [id]);

    order.items = itemsResult.rows;
    order.customer_name = `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'N/A';
    order.customer_email = order.email || 'N/A';

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, billingAddress, paymentMethod, paymentDetails, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = 0; // Free shipping
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (
          user_id, order_number, status, subtotal, tax_amount, 
          shipping_amount, total_amount, shipping_address, 
          billing_address, payment_method, payment_details, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        userId, orderNumber, 'pending', subtotal, taxAmount,
        shippingAmount, totalAmount, JSON.stringify(shippingAddress), 
        JSON.stringify(billingAddress), paymentMethod, 
        JSON.stringify(paymentDetails), notes || ''
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
          'UPDATE products SET inventory_quantity = inventory_quantity - $1 WHERE id = $2',
          [item.quantity, item.id]
        );
      }

      // Clear user's cart
      await client.query(`
        DELETE FROM cart_items 
        WHERE cart_id IN (
          SELECT id FROM cart WHERE user_id = $1
        )
      `, [userId]);

      await client.query('COMMIT');

      res.status(201).json({
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
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const params = [id];

    if (!isAdmin) {
      orderQuery += ' AND user_id = $2';
      params.push(userId);
    }

    const orderResult = await query(orderQuery, params);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update order status
      await client.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', id]
      );

      // Restore product stock
      const itemsResult = await client.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [id]
      );

      for (const item of itemsResult.rows) {
        const variant = JSON.parse(item.variant_details || '{}');
        
        await client.query(
          'UPDATE products SET inventory_quantity = inventory_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get order statistics (admin only)
const getOrderStats = async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_sales,
        AVG(total_amount) as average_order_value,
        COUNT(DISTINCT user_id) as unique_customers
      FROM orders 
      WHERE status != 'cancelled'
    `);

    const statusStatsResult = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders 
      GROUP BY status
    `);

    const recentOrdersResult = await query(`
      SELECT 
        o.*,
        u.first_name,
        u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      overview: statsResult.rows[0],
      statusBreakdown: statusStatsResult.rows,
      recentOrders: recentOrdersResult.rows
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
};
