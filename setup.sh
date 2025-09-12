#!/bin/bash

echo "🚀 Setting up Luxury E-commerce Website..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client && npm install && cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database and API credentials"
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads

# Check if database exists
echo "🗄️  Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw luxury_ecommerce; then
    echo "✅ Database 'luxury_ecommerce' already exists"
else
    echo "🗄️  Creating database 'luxury_ecommerce'..."
    createdb luxury_ecommerce
fi

# Set up database schema
echo "🗄️  Setting up database schema..."
npm run db:setup

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the development servers: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "👤 Admin login: admin@luxuryecom.com / admin123"
echo ""
echo "🚀 Happy coding!"
