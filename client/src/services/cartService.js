import api from './api';

export const cartService = {
  // Get user's cart
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch cart');
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1, variantId = null) {
    try {
      const response = await api.post('/cart/items', {
        productId,
        quantity,
        variantId
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to add item to cart');
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update cart item');
    }
  },

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      await api.delete(`/cart/items/${itemId}`);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to remove item from cart');
    }
  },

  // Clear entire cart
  async clearCart() {
    try {
      await api.delete('/cart');
      return { success: true };
    } catch (error) {
      throw new Error('Failed to clear cart');
    }
  },

  // Apply discount code
  async applyDiscount(code) {
    try {
      const response = await api.post('/cart/discount', { code });
      return response.data;
    } catch (error) {
      throw new Error('Failed to apply discount code');
    }
  },

  // Remove discount code
  async removeDiscount() {
    try {
      await api.delete('/cart/discount');
      return { success: true };
    } catch (error) {
      throw new Error('Failed to remove discount');
    }
  },

  // Get cart summary (totals, shipping, etc.)
  async getCartSummary() {
    try {
      const response = await api.get('/cart/summary');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch cart summary');
    }
  }
};
