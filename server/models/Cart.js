const db = require('../database/config');

class Cart {
  constructor() {
    this.tableName = 'carts';
  }

  // Get cart by user ID
  async getByUserId(userId) {
    try {
      const query = `
        SELECT c.*, ci.id as item_id, ci.quantity, ci.variant_id,
               p.id as product_id, p.name, p.price, p.image_url,
               pv.id as variant_id, pv.name as variant_name, pv.price_adjustment
        FROM ${this.tableName} c
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        LEFT JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE c.user_id = ?
        ORDER BY ci.created_at DESC
      `;

      const [rows] = await db.execute(query, [userId]);
      return this.formatCartData(rows);
    } catch (error) {
      throw new Error(`Error fetching cart: ${error.message}`);
    }
  }

  // Create new cart for user
  async create(userId) {
    try {
      const query = `INSERT INTO ${this.tableName} (user_id, created_at) VALUES (?, NOW())`;
      const [result] = await db.execute(query, [userId]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating cart: ${error.message}`);
    }
  }

  // Add item to cart
  async addItem(cartId, productId, quantity, variantId = null) {
    try {
      // Check if item already exists
      const existingQuery = `
        SELECT id, quantity FROM cart_items 
        WHERE cart_id = ? AND product_id = ? AND variant_id = ?
      `;
      const [existing] = await db.execute(existingQuery, [cartId, productId, variantId || null]);

      if (existing.length > 0) {
        // Update existing item quantity
        const newQuantity = existing[0].quantity + quantity;
        const updateQuery = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
        await db.execute(updateQuery, [newQuantity, existing[0].id]);
        return existing[0].id;
      } else {
        // Add new item
        const insertQuery = `
          INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, created_at) 
          VALUES (?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(insertQuery, [cartId, productId, variantId, quantity]);
        return result.insertId;
      }
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error.message}`);
    }
  }

  // Update cart item quantity
  async updateItemQuantity(itemId, quantity) {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return await this.removeItem(itemId);
      }

      const query = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
      const [result] = await db.execute(query, [quantity, itemId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating cart item: ${error.message}`);
    }
  }

  // Remove item from cart
  async removeItem(itemId) {
    try {
      const query = 'DELETE FROM cart_items WHERE id = ?';
      const [result] = await db.execute(query, [itemId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error removing cart item: ${error.message}`);
    }
  }

  // Clear cart
  async clear(cartId) {
    try {
      const query = 'DELETE FROM cart_items WHERE cart_id = ?';
      const [result] = await db.execute(query, [cartId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }

  // Get cart summary (totals, item count, etc.)
  async getSummary(cartId) {
    try {
      const query = `
        SELECT 
          COUNT(ci.id) as item_count,
          SUM(ci.quantity) as total_quantity,
          SUM(
            CASE 
              WHEN pv.id IS NOT NULL THEN (p.price + pv.price_adjustment) * ci.quantity
              ELSE p.price * ci.quantity
            END
          ) as subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.cart_id = ?
      `;

      const [rows] = await db.execute(query, [cartId]);
      return rows[0] || { item_count: 0, total_quantity: 0, subtotal: 0 };
    } catch (error) {
      throw new Error(`Error getting cart summary: ${error.message}`);
    }
  }

  // Format cart data for frontend
  formatCartData(rows) {
    if (!rows || rows.length === 0) {
      return { items: [], summary: { item_count: 0, total_quantity: 0, subtotal: 0 } };
    }

    const cartId = rows[0].id;
    const items = rows
      .filter(row => row.product_id) // Filter out rows without products
      .map(row => ({
        id: row.item_id,
        product_id: row.product_id,
        name: row.name,
        price: row.price,
        image_url: row.image_url,
        quantity: row.quantity,
        variant_id: row.variant_id,
        variant_name: row.variant_name,
        price_adjustment: row.price_adjustment || 0,
        total_price: (row.price + (row.price_adjustment || 0)) * row.quantity,
      }));

    const summary = {
      item_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.total_price, 0),
    };

    return { id: cartId, items, summary };
  }
}

module.exports = new Cart();
