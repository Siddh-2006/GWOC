#!/bin/bash

# MindSettler Keep-Alive Service Deployment Script
echo "🚀 MindSettler Keep-Alive Service Deployment"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the keep-alive-service directory"
    exit 1
fi

# Install dependencies
print_info "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Test the service
print_info "Testing backend connection..."
npm run test

# Ask user which platform to deploy to
echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Recommended - has cron jobs)"
echo "2) Render (Good alternative)"
echo "3) Railway (Another option)"
echo "4) Skip deployment (just test)"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        # Deploy to Vercel
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_success "Deployed to Vercel successfully!"
            print_info "Don't forget to set environment variables in Vercel dashboard:"
            print_info "- BACKEND_URL: https://gwoc-lovat.vercel.app"
            print_info "- PING_INTERVAL: */5 * * * *"
        else
            print_error "Vercel deployment failed"
        fi
        ;;
        
    2)
        print_info "For Render deployment:"
        print_info "1. Go to https://render.com"
        print_info "2. Connect your GitHub repository"
        print_info "3. Create a new Web Service"
        print_info "4. Set root directory to: keep-alive-service"
        print_info "5. Build Command: npm install"
        print_info "6. Start Command: npm start"
        print_info "7. Add environment variables:"
        print_info "   - BACKEND_URL: https://gwoc-lovat.vercel.app"
        print_info "   - PING_INTERVAL: */5 * * * *"
        ;;
        
    3)
        print_info "For Railway deployment:"
        print_info "1. Go to https://railway.app"
        print_info "2. Connect your GitHub repository"
        print_info "3. Deploy from keep-alive-service folder"
        print_info "4. Add environment variables:"
        print_info "   - BACKEND_URL: https://gwoc-lovat.vercel.app"
        print_info "   - PING_INTERVAL: */5 * * * *"
        ;;
        
    4)
        print_info "Skipping deployment"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Setup completed!"
print_info "Next steps:"
print_info "1. Ensure your backend URL is correct in environment variables"
print_info "2. Monitor the dashboard at your deployed URL + /dashboard"
print_info "3. Check /stats endpoint for detailed statistics"
print_info "4. Use /ping for manual testing"

echo ""
print_warning "Important reminders:"
print_warning "- Set BACKEND_URL environment variable in your deployment platform"
print_warning "- Monitor your service usage to avoid unexpected costs"
print_warning "- Check the dashboard regularly to ensure everything is working"

echo ""
print_success "🎉 Keep-alive service is ready to keep your backend warm!"