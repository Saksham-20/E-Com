const db = require('../database/config');

class Wishlist {
  constructor() {
    this.tableName = 'wishlists';
  }

  // Get wishlist by user ID
  async getByUserId(userId) {
    try {
      const query = `
        SELECT w.*, p.id as product_id, p.name, p.price, p.image_url, p.description,
               p.category_id, c.name as category_name
        FROM ${this.tableName} w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
      `;

      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching wishlist: ${error.message}`);
    }
  }

  // Add product to wishlist
  async addItem(userId, productId) {
    try {
      // Check if item already exists
      const existingQuery = `
        SELECT id FROM ${this.tableName} 
        WHERE user_id = ? AND product_id = ?
      `;
      const [existing] = await db.execute(existingQuery, [userId, productId]);

      if (existing.length > 0) {
        throw new Error('Product already in wishlist');
      }

      // Add new item
      const insertQuery = `
        INSERT INTO ${this.tableName} (user_id, product_id, created_at) 
        VALUES (?, ?, NOW())
      `;
      const [result] = await db.execute(insertQuery, [userId, productId]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error adding item to wishlist: ${error.message}`);
    }
  }

  // Remove product from wishlist
  async removeItem(userId, productId) {
    try {
      const query = `
        DELETE FROM ${this.tableName} 
        WHERE user_id = ? AND product_id = ?
      `;
      const [result] = await db.execute(query, [userId, productId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error removing item from wishlist: ${error.message}`);
    }
  }

  // Check if product is in user's wishlist
  async isInWishlist(userId, productId) {
    try {
      const query = `
        SELECT id FROM ${this.tableName} 
        WHERE user_id = ? AND product_id = ?
      `;
      const [rows] = await db.execute(query, [userId, productId]);
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking wishlist status: ${error.message}`);
    }
  }

  // Get wishlist count for user
  async getCount(userId) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = ?`;
      const [rows] = await db.execute(query, [userId]);
      return rows[0].count;
    } catch (error) {
      throw new Error(`Error getting wishlist count: ${error.message}`);
    }
  }

  // Move wishlist item to cart
  async moveToCart(userId, productId, cartId) {
    try {
      // Get product details
      const productQuery = 'SELECT * FROM products WHERE id = ?';
      const [products] = await db.execute(productQuery, [productId]);

      if (products.length === 0) {
        throw new Error('Product not found');
      }

      // Add to cart (you'll need to implement cart functionality)
      // This is a placeholder - you might want to use the Cart model here
      const cartQuery = `
        INSERT INTO cart_items (cart_id, product_id, quantity, created_at) 
        VALUES (?, ?, 1, NOW())
      `;
      await db.execute(cartQuery, [cartId, productId]);

      // Remove from wishlist
      await this.removeItem(userId, productId);

      return { success: true, message: 'Item moved to cart' };
    } catch (error) {
      throw new Error(`Error moving item to cart: ${error.message}`);
    }
  }

  // Get wishlist with pagination
  async getByUserIdPaginated(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT w.*, p.id as product_id, p.name, p.price, p.image_url, p.description,
               p.category_id, c.name as category_name
        FROM ${this.tableName} w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await db.execute(query, [userId, limit, offset]);

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE user_id = ?`;
      const [countResult] = await db.execute(countQuery, [userId]);
      const total = countResult[0].total;

      return {
        items: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching wishlist: ${error.message}`);
    }
  }

  // Clear entire wishlist for user
  async clear(userId) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE user_id = ?`;
      const [result] = await db.execute(query, [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error clearing wishlist: ${error.message}`);
    }
  }
}

module.exports = new Wishlist();
