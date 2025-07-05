#!/bin/bash

# deploy.sh - Fixed deployment script

echo "🚀 Deploying Circles Path Explorer..."

# Set environment variables
echo "🔧 Setting environment variables..."
while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] || [[ "$key" == "PORT" ]] && continue
    value="${value#[\"\']}"
    value="${value%[\"\']}"
    [[ "$key" == "VITE_CHAT_SERVER_URL" ]] && value="https://circles-path-explorer.vercel.app"
    [[ "$key" == "FRONTEND_URL" ]] && value="https://circles-path-explorer.vercel.app"
    echo -e "$value\n" | vercel env add "$key" production --yes 2>/dev/null
done < .env

# Add chat URL
echo -e "https://circles-path-explorer.vercel.app\n" | vercel env add VITE_CHAT_SERVER_URL production --yes 2>/dev/null

# Pull env vars
echo "📥 Pulling environment variables..."
vercel env pull .env.production

# Install
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..

# Build
echo "🔨 Building..."
npm run build:all

# Deploy
echo "🚀 Deploying..."
vercel --prod

echo "✅ Done! Visit: https://circles-path-explorer.vercel.app"