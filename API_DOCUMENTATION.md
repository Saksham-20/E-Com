# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "phone": "+1234567890",
  "accept_terms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-here",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

### Products

#### GET /products
Get all products with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category_id` (number): Filter by category
- `min_price` (number): Minimum price
- `max_price` (number): Maximum price
- `brand` (string): Filter by brand
- `q` (string): Search query
- `sort_by` (string): Sort field (name, price, rating, created_at)
- `sort_order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Luxury Watch",
      "description": "Premium timepiece",
      "price": 999.99,
      "image_url": "/uploads/products/1/large.jpg",
      "category_id": 1,
      "brand": "LuxuryBrand",
      "stock_quantity": 10,
      "rating": 4.5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### GET /products/:id
Get product by ID.

**Response:**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Luxury Watch",
    "description": "Premium timepiece",
    "price": 999.99,
    "images": [
      {
        "size": "thumbnail",
        "url": "/uploads/products/1/thumbnail.jpg"
      }
    ],
    "variants": [
      {
        "id": 1,
        "name": "Gold",
        "price_adjustment": 0
      }
    ],
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent product!",
        "user_name": "John Doe",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### POST /products (Admin only)
Create new product.

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category_id": 1,
  "brand": "Brand Name",
  "stock_quantity": 50,
  "weight": 0.5,
  "is_active": true
}
```

#### PUT /products/:id (Admin only)
Update product.

#### DELETE /products/:id (Admin only)
Delete product.

### Cart

#### GET /cart
Get user's cart.

**Response:**
```json
{
  "success": true,
  "cart": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "name": "Luxury Watch",
        "price": 999.99,
        "quantity": 2,
        "total_price": 1999.98
      }
    ],
    "summary": {
      "item_count": 1,
      "total_quantity": 2,
      "subtotal": 1999.98
    }
  }
}
```

#### POST /cart/items
Add item to cart.

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 1,
  "variant_id": 1
}
```

#### PUT /cart/items/:id
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /cart/items/:id
Remove item from cart.

#### DELETE /cart
Clear entire cart.

### Orders

#### GET /orders
Get user's orders.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-12345678-ABC12",
      "status": "pending",
      "total_amount": 1999.98,
      "created_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "product_id": 1,
          "name": "Luxury Watch",
          "price": 999.99,
          "quantity": 2
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### POST /orders
Create new order.

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "variant_id": 1
    }
  ],
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA"
  },
  "payment_method": "card",
  "shipping_method": "standard"
}
```

#### GET /orders/:id
Get order by ID.

#### PUT /orders/:id/status (Admin only)
Update order status.

**Request Body:**
```json
{
  "status": "shipped",
  "tracking_number": "TRK123456789"
}
```

### Users

#### GET /users/profile
Get user profile.

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA"
  }
}
```

#### PUT /users/password
Change password.

**Request Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!",
  "confirm_new_password": "NewPass123!"
}
```

### Wishlist

#### GET /wishlist
Get user's wishlist.

#### POST /wishlist
Add product to wishlist.

**Request Body:**
```json
{
  "product_id": 1
}
```

#### DELETE /wishlist/:productId
Remove product from wishlist.

### Admin Endpoints

#### GET /admin/dashboard
Get admin dashboard statistics.

#### GET /admin/users
Get all users (Admin only).

#### GET /admin/orders
Get all orders (Admin only).

#### GET /admin/products
Get all products (Admin only).

### Stripe Payment

#### POST /stripe/create-payment-intent
Create payment intent for checkout.

**Request Body:**
```json
{
  "amount": 1999.98,
  "currency": "usd",
  "metadata": {
    "order_id": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 1999.98,
  "currency": "usd"
}
```

#### POST /stripe/confirm-payment
Confirm payment.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per 15 minutes
- General endpoints: 100 requests per 15 minutes
- Admin endpoints: 1000 requests per 15 minutes

## Pagination

List endpoints support pagination with the following response structure:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## File Uploads

File uploads are supported for product images and user avatars:
- Maximum file size: 5MB
- Supported formats: JPG, PNG, GIF, WebP
- Images are automatically resized and optimized
- Multiple sizes are generated for product images

## Webhooks

Stripe webhooks are supported for payment events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Webhook endpoint: `POST /stripe/webhook`
