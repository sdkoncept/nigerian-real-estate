#!/bin/bash

# Quick deployment script for Agents Page fix
# This ensures the latest code is built and deployed

echo "🚀 Deploying Agents Page Fix..."
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Clear any build cache
echo "📦 Step 1: Clearing build cache..."
cd frontend
rm -rf node_modules/.vite
rm -rf dist
echo "✅ Cache cleared"
echo ""

# Step 2: Rebuild
echo "🔨 Step 2: Rebuilding frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 3: Check if using Git
if [ -d ".git" ]; then
    echo "📝 Step 3: Committing changes..."
    cd ..
    git add frontend/src/pages/AgentsPage.tsx
    git commit -m "Fix: Agents page now loads from database (removed sample data dependency)"
    echo "✅ Changes committed"
    echo ""
    echo "📤 Step 4: Push to deploy (if using Vercel/GitHub):"
    echo "   git push origin main"
    echo ""
else
    echo "ℹ️  Not a git repository - manual deployment required"
    echo ""
fi

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. If using Vercel: Push to git and it will auto-deploy"
echo "2. If using other hosting: Upload the 'frontend/dist' folder"
echo "3. Clear browser cache and hard refresh (Ctrl+F5)"
echo "4. Check browser console for logs starting with 🚀"

