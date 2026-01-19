# 🎉 PartyPilot - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Customer │  │ Partner  │  │  Admin   │  │  Landing │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │   Page   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │           │
│       └─────────────┴─────────────┴─────────────┘           │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Nginx    │  (Reverse Proxy, SSL, Caching)
                    │  Port 80  │
                    └─────┬─────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                    ┌────▼────┐                               │
│                    │ Node.js │  (Backend API)                │
│                    │Express  │                               │
│                    │Port 3000│                               │
│                    └────┬────┘                               │
│                         │                                     │
│         ┌───────────────┼───────────────┐                    │
│         │               │               │                    │
│    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐               │
│    │Security │    │Business │    │Real-time│               │
│    │Layer    │    │Logic    │    │Socket.IO│               │
│    │         │    │         │    │         │               │
│    │• Helmet │    │• Auth   │    │• Orders │               │
│    │• CORS   │    │• Orders │    │• Status │               │
│    │• Rate   │    │• Payment│    │• Location│              │
│    │  Limit  │    │• Users  │    │         │               │
│    └─────────┘    └────┬────┘    └─────────┘               │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
     │ MongoDB │    │External │    │ Cloud   │
     │Database │    │Services │    │Storage  │
     │         │    │         │    │         │
     │• Users  │    │• Stripe │    │Cloudinary│
     │• Orders │    │• Razorpay│   │         │
     │• Packages│   │• Gmail  │    │• Images │
     │• Partners│   │• Twilio │    │• Assets │
     │• Payments│   │• Google │    │         │
     └─────────┘    │  Maps   │    └─────────┘
                    └─────────┘
```

## Data Flow

### 1. Order Creation Flow
```
Customer → Frontend → API (/api/orders)
    ↓
Validate Data
    ↓
Create Order in DB
    ↓
Send Confirmation Email
    ↓
Emit Socket.IO Event → Admin Dashboard
    ↓
Return Order to Customer
```

### 2. Payment Flow
```
Customer → Select Package → Create Order
    ↓
Choose Payment Method (Stripe/Razorpay)
    ↓
Frontend → Payment Gateway API
    ↓
Payment Gateway → Webhook → Backend
    ↓
Update Order Payment Status
    ↓
Send Receipt Email
    ↓
Notify Customer via Socket.IO
```

### 3. Partner Location Tracking
```
Partner → Enable Location Sharing
    ↓
Get GPS Coordinates (every 30s)
    ↓
Send to Backend API
    ↓
Save in Partner Model
    ↓
Broadcast via Socket.IO
    ↓
Update on Admin & Customer Maps
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 7+ with Mongoose ODM
- **Authentication**: JWT + OTP
- **Real-time**: Socket.IO
- **Payments**: Stripe + Razorpay
- **Email**: Nodemailer
- **Storage**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Maps**: Google Maps JavaScript API
- **Real-time**: Socket.IO Client
- **Styling**: Modern CSS with Gradients
- **Fonts**: Poppins (Google Fonts)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt (Certbot)
- **Monitoring**: PM2 Monitor, Logs

## Security Layers

```
Request → Rate Limiter → CORS Check → Helmet Headers
    ↓
JWT Validation → Role Check → Input Sanitization
    ↓
MongoDB Injection Protection → XSS Clean
    ↓
Business Logic → Database
```

## API Structure

```
/api
  /auth
    POST /send-otp
    POST /verify-otp
  /users
    GET  /profile
    PUT  /profile
    PUT  /password
    GET  /orders
    GET  /stats
  /orders
    POST /
    GET  /myorders
  /payments
    POST /stripe/create-intent
    POST /stripe/confirm
    POST /razorpay/create-order
    POST /razorpay/verify
    GET  /history
  /partner
    GET  /orders/my
    GET  /orders/new
    PUT  /orders/:id/accept
    PUT  /orders/:id/status
    PUT  /location
  /admin
    GET  /packages
    POST /packages
    PUT  /packages/:id
    DELETE /packages/:id
    GET  /partners
    PUT  /partners/:id/approve
    GET  /orders
    PUT  /orders/:id/assign
```

## Database Schema

### Collections
1. **users** - Customer accounts
2. **partners** - Delivery partner accounts
3. **packages** - Event packages
4. **orders** - Order records
5. **payments** - Payment transactions

### Relationships
- Order → User (customer)
- Order → Package
- Order → Partner (assignedPartner)
- Payment → Order
- Payment → User

## Deployment Options

### Option 1: Docker Compose (Recommended)
```
docker-compose up -d
```
Includes: MongoDB, Backend, Nginx

### Option 2: PM2 (Manual)
```
pm2 start ecosystem.config.js
```
Requires: Separate MongoDB, Nginx setup

### Option 3: Cloud Platform
- AWS: EC2 + RDS/DocumentDB
- Azure: App Service + CosmosDB
- GCP: Compute Engine + Cloud SQL
- Heroku: Dyno + MongoDB Atlas

## Monitoring & Logs

- **Application Logs**: `backend/logs/`
- **PM2 Logs**: `~/.pm2/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **Health Check**: `GET /api/health`

## Performance Optimization

- Gzip compression
- Static file caching
- Connection pooling
- Database indexing
- CDN for images (Cloudinary)
- Rate limiting
- Cluster mode (PM2)

---

**Built for scalability, security, and performance** 🚀
