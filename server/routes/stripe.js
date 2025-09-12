const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/stripe/create-payment-intent
// @desc    Create payment intent for checkout
// @access  Private
router.post('/create-payment-intent', authenticateToken, [
  body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = 'usd' } = req.body;

    // Convert amount to cents (Stripe expects amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      metadata: {
        user_id: req.user.id.toString(),
        user_email: req.user.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
});

// @route   POST /api/stripe/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Here you could update order status, send confirmation emails, etc.
        // For now, we'll just log the success
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Here you could update order status, send failure notifications, etc.
        break;
        
      case 'charge.succeeded':
        const charge = event.data.object;
        console.log('Charge succeeded:', charge.id);
        break;
        
      case 'charge.failed':
        const failedCharge = event.data.object;
        console.log('Charge failed:', failedCharge.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// @route   GET /api/stripe/payment-methods
// @desc    Get user's saved payment methods
// @access  Private
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    // This would require storing Stripe customer IDs in your user table
    // For now, we'll return an empty array
    res.json({ paymentMethods: [] });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stripe/setup-intent
// @desc    Create setup intent for saving payment methods
// @access  Private
router.post('/setup-intent', authenticateToken, async (req, res) => {
  try {
    // Create setup intent for saving payment methods
    const setupIntent = await stripe.setupIntents.create({
      customer: req.user.stripeCustomerId, // You'd need to store this
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    res.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    });

  } catch (error) {
    console.error('Create setup intent error:', error);
    res.status(500).json({ 
      message: 'Failed to create setup intent',
      error: error.message 
    });
  }
});

// @route   POST /api/stripe/refund
// @desc    Process refund for an order
// @access  Private (Admin only)
router.post('/refund', authenticateToken, [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer']).withMessage('Invalid refund reason')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { paymentIntentId, amount, reason } = req.body;

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
      reason: reason || 'requested_by_customer',
    });

    res.json({
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert from cents
        status: refund.status,
        reason: refund.reason
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      message: 'Failed to process refund',
      error: error.message 
    });
  }
});

// @route   GET /api/stripe/balance
// @desc    Get Stripe account balance (Admin only)
// @access  Private (Admin only)
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const balance = await stripe.balance.retrieve();

    res.json({
      balance: {
        available: balance.available.map(b => ({
          amount: b.amount / 100,
          currency: b.currency
        })),
        pending: balance.pending.map(b => ({
          amount: b.amount / 100,
          currency: b.currency
        })),
        instant_available: balance.instant_available.map(b => ({
          amount: b.amount / 100,
          currency: b.currency
        }))
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      message: 'Failed to get balance',
      error: error.message 
    });
  }
});

module.exports = router;
