const db = require('../database/config');

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (status) {
      whereClause = 'WHERE o.status = ?';
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
        u.firstName,
        u.lastName,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      ${whereClause}
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [countResult] = await db.execute(countQuery, params);
    const [orders] = await db.execute(ordersQuery, [...params, parseInt(limit), offset]);

    const totalPages = Math.ceil(countResult[0].total / limit);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: countResult[0].total,
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

    const countQuery = 'SELECT COUNT(*) as total FROM orders WHERE userId = ?';
    const ordersQuery = `
      SELECT * FROM orders 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;

    const [countResult] = await db.execute(countQuery, [userId]);
    const [orders] = await db.execute(ordersQuery, [userId, parseInt(limit), offset]);

    const totalPages = Math.ceil(countResult[0].total / limit);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: countResult[0].total,
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

    let query = `
      SELECT 
        o.*,
        u.firstName,
        u.lastName,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      WHERE o.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      query += ' AND o.userId = ?';
      params.push(userId);
    }

    const [orders] = await db.execute(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [orderItems] = await db.execute(
      'SELECT * FROM order_items WHERE orderId = ?',
      [id]
    );

    order.items = orderItems;

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
    const { items, shippingAddress, billingAddress, paymentMethod, paymentDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (userId, total, status, shippingAddress, billingAddress, paymentMethod, paymentDetails) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, total, 'pending', JSON.stringify(shippingAddress), JSON.stringify(billingAddress), paymentMethod, JSON.stringify(paymentDetails)]
      );

      const orderId = orderResult.insertId;

      // Create order items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (orderId, productId, quantity, price, variant) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.price, JSON.stringify(item.variant || {})]
        );

        // Update product stock
        if (item.variant && item.variant.id) {
          await connection.execute(
            'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.variant.id]
          );
        } else {
          await connection.execute(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.id]
          );
        }
      }

      // Clear user's cart
      await connection.execute('DELETE FROM cart WHERE userId = ?', [userId]);

      await connection.commit();

      res.status(201).json({
        message: 'Order created successfully',
        orderId,
        total
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
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

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [result] = await db.execute(
      'UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
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

    let query = 'SELECT * FROM orders WHERE id = ?';
    const params = [id];

    if (!isAdmin) {
      query += ' AND userId = ?';
      params.push(userId);
    }

    const [orders] = await db.execute(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update order status
      await connection.execute(
        'UPDATE orders SET status = "cancelled", updatedAt = NOW() WHERE id = ?',
        [id]
      );

      // Restore product stock
      const [orderItems] = await connection.execute(
        'SELECT * FROM order_items WHERE orderId = ?',
        [id]
      );

      for (const item of orderItems) {
        const variant = JSON.parse(item.variant || '{}');
        
        if (variant.id) {
          await connection.execute(
            'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
            [item.quantity, variant.id]
          );
        } else {
          await connection.execute(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.productId]
          );
        }
      }

      await connection.commit();

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get order statistics (admin only)
const getOrderStats = async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total) as totalSales,
        AVG(total) as averageOrderValue,
        COUNT(DISTINCT userId) as uniqueCustomers
      FROM orders 
      WHERE status != 'cancelled'
    `);

    const [statusStats] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders 
      GROUP BY status
    `);

    const [recentOrders] = await db.execute(`
      SELECT 
        o.*,
        u.firstName,
        u.lastName
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
      LIMIT 5
    `);

    res.json({
      overview: stats[0],
      statusBreakdown: statusStats,
      recentOrders
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
