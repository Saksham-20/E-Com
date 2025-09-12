import api from './api';

export const stripeService = {
  // Create payment intent for checkout
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await api.post('/stripe/create-payment-intent', {
        amount,
        currency,
        metadata
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to create payment intent');
    }
  },

  // Confirm payment
  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await api.post('/stripe/confirm-payment', {
        paymentIntentId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to confirm payment');
    }
  },

  // Get payment methods for user
  async getPaymentMethods() {
    try {
      const response = await api.get('/stripe/payment-methods');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment methods');
    }
  },

  // Add new payment method
  async addPaymentMethod(paymentMethodId) {
    try {
      const response = await api.post('/stripe/payment-methods', {
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to add payment method');
    }
  },

  // Remove payment method
  async removePaymentMethod(paymentMethodId) {
    try {
      await api.delete(`/stripe/payment-methods/${paymentMethodId}`);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to remove payment method');
    }
  },

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId) {
    try {
      const response = await api.put(`/stripe/payment-methods/${paymentMethodId}/default`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to set default payment method');
    }
  },

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10) {
    try {
      const response = await api.get('/stripe/payments', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch payment history');
    }
  },

  // Request refund
  async requestRefund(paymentIntentId, amount, reason) {
    try {
      const response = await api.post('/stripe/refunds', {
        paymentIntentId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to request refund');
    }
  },

  // Get subscription details (if applicable)
  async getSubscription(subscriptionId) {
    try {
      const response = await api.get(`/stripe/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch subscription');
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await api.post(`/stripe/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to cancel subscription');
    }
  }
};
