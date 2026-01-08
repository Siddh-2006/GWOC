#!/bin/bash

# MindSettler Production Build Script
echo "🚀 Building MindSettler for Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package-lock.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    print_error "Please run this script from the GWOC root directory"
    exit 1
fi

# Build Frontend
print_status "Building Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
fi

# Run production build
npm run build:prod

if [ $? -eq 0 ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

cd ..

# Prepare Backend
print_status "Preparing Backend..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing backend dependencies..."
    npm install
fi

# Run linting
npm run lint

if [ $? -eq 0 ]; then
    print_status "Backend preparation completed successfully"
else
    print_warning "Backend linting found issues, but continuing..."
fi

cd ..

# Create deployment package info
print_status "Creating deployment info..."
cat > deployment-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0.0",
  "environment": "production",
  "frontend": {
    "buildPath": "frontend/dist",
    "framework": "React + Vite"
  },
  "backend": {
    "entryPoint": "backend/src/index.js",
    "runtime": "Node.js"
  }
}
EOF

print_status "Production build completed successfully!"
print_warning "Next steps:"
echo "1. Deploy frontend/dist to Vercel (or your hosting provider)"
echo "2. Deploy backend to Vercel Functions (or your hosting provider)"
echo "3. Configure environment variables"
echo "4. Test all functionality"

print_status "Build artifacts:"
echo "- Frontend: frontend/dist/"
echo "- Backend: backend/src/"
echo "- Deployment info: deployment-info.json"