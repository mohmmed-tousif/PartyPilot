# PartyPilot - Deployment Guide

## 🚀 Production Deployment Checklist

### Environment Configuration
- [x] MongoDB Atlas connection string configured
- [x] Strong JWT secret generated
- [x] Port configuration set
- [x] NODE_ENV set to production

### Database
- [x] 34 party packages seeded with relevant images
- [x] Indexes optimized
- [x] Backup strategy in place

### Security
- [x] JWT authentication implemented
- [x] Password hashing with bcrypt
- [x] Role-based access control
- [x] CORS configuration reviewed

### Frontend
- [x] SEO meta tags added
- [x] Mobile responsive design
- [x] Relevant party/event images
- [x] Modern gradient UI
- [x] Performance optimized

### API Endpoints
- [x] All CRUD operations tested
- [x] Error handling implemented
- [x] Socket.IO real-time updates working

## 📋 Deployment Steps

### Heroku Deployment
```bash
# 1. Create Heroku app
heroku create partypilot-app

# 2. Set environment variables
heroku config:set MONGO_URI="<your_mongodb_atlas_uri>"
heroku config:set JWT_SECRET="<strong_secret_key>"
heroku config:set NODE_ENV="production"

# 3. Deploy
git push heroku main

# 4. Seed database (one-time)
heroku run node backend/seeds/seedPackages.js
```

### AWS EC2 Deployment
```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone <your-repo-url>
cd partypilot/backend

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Add: MONGO_URI, JWT_SECRET, PORT

# 6. Install PM2
sudo npm install -g pm2

# 7. Start application
pm2 start server.js --name partypilot
pm2 startup
pm2 save

# 8. Configure Nginx (optional)
sudo apt install nginx
# Configure reverse proxy to port 3000
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t partypilot .
docker run -p 3000:3000 \
  -e MONGO_URI="<your_uri>" \
  -e JWT_SECRET="<your_secret>" \
  partypilot
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong JWT secrets (32+ characters)
   - Rotate secrets regularly

2. **Database**
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Regular backups

3. **API Security**
   - Rate limiting implemented
   - Input validation
   - SQL injection protection via Mongoose

## 📊 Monitoring

### Health Check Endpoint
Add to `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### PM2 Monitoring
```bash
pm2 monit
pm2 logs partypilot
```

## 🎯 Post-Deployment

1. **Test all user flows:**
   - Customer registration and ordering
   - Partner order acceptance
   - Admin package management

2. **Verify real-time features:**
   - Socket.IO connections
   - Order status updates
   - Notifications

3. **Check performance:**
   - Page load times
   - API response times
   - Image loading

## 📞 Support

For deployment issues, check:
- MongoDB connection string
- Environment variables
- Firewall rules
- DNS configuration

---

**Application is production-ready! 🎉**
