import api from './api';

export const orderService = {
  // Get user's orders
  async getOrders(page = 1, limit = 10) {
    try {
      const response = await api.get('/orders', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch orders');
    }
  },

  // Get a single order by ID
  async getOrder(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch order');
    }
  },

  // Create a new order
  async createOrder(orderData) {
    try {
      console.log('OrderService: Creating order with data:', orderData);
      console.log('OrderService: API base URL:', api.baseURL);
      const response = await api.post('/orders/checkout', orderData);
      console.log('OrderService: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('OrderService: Error creating order:', error);
      throw new Error('Failed to create order');
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update order status');
    }
  },

  // Cancel order
  async cancelOrder(orderId, reason) {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error('Failed to cancel order');
    }
  },

  // Get order tracking information
  async getOrderTracking(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch tracking information');
    }
  },

  // Request order return/refund
  async requestReturn(orderId, returnData) {
    try {
      const response = await api.post(`/orders/${orderId}/return`, returnData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to request return');
    }
  },

  // Get order history for a specific product
  async getProductOrderHistory(productId) {
    try {
      const response = await api.get(`/orders/product/${productId}/history`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch product order history');
    }
  },

  // Download order invoice
  async downloadInvoice(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to download invoice');
    }
  }
};
