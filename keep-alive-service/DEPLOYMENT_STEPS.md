# 🚀 Deployment Steps for MindSettler Keep-Alive

## Current Status ✅
- Keep-alive service created and tested
- Backend is responding (200 OK)
- Database is disconnected (expected - needs redeployment)

## Step 1: Install Vercel CLI

Since `vercel` command wasn't found, install it:

```bash
npm install -g vercel
```

## Step 2: Deploy Keep-Alive Service

### Option A: Deploy to Render (Recommended - Free with full cron support)

1. Go to https://render.com
2. Sign up/login with GitHub
3. Click **New** → **Web Service**
4. Connect your repository: `Siddh-2006/GWOC_Duplicate`
5. Settings:
   - **Name**: `mindsettler-keep-alive`
   - **Root Directory**: `keep-alive-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Option B: Deploy to Vercel (Limited - Daily cron only)

```bash
cd GWOC/keep-alive-service
vercel --prod
```

**Note**: Vercel free tier only allows daily cron jobs, so this will ping once per day instead of every 5 minutes.

**During deployment, Vercel will ask:**
- Project name: `mindsettler-keep-alive` (or any name you prefer)
- Link to existing project: `N` (No)
- Directory: `.` (current directory)

## Step 3: Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Find your keep-alive project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production**, **Preview**, and **Development**:

```
BACKEND_URL=https://gwoc-lovat.vercel.app
PING_INTERVAL=*/5 * * * *
```

## Step 4: Redeploy Your Main Backend

After the keep-alive service is running, redeploy your main backend to wake up the database:

1. Go to Vercel dashboard
2. Find your main backend project (gwoc-lovat)
3. Click **Deployments**
4. Click **Redeploy** on the latest deployment

## Step 5: Verify Everything Works

1. **Check keep-alive dashboard**: `https://your-keepalive-url.vercel.app/dashboard`
2. **Test backend health**: `https://gwoc-lovat.vercel.app/health`
3. **Check database status**: Should show "connected" after backend redeploy

## Alternative: Deploy to Render (If Vercel Issues)

If you prefer Render or have issues with Vercel:

1. Go to https://render.com
2. Connect your GitHub repository
3. Create **New Web Service**
4. Settings:
   - **Root Directory**: `keep-alive-service`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `BACKEND_URL`: `https://gwoc-lovat.vercel.app`
     - `PING_INTERVAL`: `*/5 * * * *`

## Expected Timeline

1. **Deploy keep-alive**: 2-3 minutes
2. **Set environment variables**: 1 minute
3. **Redeploy backend**: 2-3 minutes
4. **Database reconnection**: 1-2 minutes
5. **First successful ping**: Within 5 minutes

## What Happens Next

Once deployed:
- ✅ Keep-alive service pings backend every 5 minutes
- ✅ Database stays warm and connected
- ✅ Users experience faster load times
- ✅ No more cold start delays
- ✅ Real-time monitoring via dashboard

## Monitoring URLs (After Deployment)

- **Dashboard**: `https://your-keepalive-url.vercel.app/dashboard`
- **Stats**: `https://your-keepalive-url.vercel.app/stats`
- **Manual Ping**: `https://your-keepalive-url.vercel.app/ping`

## Troubleshooting

**If keep-alive service shows errors:**
1. Check environment variables are set correctly
2. Verify backend URL is accessible
3. Redeploy main backend to wake up database

**If database still shows disconnected:**
1. Check MongoDB Atlas cluster isn't paused
2. Verify IP whitelist includes `0.0.0.0/0`
3. Redeploy backend to establish fresh connection

## Success Indicators

You'll know it's working when:
- ✅ Dashboard shows successful pings
- ✅ Backend health endpoint shows database "connected"
- ✅ Frontend loads faster (no cold start delays)
- ✅ Success rate > 95% in dashboard

---

**Ready to deploy! The keep-alive service will solve your cold start and database timeout issues! 🎉**