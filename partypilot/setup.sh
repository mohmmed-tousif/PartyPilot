#!/bin/bash

# PartyPilot Quick Setup Script

echo "🎉 PartyPilot Setup Script"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB 7+"
    echo "   Visit: https://www.mongodb.com/try/download/community"
fi

echo ""
echo "📦 Installing dependencies..."
cd backend
npm install

echo ""
echo "📝 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - Please configure with your credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your API keys"
echo "2. Start MongoDB: mongod"
echo "3. Start server: npm start"
echo "4. Open browser: http://localhost:3000"
echo ""
echo "For production deployment, see PRODUCTION_GUIDE.md"
