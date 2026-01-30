@echo off
echo 🚀 MindSettler Keep-Alive Service Deployment
echo =============================================

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Please run this script from the keep-alive-service directory
    pause
    exit /b 1
)

REM Install dependencies
echo ℹ️  Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Test the service
echo ℹ️  Testing backend connection...
call npm run test

echo.
echo Choose deployment platform:
echo 1) Vercel (Recommended - has cron jobs)
echo 2) Render (Good alternative)
echo 3) Railway (Another option)
echo 4) Skip deployment (just test)
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo ℹ️  Deploying to Vercel...
    
    REM Check if Vercel CLI is installed
    vercel --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️  Vercel CLI not found. Installing...
        call npm install -g vercel
    )
    
    REM Deploy to Vercel
    call vercel --prod
    
    if %errorlevel% equ 0 (
        echo ✅ Deployed to Vercel successfully!
        echo ℹ️  Don't forget to set environment variables in Vercel dashboard:
        echo ℹ️  - BACKEND_URL: https://gwoc-lovat.vercel.app
        echo ℹ️  - PING_INTERVAL: */5 * * * *
    ) else (
        echo ❌ Vercel deployment failed
    )
) else if "%choice%"=="2" (
    echo ℹ️  For Render deployment:
    echo ℹ️  1. Go to https://render.com
    echo ℹ️  2. Connect your GitHub repository
    echo ℹ️  3. Create a new Web Service
    echo ℹ️  4. Set root directory to: keep-alive-service
    echo ℹ️  5. Build Command: npm install
    echo ℹ️  6. Start Command: npm start
    echo ℹ️  7. Add environment variables:
    echo ℹ️     - BACKEND_URL: https://gwoc-lovat.vercel.app
    echo ℹ️     - PING_INTERVAL: */5 * * * *
) else if "%choice%"=="3" (
    echo ℹ️  For Railway deployment:
    echo ℹ️  1. Go to https://railway.app
    echo ℹ️  2. Connect your GitHub repository
    echo ℹ️  3. Deploy from keep-alive-service folder
    echo ℹ️  4. Add environment variables:
    echo ℹ️     - BACKEND_URL: https://gwoc-lovat.vercel.app
    echo ℹ️     - PING_INTERVAL: */5 * * * *
) else if "%choice%"=="4" (
    echo ℹ️  Skipping deployment
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed!
echo ℹ️  Next steps:
echo ℹ️  1. Ensure your backend URL is correct in environment variables
echo ℹ️  2. Monitor the dashboard at your deployed URL + /dashboard
echo ℹ️  3. Check /stats endpoint for detailed statistics
echo ℹ️  4. Use /ping for manual testing

echo.
echo ⚠️  Important reminders:
echo ⚠️  - Set BACKEND_URL environment variable in your deployment platform
echo ⚠️  - Monitor your service usage to avoid unexpected costs
echo ⚠️  - Check the dashboard regularly to ensure everything is working

echo.
echo 🎉 Keep-alive service is ready to keep your backend warm!
pause