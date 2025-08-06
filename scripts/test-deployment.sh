#!/bin/bash

# Test Deployment Script
# This script tests the deployment setup locally

set -e

echo "🧪 Testing deployment setup..."

# Check if required environment variables are set
echo "📋 Checking environment variables..."
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN is not set"
    echo "💡 Set it with: export CLOUDFLARE_API_TOKEN='your_token'"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ CLOUDFLARE_ACCOUNT_ID is not set"
    echo "💡 Set it with: export CLOUDFLARE_ACCOUNT_ID='your_account_id'"
    exit 1
fi

echo "✅ Environment variables are set"

# Check if wrangler is installed
echo "🔧 Checking wrangler installation..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler is not installed"
    echo "💡 Install it with: npm install -g wrangler@latest"
    exit 1
fi

echo "✅ wrangler is installed"

# Test project creation script
echo "🚀 Testing project creation script..."
if [ -f "./scripts/create-cloudflare-project.sh" ]; then
    echo "✅ Project creation script exists"
    chmod +x ./scripts/create-cloudflare-project.sh
else
    echo "❌ Project creation script not found"
    exit 1
fi

# Test build process
echo "🏗️  Testing build process..."
if pnpm run build:pages; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

# Check if build output exists
echo "📁 Checking build output..."
if [ -d "build/client" ]; then
    echo "✅ Build output directory exists"
    echo "📊 Build output contents:"
    ls -la build/client/
else
    echo "❌ Build output directory not found"
    exit 1
fi

echo "🎉 All tests passed! Ready for deployment."
echo ""
echo "📝 Next steps:"
echo "1. Push to main branch to trigger GitHub Actions"
echo "2. Or manually trigger the workflow in GitHub"
echo "3. Monitor the deployment in Cloudflare Dashboard"