# 🎉 PartyPilot - Production-Ready Event Management Platform

A complete, production-ready event management and party planning platform with payment integration, real-time tracking, and comprehensive features.

## ✨ Features

### 🎯 Core Features
- 🔐 **Secure Authentication** - OTP-based login with JWT
- 💳 **Payment Integration** - Stripe & Razorpay support
- 📧 **Email Notifications** - Automated order confirmations and updates
- 📱 **Real-time Tracking** - Socket.IO for live order and location updates
- 🗺️ **Google Maps Integration** - Partner location tracking
- ☁️ **Cloud Storage** - Cloudinary for image management
- 🔒 **Enterprise Security** - Helmet, rate limiting, XSS protection

### 👥 User Roles
- **Customers** - Browse packages, place orders, track delivery
- **Partners** - Accept orders, update status, share location
- **Admin** - Manage packages, assign partners, view analytics

### 💼 Business Features
- 36+ pre-seeded party packages
- Advanced search & filtering
- Package ratings and reviews
- Order history and analytics
- Payment receipts and tracking
- Profile management
- Real-time notifications

## 🚀 Quick Start

### Windows
```powershell
# Run setup script
.\setup.bat

# Configure .env file with your credentials
# Then start the server
cd backend
npm start
```

### Linux/Mac
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Configure .env file with your credentials
# Then start the server
cd backend
npm start
```

### Manual Setup
```bash
# Install dependencies
cd backend
npm install

# Copy environment file
cp .env.example .env

# Configure .env with your credentials

# Seed database
npm run seed

# Start server
npm start
```

Visit `http://localhost:3000` in your browser.

## 📋 Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/partypilot

# JWT
JWT_SECRET=your_strong_secret_here

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_maps_key
```

See `.env.example` for all configuration options.

## 📚 Documentation

- **[Production Deployment Guide](PRODUCTION_GUIDE.md)** - Complete deployment instructions
- **[API Documentation](API_DOCUMENTATION.md)** - Full API reference
- **[Google Maps Setup](GOOGLE_MAPS_SETUP.md)** - Maps integration guide
- **[Partner Dashboard Guide](PARTNER_DASHBOARD_COMPLETE.md)** - Partner features

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Includes:
- MongoDB database
- Node.js backend
- Nginx reverse proxy

## 🛠️ Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO (Real-time)
- JWT Authentication
- Stripe & Razorpay
- Nodemailer
- Cloudinary
- Helmet, Rate Limiting, CORS

### Frontend
- Vanilla JavaScript
- Google Maps API
- Socket.IO Client
- Responsive CSS

### DevOps
- Docker & Docker Compose
- PM2 Process Manager
- Nginx Reverse Proxy
- SSL/TLS Support

## 📱 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP and login

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/myorders` - Get customer orders

### Payments
- `POST /api/payments/stripe/create-intent` - Stripe payment
- `POST /api/payments/razorpay/create-order` - Razorpay payment
- `GET /api/payments/history` - Payment history

### User
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

## 🔒 Security Features

- JWT token authentication
- OTP verification
- Rate limiting (100 req/15min)
- CORS configuration
- MongoDB injection protection
- XSS protection
- Security headers (Helmet)
- Input validation
- Password hashing (bcrypt)

## 📊 Admin Features

- Dashboard with analytics
- Package management (CRUD)
- Partner approval system
- Order assignment
- Revenue tracking
- User management

## 🚚 Partner Features

- Order acceptance/decline
- Status updates
- Real-time location sharing
- Earnings tracking
- Order history

## 👤 Customer Features

- Package browsing & search
- Order placement
- Payment options
- Order tracking
- Profile management
- Order history

## 🧪 Testing

```bash
# Development mode
npm run dev

# Production mode
NODE_ENV=production npm start

# Health check
curl http://localhost:3000/api/health
```

## 📈 Monitoring

```bash
# PM2 monitoring
pm2 monit
pm2 logs partypilot

# Docker logs
docker-compose logs -f backend
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

For issues or questions:
- Check documentation files
- Review API documentation
- Check server logs
- Verify environment variables

## 📄 License

This project is licensed under the MIT License.

## 🎉 Ready for Production!

This application is production-ready with:
- ✅ Payment gateway integration
- ✅ Email notifications
- ✅ Cloud storage
- ✅ Real-time features
- ✅ Security best practices
- ✅ Docker deployment
- ✅ Complete documentation
- ✅ Health monitoring
- ✅ SSL/TLS support
- ✅ Rate limiting

---

**Built with ❤️ for event management excellence**
