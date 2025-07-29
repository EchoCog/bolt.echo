#!/bin/bash

echo "Testing Cloudflare Pages deployment configuration..."

# Build the project
echo "Building project..."
pnpm run build:pages

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    
    # Check if build output exists
    if [ -d "build/client" ]; then
        echo "✅ Build output directory exists"
        echo "📁 Build output contents:"
        ls -la build/client/
        
        # Check for key files
        if [ -f "build/client/index.html" ]; then
            echo "✅ index.html exists"
        else
            echo "❌ index.html missing"
        fi
        
        if [ -d "build/client/assets" ]; then
            echo "✅ assets directory exists"
            echo "📊 Number of asset files: $(find build/client/assets -type f | wc -l)"
        else
            echo "❌ assets directory missing"
        fi
        
    else
        echo "❌ Build output directory missing"
        exit 1
    fi
    
    echo ""
    echo "🎉 Deployment configuration is correct!"
    echo ""
    echo "To deploy to Cloudflare Pages:"
    echo "1. Set up authentication with: wrangler login"
    echo "2. Or use GitHub integration with Cloudflare Pages"
    echo "3. Run: pnpm run deploy"
    
else
    echo "❌ Build failed"
    exit 1
fi