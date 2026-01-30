# 🚀 Quick Start Guide

## 1-Minute Setup

### Step 1: Test the Service
```bash
cd keep-alive-service
npm install
npm run test
```

### Step 2: Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI if you don't have it
npm install -g vercel

# Deploy
vercel --prod
```

### Step 3: Set Environment Variables in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your keep-alive project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `BACKEND_URL` = `https://gwoc-lovat.vercel.app`
   - `PING_INTERVAL` = `*/5 * * * *`

### Step 4: Monitor
Visit your deployed URL + `/dashboard` to see the live monitoring dashboard.

## Alternative: Deploy to Render

1. Go to https://render.com
2. Connect GitHub repo
3. Create Web Service from `keep-alive-service` folder
4. Set environment variables:
   - `BACKEND_URL` = `https://gwoc-lovat.vercel.app`
   - `PING_INTERVAL` = `*/5 * * * *`

## What This Does

✅ **Pings your backend every 5 minutes**
✅ **Keeps MongoDB connection warm**
✅ **Provides real-time dashboard**
✅ **Tracks success rates and response times**
✅ **Prevents cold starts**

## Expected Results

- **Faster backend response times**
- **No more cold start delays**
- **Database stays connected**
- **Better user experience**

## Monitoring URLs

After deployment, you'll have:
- `/` - Service status
- `/dashboard` - Visual monitoring dashboard
- `/stats` - JSON statistics
- `/ping` - Manual ping trigger
- `/health-check` - Comprehensive health check

## Troubleshooting

**Service not pinging?**
- Check environment variables are set
- Verify BACKEND_URL is correct
- Check deployment logs

**High error rate?**
- Check if backend is deployed correctly
- Verify MongoDB Atlas is not paused
- Check network connectivity

**Need help?**
- Check the dashboard for error details
- Use `/ping` endpoint to test manually
- Review service logs in your deployment platform

---

**That's it! Your backend will now stay warm 24/7! 🔥**