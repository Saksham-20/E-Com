const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');

class PaymentService {
  constructor() {
    this.stripe = stripe;
  }

  // Create payment intent for checkout
  async createPaymentIntent(orderData) {
    try {
      const { amount, currency = 'usd', metadata = {} } = orderData;
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency
        };
      } else if (paymentIntent.status === 'requires_confirmation') {
        const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
        return {
          success: true,
          status: confirmedIntent.status,
          amount: confirmedIntent.amount / 100,
          currency: confirmedIntent.currency
        };
      } else {
        return {
          success: false,
          status: paymentIntent.status,
          error: 'Payment requires additional action'
        };
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  // Process successful payment
  async processSuccessfulPayment(paymentIntentId, orderId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update order status
        await Order.updateStatus(orderId, 'paid');
        
        // Get order details for confirmation
        const order = await Order.getById(orderId);
        const user = await User.getById(order.user_id);
        
        return {
          success: true,
          order,
          user,
          paymentDetails: {
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paymentMethod: paymentIntent.payment_method_types[0],
            transactionId: paymentIntent.id
          }
        };
      } else {
        throw new Error('Payment not successful');
      }
    } catch (error) {
      console.error('Failed to process successful payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  // Create customer in Stripe
  async createCustomer(userData) {
    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        phone: userData.phone,
        metadata: {
          user_id: userData.id,
          created_at: new Date().toISOString()
        }
      });

      return customer;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Get customer payment methods
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Failed to get customer payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  // Add payment method to customer
  async addPaymentMethod(customerId, paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return paymentMethod;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw new Error('Failed to add payment method');
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw new Error('Failed to remove payment method');
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  // Process refund
  async processRefund(paymentIntentId, amount, reason) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: reason || 'requested_by_customer',
        metadata: {
          refunded_at: new Date().toISOString()
        }
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Get payment history
  async getPaymentHistory(customerId, limit = 10) {
    try {
      const payments = await this.stripe.paymentIntents.list({
        customer: customerId,
        limit,
      });

      return payments.data.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        created: new Date(payment.created * 1000),
        paymentMethod: payment.payment_method_types[0]
      }));
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw new Error('Failed to get payment history');
    }
  }

  // Create subscription (for recurring payments)
  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          created_at: new Date().toISOString()
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSucceeded(event.data.object);
        
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
        
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(event.data.object);
        
        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(event.data.object);
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { success: true, message: 'Event ignored' };
      }
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw new Error('Failed to handle webhook');
    }
  }

  // Handle successful payment
  async handlePaymentSucceeded(paymentIntent) {
    try {
      const orderId = paymentIntent.metadata.order_id;
      if (orderId) {
        await this.processSuccessfulPayment(paymentIntent.id, orderId);
      }
      return { success: true, message: 'Payment processed successfully' };
    } catch (error) {
      console.error('Failed to handle payment succeeded:', error);
      throw error;
    }
  }

  // Handle failed payment
  async handlePaymentFailed(paymentIntent) {
    try {
      const orderId = paymentIntent.metadata.order_id;
      if (orderId) {
        await Order.updateStatus(orderId, 'payment_failed');
      }
      return { success: true, message: 'Payment failure handled' };
    } catch (error) {
      console.error('Failed to handle payment failed:', error);
      throw error;
    }
  }

  // Handle successful invoice payment
  async handleInvoicePaymentSucceeded(invoice) {
    try {
      // Handle subscription payment success
      return { success: true, message: 'Invoice payment processed' };
    } catch (error) {
      console.error('Failed to handle invoice payment succeeded:', error);
      throw error;
    }
  }

  // Handle failed invoice payment
  async handleInvoicePaymentFailed(invoice) {
    try {
      // Handle subscription payment failure
      return { success: true, message: 'Invoice payment failure handled' };
    } catch (error) {
      console.error('Failed to handle invoice payment failed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
