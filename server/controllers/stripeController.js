const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        paymentIntent
      });
    } else if (paymentIntent.status === 'requires_payment_method') {
      res.status(400).json({
        success: false,
        message: 'Payment method is required',
        paymentIntent
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        paymentIntent
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
};

// Create customer
const createCustomer = async (req, res) => {
  try {
    const { email, name, phone, address } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      address: address ? {
        line1: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.zipCode,
        country: address.country
      } : undefined,
      metadata: {
        source: 'ecommerce_platform'
      }
    });

    res.json({
      success: true,
      customerId: customer.id,
      customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ 
      message: 'Failed to create customer',
      error: error.message 
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { email, name, phone, address } = req.body;

    const customer = await stripe.customers.update(customerId, {
      email,
      name,
      phone,
      address: address ? {
        line1: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.zipCode,
        country: address.country
      } : undefined
    });

    res.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ 
      message: 'Failed to update customer',
      error: error.message 
    });
  }
};

// Get customer
const getCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await stripe.customers.retrieve(customerId);

    res.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve customer',
      error: error.message 
    });
  }
};

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const { customerId, priceId, metadata = {} } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({ message: 'Customer ID and Price ID are required' });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      success: true,
      subscriptionId: subscription.id,
      subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      message: 'Failed to create subscription',
      error: error.message 
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ 
      message: 'Failed to cancel subscription',
      error: error.message 
    });
  }
};

// Get subscription
const getSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve subscription',
      error: error.message 
    });
  }
};

// Create refund
const createRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
      reason
    });

    res.json({
      success: true,
      refundId: refund.id,
      refund
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ 
      message: 'Failed to create refund',
      error: error.message 
    });
  }
};

// Get webhook events
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
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
        // TODO: Update order status, send confirmation email, etc.
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // TODO: Update order status, send failure notification, etc.
        break;
      
      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        // TODO: Handle subscription creation
        break;
      
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // TODO: Handle subscription updates
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        // TODO: Handle subscription deletion
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ 
      message: 'Webhook handling failed',
      error: error.message 
    });
  }
};

// Get payment methods for customer
const getCustomerPaymentMethods = async (req, res) => {
  try {
    const { customerId } = req.params;

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json({
      success: true,
      paymentMethods: paymentMethods.data
    });
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve payment methods',
      error: error.message 
    });
  }
};

// Attach payment method to customer
const attachPaymentMethod = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: 'Payment method ID is required' });
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    res.json({
      success: true,
      paymentMethod
    });
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ 
      message: 'Failed to attach payment method',
      error: error.message 
    });
  }
};

// Detach payment method from customer
const detachPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

    res.json({
      success: true,
      message: 'Payment method detached successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Error detaching payment method:', error);
    res.status(500).json({ 
      message: 'Failed to detach payment method',
      error: error.message 
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createCustomer,
  updateCustomer,
  getCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  createRefund,
  handleWebhook,
  getCustomerPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod
};
