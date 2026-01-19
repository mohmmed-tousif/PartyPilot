# 🚀 Quick Start Guide

## Instant Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Step 3: Start Server
```bash
npm start
```

### Step 4: Open Browser
```
http://localhost:3000
```

---

## Essential Configuration

### Minimum Required (To Start)
```env
MONGO_URI=mongodb://localhost:27017/partypilot
JWT_SECRET=your_secret_key_here
PORT=3000
```

### For Full Features
Add these to `.env`:

**Payments:**
```env
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

**Email:**
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Storage:**
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Maps:**
```env
GOOGLE_MAPS_API_KEY=...
```

---

## Common Commands

### Development
```bash
npm run dev          # Start with nodemon
npm start            # Production mode
npm run seed         # Seed database
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f            # View logs
docker-compose restart backend    # Restart backend
docker-compose down               # Stop all services
```

### PM2
```bash
pm2 start ecosystem.config.js     # Start app
pm2 logs partypilot               # View logs
pm2 restart partypilot            # Restart
pm2 stop partypilot               # Stop
pm2 monit                         # Monitor
```

---

## Default Users

After seeding database:

**Customer:**
- Phone: `1234567890`
- OTP: Check console

**Admin:**
- Create via POST `/api/auth/register-admin`

**Partner:**
- Register and wait for admin approval

---

## API Endpoints Quick Reference

### Auth
```
POST /api/auth/send-otp           Send OTP
POST /api/auth/verify-otp         Login
```

### Orders
```
POST /api/orders                  Create order
GET  /api/orders/myorders         My orders
```

### Payments
```
POST /api/payments/stripe/create-intent
POST /api/payments/razorpay/create-order
```

### Admin
```
GET  /api/admin/packages          List packages
POST /api/admin/packages          Create package
PUT  /api/admin/orders/:id/assign  Assign partner
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### MongoDB Not Connected
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
sudo systemctl start mongod
```

### Email Not Sending
1. Use Gmail App Password (not regular password)
2. Enable 2FA first
3. Generate app-specific password
4. Update EMAIL_PASSWORD in .env

### Payment Not Working
1. Check API keys in .env
2. Use test keys for development
3. Configure webhooks in payment dashboard
4. Check server logs for errors

---

## File Structure

```
partypilot/
├── backend/
│   ├── server.js              ← Main entry point
│   ├── config/                ← Database config
│   ├── controllers/           ← Business logic
│   ├── models/                ← MongoDB schemas
│   ├── routes/                ← API routes
│   ├── middleware/            ← Auth, security
│   ├── utils/                 ← Helpers, services
│   └── seeds/                 ← Database seeds
├── frontend/
│   ├── index.html             ← Landing page
│   ├── customer/              ← Customer portal
│   ├── partner/               ← Partner portal
│   ├── admin/                 ← Admin panel
│   └── assets/                ← CSS, JS, images
├── docker-compose.yml         ← Container orchestration
├── Dockerfile                 ← Container image
├── nginx.conf                 ← Web server config
└── ecosystem.config.js        ← PM2 config
```

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Can register new user
- [ ] OTP received (check console/email)
- [ ] Can browse packages
- [ ] Can place order
- [ ] Payment flow works
- [ ] Email notifications sent
- [ ] Real-time updates working
- [ ] Partner can accept orders
- [ ] Admin can manage packages

---

## Quick Links

- **Health Check**: http://localhost:3000/api/health
- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment**: [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)
- **Features**: [FEATURES.md](FEATURES.md)

---

## Getting Help

1. **Check Logs**
   ```bash
   pm2 logs partypilot
   # or
   docker-compose logs -f backend
   ```

2. **Review Documentation**
   - README.md
   - PRODUCTION_GUIDE.md
   - API_DOCUMENTATION.md

3. **Common Issues**
   - Port conflicts → Kill existing process
   - MongoDB errors → Check connection
   - Payment errors → Verify API keys
   - Email errors → Check credentials

---

## Production Deployment

1. **Get Domain & SSL**
2. **Configure .env with production keys**
3. **Deploy with Docker or PM2**
4. **Setup payment webhooks**
5. **Test everything**
6. **Go live!**

See [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md) for detailed steps.

---

**Your production-ready event management platform awaits! 🎉**
