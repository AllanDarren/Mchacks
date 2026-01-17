#!/bin/bash

# MentorMatch Setup Script
echo "🚀 MentorMatch Setup Starting..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local
echo "🔑 Creating .env.local..."
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "✅ .env.local created. Please fill in your Supabase credentials."
else
  echo "⚠️  .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run SQL from database.sql in Supabase SQL Editor"
echo "3. Run: npm run dev"
echo ""
echo "🎯 Open http://localhost:3000"
