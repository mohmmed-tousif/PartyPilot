# PartyPilot - Production Deployment Guide

## 🚀 Complete Production-Ready Features

### ✅ Implemented Features

#### 1. **Payment Integration**
- ✅ Stripe payment gateway (Credit/Debit cards)
- ✅ Razorpay integration (India - UPI, Cards, Wallets)
- ✅ Payment webhooks for automatic confirmation
- ✅ Payment receipt generation
- ✅ Payment history tracking
- ✅ Refund support

#### 2. **Security Features**
- ✅ Helmet.js for security headers
- ✅ Rate limiting (API: 100 req/15min, Auth: 5 req/15min)
- ✅ CORS configuration
- ✅ MongoDB injection protection
- ✅ XSS protection
- ✅ HTTP parameter pollution prevention
- ✅ Input validation and sanitization

#### 3. **Email Notifications**
- ✅ OTP verification emails
- ✅ Order confirmation emails
- ✅ Order status update emails
- ✅ Payment receipt emails
- ✅ HTML email templates

#### 4. **Cloud Storage**
- ✅ Cloudinary integration for images
- ✅ Automatic image optimization
- ✅ Package image galleries (multiple images)
- ✅ Profile picture uploads

#### 5. **User Management**
- ✅ Profile management (view/edit)
- ✅ Password change
- ✅ Order history with pagination
- ✅ User statistics dashboard
- ✅ Account deletion

#### 6. **Real-time Features**
- ✅ Socket.IO for live updates
- ✅ Real-time order notifications
- ✅ Partner location tracking
- ✅ Admin dashboard live updates

#### 7. **Deployment Ready**
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Nginx reverse proxy configuration
- ✅ PM2 cluster mode setup
- ✅ Health check endpoints
- ✅ Logging and monitoring
- ✅ Compression middleware
- ✅ Production environment config

---

## 📋 Prerequisites

- Node.js 18+ (LTS)
- MongoDB 7+
- Docker & Docker Compose (optional)
- PM2 (for production without Docker)
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

---

## 🔧 Environment Setup

### 1. Copy Environment File

```bash
cd backend
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your credentials. See `.env.example` for all required variables.

**Critical Variables:**
- `JWT_SECRET`: Generate strong random string
- Payment gateway keys (Stripe/Razorpay)
- Email credentials (Gmail app password)
- Cloudinary credentials
- Google Maps API key

---

## 🐳 Docker Deployment (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Services included:
- MongoDB on port 27017
- Backend API on port 3000
- Nginx reverse proxy on port 80/443

---

## 🖥️ Manual Deployment

```bash
# Install dependencies
cd backend && npm install --production

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save and setup startup
pm2 save
pm2 startup
```

---

## 🔐 SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔑 API Keys Setup

### Stripe
1. Dashboard: https://dashboard.stripe.com
2. Get API keys from Developers → API keys
3. Setup webhook: `https://yourdomain.com/api/payments/webhook/stripe`

### Razorpay
1. Dashboard: https://dashboard.razorpay.com
2. Settings → API Keys

### Gmail
1. Enable 2FA
2. Generate App Password
3. Use in EMAIL_PASSWORD

### Cloudinary
1. Sign up: https://cloudinary.com
2. Copy credentials from Dashboard

### Google Maps
1. Console: https://console.cloud.google.com
2. Enable Maps JavaScript API
3. Create restricted API key

---

## 📊 Database

```bash
# Seed initial data
npm run seed

# Backup
mongodump --uri="mongodb://localhost:27017/partypilot" --out=/backup

# Restore
mongorestore --uri="mongodb://localhost:27017/partypilot" /backup
```

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Development
npm run dev

# Production
NODE_ENV=production npm start
```

---

## 📈 Monitoring

```bash
# PM2 monitoring
pm2 monit
pm2 logs partypilot

# Docker logs
docker-compose logs -f backend
```

---

## 🚨 Troubleshooting

**Port in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**MongoDB issues:**
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
```

**Payment webhooks:**
- Verify webhook URL in dashboard
- Check webhook secret in `.env`
- Ensure HTTPS is configured

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall
- [ ] Enable MongoDB authentication
- [ ] Restrict API keys by domain
- [ ] Setup backup strategy
- [ ] Enable rate limiting
- [ ] Monitor logs

---

## 🎉 Production Checklist

- [ ] All environment variables configured
- [ ] Payment gateways tested
- [ ] Email service working
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] MongoDB backups scheduled
- [ ] Rate limiting configured
- [ ] CORS origins restricted
- [ ] Health checks responding

---

**Your PartyPilot application is production-ready! 🚀**
