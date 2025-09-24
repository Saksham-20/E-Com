const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const stripeRoutes = require('./routes/stripe');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - disabled for development
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "https:", "http://localhost:5000", "http://localhost:3000"],
//     },
//   },
// }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
console.log('🔗 Registering API routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered at /api/auth');
app.use('/api/products', productRoutes);
console.log('✅ Product routes registered at /api/products');
app.use('/api/orders', orderRoutes);
console.log('✅ Order routes registered at /api/orders');
app.use('/api/users', userRoutes);
console.log('✅ User routes registered at /api/users');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered at /api/admin');
app.use('/api/stripe', stripeRoutes);
console.log('✅ Stripe routes registered at /api/stripe');
app.use('/api/wishlist', wishlistRoutes);
console.log('✅ Wishlist routes registered at /api/wishlist');
app.use('/api/cart', cartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 E-Commerce Shop server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});
