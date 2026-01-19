# PartyPilot API Documentation

## Base URL
```
Production: https://yourdomain.com/api
Development: http://localhost:3000/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Routes

### POST /api/auth/send-otp
Send OTP to phone number
```json
{
  "phone": "1234567890"
}
```

### POST /api/auth/verify-otp
Verify OTP and login
```json
{
  "phone": "1234567890",
  "otp": "1234",
  "role": "customer"
}
```

---

## 👤 User Routes

### GET /api/users/profile
Get current user profile (Protected)

### PUT /api/users/profile
Update user profile (Protected)
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

### PUT /api/users/password
Change password (Protected)
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### GET /api/users/orders
Get user order history (Protected)
Query params: `status`, `limit`, `page`

### GET /api/users/stats
Get user statistics (Protected)

### DELETE /api/users/account
Delete user account (Protected)
```json
{
  "password": "user_password"
}
```

---

## 📦 Package Routes

### GET /api/admin/packages
Get all packages
Query params: `q`, `category`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`

---

## 🛒 Order Routes

### POST /api/orders
Create new order (Protected - Customer)
```json
{
  "packageId": "package_id",
  "eventDate": "2024-12-25",
  "address": "Event location",
  "paymentType": "25%",
  "paymentAmount": 250
}
```

### GET /api/orders/myorders
Get customer's orders (Protected - Customer)

---

## 💳 Payment Routes

### POST /api/payments/stripe/create-intent
Create Stripe payment intent (Protected)
```json
{
  "orderId": "order_id",
  "amount": 250
}
```

### POST /api/payments/stripe/confirm
Confirm Stripe payment (Protected)
```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": "order_id"
}
```

### POST /api/payments/razorpay/create-order
Create Razorpay order (Protected)
```json
{
  "orderId": "order_id",
  "amount": 250
}
```

### POST /api/payments/razorpay/verify
Verify Razorpay payment (Protected)
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature",
  "orderId": "order_id"
}
```

### GET /api/payments/history
Get payment history (Protected)

---

## 🚚 Partner Routes

### GET /api/partner/orders/my
Get assigned orders (Protected - Partner)

### GET /api/partner/orders/new
Get available orders (Protected - Partner)

### PUT /api/partner/orders/:id/accept
Accept order (Protected - Partner)

### PUT /api/partner/orders/:id/status
Update order status (Protected - Partner)
```json
{
  "status": "Partner Reached"
}
```

### PUT /api/partner/location
Update partner location (Protected - Partner)
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

---

## 👨‍💼 Admin Routes

### POST /api/admin/packages
Create package (Protected - Admin)
```json
{
  "name": "Platinum Package",
  "description": "Premium event package",
  "price": 999,
  "features": ["DJ", "Catering", "Decoration"],
  "images": ["url1", "url2"]
}
```

### PUT /api/admin/packages/:id
Update package (Protected - Admin)

### DELETE /api/admin/packages/:id
Delete package (Protected - Admin)

### GET /api/admin/partners
Get all partners (Protected - Admin)

### PUT /api/admin/partners/:id/approve
Approve partner (Protected - Admin)

### GET /api/admin/orders
Get all orders (Protected - Admin)

### PUT /api/admin/orders/:id/assign
Assign partner to order (Protected - Admin)
```json
{
  "partnerId": "partner_id"
}
```

---

## 🏥 Health Check

### GET /api/health
Check API health status

---

## Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

---

## Rate Limits

- **API Routes**: 100 requests per 15 minutes
- **Auth Routes**: 5 requests per 15 minutes
- **Payment Routes**: 10 requests per 15 minutes
