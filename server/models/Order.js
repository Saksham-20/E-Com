const db = require('../database/config');

class Order {
  static async create(orderData) {
    try {
      const {
        userId,
        total,
        status = 'pending',
        shippingAddress,
        billingAddress,
        paymentMethod,
        paymentDetails,
        items,
      } = orderData;

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
      // Create order
        const [orderResult] = await connection.execute(
          `INSERT INTO orders (userId, total, status, shippingAddress, billingAddress, paymentMethod, paymentDetails, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            total,
            status,
            JSON.stringify(shippingAddress),
            JSON.stringify(billingAddress),
            paymentMethod,
            JSON.stringify(paymentDetails),
          ],
        );

        const orderId = orderResult.insertId;

        // Create order items
        for (const item of items) {
          await connection.execute(
            `INSERT INTO order_items (orderId, productId, quantity, price, variant) 
           VALUES (?, ?, ?, ?, ?)`,
            [
              orderId,
              item.id,
              item.quantity,
              item.price,
              JSON.stringify(item.variant || {}),
            ],
          );

          // Update product stock
          if (item.variant && item.variant.id) {
            await connection.execute(
              'UPDATE product_variants SET stock = GREATEST(0, stock - ?) WHERE id = ?',
              [item.quantity, item.variant.id],
            );
          } else {
            await connection.execute(
              'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
              [item.quantity, item.id],
            );
          }
        }

        await connection.commit();
        return orderId;
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

  static async findById(id) {
    try {
      const [orders] = await db.execute(
        'SELECT * FROM orders WHERE id = ?',
        [id],
      );

      if (orders.length === 0) return null;

      const order = orders[0];

      // Parse JSON fields
      if (order.shippingAddress) {
        try {
          order.shippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          order.shippingAddress = {};
        }
      }

      if (order.billingAddress) {
        try {
          order.billingAddress = JSON.parse(order.billingAddress);
        } catch (e) {
          order.billingAddress = {};
        }
      }

      if (order.paymentDetails) {
        try {
          order.paymentDetails = JSON.parse(order.paymentDetails);
        } catch (e) {
          order.paymentDetails = {};
        }
      }

      // Get order items
      const [orderItems] = await db.execute(
        'SELECT * FROM order_items WHERE orderId = ?',
        [id],
      );

      // Parse variant JSON for each item
      orderItems.forEach(item => {
        if (item.variant) {
          try {
            item.variant = JSON.parse(item.variant);
          } catch (e) {
            item.variant = {};
          }
        }
      });

      order.items = orderItems;

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE userId = ?';
      const params = [userId];

      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
      const ordersQuery = `
        SELECT * FROM orders 
        ${whereClause}
        ORDER BY createdAt DESC 
        LIMIT ? OFFSET ?
      `;

      const [countResult] = await db.execute(countQuery, params);
      const [orders] = await db.execute(ordersQuery, [...params, parseInt(limit), offset]);

      // Parse JSON fields for each order
      orders.forEach(order => {
        if (order.shippingAddress) {
          try {
            order.shippingAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            order.shippingAddress = {};
          }
        }

        if (order.billingAddress) {
          try {
            order.billingAddress = JSON.parse(order.billingAddress);
          } catch (e) {
            order.billingAddress = {};
          }
        }

        if (order.paymentDetails) {
          try {
            order.paymentDetails = JSON.parse(order.paymentDetails);
          } catch (e) {
            order.paymentDetails = {};
          }
        }
      });

      const totalPages = Math.ceil(countResult[0].total / limit);

      return {
        orders,
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

  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        userId,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = options;

      const offset = (page - 1) * limit;

      let whereClause = '';
      const params = [];

      if (status) {
        whereClause += 'WHERE status = ?';
        params.push(status);
      }

      if (userId) {
        if (whereClause) {
          whereClause += ' AND userId = ?';
        } else {
          whereClause = 'WHERE userId = ?';
        }
        params.push(userId);
      }

      const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
      const ordersQuery = `
        SELECT o.*, u.firstName, u.lastName, u.email 
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        ${whereClause}
        ORDER BY o.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const [countResult] = await db.execute(countQuery, params);
      const [orders] = await db.execute(ordersQuery, [...params, parseInt(limit), offset]);

      // Parse JSON fields for each order
      orders.forEach(order => {
        if (order.shippingAddress) {
          try {
            order.shippingAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            order.shippingAddress = {};
          }
        }

        if (order.billingAddress) {
          try {
            order.billingAddress = JSON.parse(order.billingAddress);
          } catch (e) {
            order.billingAddress = {};
          }
        }

        if (order.paymentDetails) {
          try {
            order.paymentDetails = JSON.parse(order.paymentDetails);
          } catch (e) {
            order.paymentDetails = {};
          }
        }
      });

      const totalPages = Math.ceil(countResult[0].total / limit);

      return {
        orders,
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

  static async updateStatus(id, status) {
    try {
      const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

      if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const [result] = await db.execute(
        'UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?',
        [status, id],
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async cancel(id, userId = null) {
    try {
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Get order details
        const [orders] = await connection.execute(
          'SELECT * FROM orders WHERE id = ?',
          [id],
        );

        if (orders.length === 0) {
          throw new Error('Order not found');
        }

        const order = orders[0];

        // Check if user can cancel this order
        if (userId && order.userId !== userId) {
          throw new Error('Access denied');
        }

        if (order.status === 'cancelled') {
          throw new Error('Order is already cancelled');
        }

        if (order.status === 'delivered') {
          throw new Error('Cannot cancel delivered order');
        }

        // Update order status
        await connection.execute(
          'UPDATE orders SET status = "cancelled", updatedAt = NOW() WHERE id = ?',
          [id],
        );

        // Restore product stock
        const [orderItems] = await connection.execute(
          'SELECT * FROM order_items WHERE orderId = ?',
          [id],
        );

        for (const item of orderItems) {
          const variant = JSON.parse(item.variant || '{}');

          if (variant.id) {
            await connection.execute(
              'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
              [item.quantity, variant.id],
            );
          } else {
            await connection.execute(
              'UPDATE products SET stock = stock + ? WHERE id = ?',
              [item.quantity, item.productId],
            );
          }
        }

        await connection.commit();
        return true;
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

  static async getStats() {
    try {
      const [overview] = await db.execute(`
        SELECT 
          COUNT(*) as totalOrders,
          SUM(total) as totalSales,
          AVG(total) as averageOrderValue,
          COUNT(DISTINCT userId) as uniqueCustomers
        FROM orders 
        WHERE status != 'cancelled'
      `);

      const [statusBreakdown] = await db.execute(`
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

      return {
        overview: overview[0],
        statusBreakdown,
        recentOrders,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getOrderHistory(userId, limit = 10) {
    try {
      const [orders] = await db.execute(
        `SELECT * FROM orders 
         WHERE userId = ? 
         ORDER BY createdAt DESC 
         LIMIT ?`,
        [userId, limit],
      );

      // Parse JSON fields for each order
      orders.forEach(order => {
        if (order.shippingAddress) {
          try {
            order.shippingAddress = JSON.parse(order.shippingAddress);
          } catch (e) {
            order.shippingAddress = {};
          }
        }

        if (order.billingAddress) {
          try {
            order.billingAddress = JSON.parse(order.billingAddress);
          } catch (e) {
            order.billingAddress = {};
          }
        }
      });

      return orders;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
