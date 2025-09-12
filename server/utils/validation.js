const Joi = require('joi');

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/
};

// Common validation messages
const messages = {
  'string.empty': '{{#label}} cannot be empty',
  'string.min': '{{#label}} must be at least {{#limit}} characters long',
  'string.max': '{{#label}} must not exceed {{#limit}} characters',
  'string.email': '{{#label}} must be a valid email address',
  'string.pattern.base': '{{#label}} format is invalid',
  'number.base': '{{#label}} must be a number',
  'number.min': '{{#label}} must be at least {{#limit}}',
  'number.max': '{{#label}} must not exceed {{#limit}}',
  'any.required': '{{#label}} is required',
  'object.unknown': '{{#label}} is not allowed'
};

// User validation schemas
const userValidation = {
  // Registration validation
  register: Joi.object({
    first_name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages(messages),
    
    last_name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages(messages),
    
    email: Joi.string()
      .email()
      .required()
      .messages(messages),
    
    password: Joi.string()
      .pattern(patterns.password)
      .required()
      .messages({
        ...messages,
        'string.pattern.base': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    
    confirm_password: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        ...messages,
        'any.only': 'Passwords must match'
      }),
    
    phone: Joi.string()
      .pattern(patterns.phone)
      .optional()
      .messages(messages),
    
    accept_terms: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'You must accept the terms and conditions'
      })
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages(messages),
    
    password: Joi.string()
      .required()
      .messages(messages)
  }),

  // Profile update validation
  profileUpdate: Joi.object({
    first_name: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages(messages),
    
    last_name: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages(messages),
    
    phone: Joi.string()
      .pattern(patterns.phone)
      .optional()
      .messages(messages),
    
    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zip_code: Joi.string().pattern(patterns.zipCode).optional(),
      country: Joi.string().max(50).optional()
    }).optional(),
    
    preferences: Joi.object({
      newsletter: Joi.boolean().optional(),
      marketing: Joi.boolean().optional(),
      language: Joi.string().valid('en', 'es', 'fr').optional()
    }).optional()
  }),

  // Password change validation
  passwordChange: Joi.object({
    current_password: Joi.string()
      .required()
      .messages(messages),
    
    new_password: Joi.string()
      .pattern(patterns.password)
      .required()
      .messages({
        ...messages,
        'string.pattern.base': 'New password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    
    confirm_new_password: Joi.string()
      .valid(Joi.ref('new_password'))
      .required()
      .messages({
        ...messages,
        'any.only': 'New passwords must match'
      })
  })
};

// Product validation schemas
const productValidation = {
  // Product creation validation
  create: Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages(messages),
    
    description: Joi.string()
      .min(10)
      .max(2000)
      .required()
      .messages(messages),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages(messages),
    
    category_id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages(messages),
    
    brand: Joi.string()
      .max(100)
      .optional()
      .messages(messages),
    
    sku: Joi.string()
      .max(50)
      .optional()
      .messages(messages),
    
    stock_quantity: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages(messages),
    
    weight: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages(messages),
    
    dimensions: Joi.object({
      length: Joi.number().positive().precision(2).optional(),
      width: Joi.number().positive().precision(2).optional(),
      height: Joi.number().positive().precision(2).optional()
    }).optional(),
    
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages(messages),
    
    is_active: Joi.boolean()
      .default(true)
      .optional()
      .messages(messages)
  }),

  // Product update validation
  update: Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .optional()
      .messages(messages),
    
    description: Joi.string()
      .min(10)
      .max(2000)
      .optional()
      .messages(messages),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages(messages),
    
    category_id: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages(messages),
    
    brand: Joi.string()
      .max(100)
      .optional()
      .messages(messages),
    
    sku: Joi.string()
      .max(50)
      .optional()
      .messages(messages),
    
    stock_quantity: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages(messages),
    
    weight: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages(messages),
    
    dimensions: Joi.object({
      length: Joi.number().positive().precision(2).optional(),
      width: Joi.number().positive().precision(2).optional(),
      height: Joi.number().positive().precision(2).optional()
    }).optional(),
    
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages(messages),
    
    is_active: Joi.boolean()
      .optional()
      .messages(messages)
  })
};

// Order validation schemas
const orderValidation = {
  // Order creation validation
  create: Joi.object({
    items: Joi.array()
      .items(Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        variant_id: Joi.number().integer().positive().optional()
      }))
      .min(1)
      .required()
      .messages(messages),
    
    shipping_address: Joi.object({
      first_name: Joi.string().min(2).max(50).required(),
      last_name: Joi.string().min(2).max(50).required(),
      street: Joi.string().max(100).required(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      zip_code: Joi.string().pattern(patterns.zipCode).required(),
      country: Joi.string().max(50).required(),
      phone: Joi.string().pattern(patterns.phone).required()
    }).required(),
    
    billing_address: Joi.object({
      first_name: Joi.string().min(2).max(50).required(),
      last_name: Joi.string().min(2).max(50).required(),
      street: Joi.string().max(100).required(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      zip_code: Joi.string().pattern(patterns.zipCode).required(),
      country: Joi.string().max(50).required()
    }).required(),
    
    payment_method: Joi.string().required(),
    shipping_method: Joi.string().required(),
    discount_code: Joi.string().max(50).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Order update validation
  update: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
      .optional()
      .messages(messages),
    
    tracking_number: Joi.string()
      .max(100)
      .optional()
      .messages(messages),
    
    notes: Joi.string()
      .max(500)
      .optional()
      .messages(messages)
  })
};

// Cart validation schemas
const cartValidation = {
  // Add to cart validation
  addItem: Joi.object({
    product_id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages(messages),
    
    quantity: Joi.number()
      .integer()
      .positive()
      .max(99)
      .required()
      .messages(messages),
    
    variant_id: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages(messages)
  }),

  // Update cart item validation
  updateItem: Joi.object({
    quantity: Joi.number()
      .integer()
      .positive()
      .max(99)
      .required()
      .messages(messages)
  })
};

// Review validation schemas
const reviewValidation = {
  // Create review validation
  create: Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages(messages),
    
    title: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages(messages),
    
    comment: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages(messages)
  })
};

// Search and filter validation
const searchValidation = {
  // Product search validation
  search: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages(messages),
    
    category_id: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages(messages),
    
    min_price: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages(messages),
    
    max_price: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages(messages),
    
    brand: Joi.string()
      .max(100)
      .optional()
      .messages(messages),
    
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages(messages),
    
    sort_by: Joi.string()
      .valid('name', 'price', 'rating', 'created_at', 'popularity')
      .optional()
      .messages(messages),
    
    sort_order: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .messages(messages),
    
    page: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages(messages),
    
    limit: Joi.number()
      .integer()
      .positive()
      .max(100)
      .optional()
      .messages(messages)
  })
};

// Pagination validation
const paginationValidation = {
  page: Joi.number()
    .integer()
    .positive()
    .default(1)
    .messages(messages),
  
  limit: Joi.number()
    .integer()
    .positive()
    .max(100)
    .default(10)
    .messages(messages)
};

// Validation helper functions
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new Error(JSON.stringify(errors));
  }
  
  return value;
};

const validatePartial = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new Error(JSON.stringify(errors));
  }
  
  return value;
};

module.exports = {
  patterns,
  messages,
  userValidation,
  productValidation,
  orderValidation,
  cartValidation,
  reviewValidation,
  searchValidation,
  paginationValidation,
  validate,
  validatePartial
};
