# Production 500 Error Debugging Guide

## Current Issue
- Frontend: `https://mindsettlerxparnika.vercel.app`
- Backend: `https://gwoc-lovat.vercel.app/api`
- Error: 500 Internal Server Error on `/api/media/published`

## Debugging Steps

### 1. Check Vercel Function Logs
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project (`gwoc-lovat`)
3. Go to "Functions" tab
4. Look for recent error logs

### 2. Test Backend Health
Test if backend is running:
```bash
curl https://gwoc-lovat.vercel.app/health
```

### 3. Test Media Endpoint Directly
```bash
curl -X GET "https://gwoc-lovat.vercel.app/api/media/published?page=1&limit=12" \
  -H "Content-Type: application/json"
```

### 4. Common Causes of 500 Errors

#### A. Environment Variables Missing
Check if these are set in Vercel:
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGIN`

#### B. Database Connection Issues
- MongoDB Atlas connection string might be wrong
- IP whitelist might not include Vercel's IPs
- Database credentials might be expired

#### C. Code Issues
- Missing dependencies in package.json
- Syntax errors in recent commits
- Middleware errors (CORS, auth)

### 5. Quick Fixes to Try

#### Fix 1: Redeploy Backend
```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger backend redeploy"
git push origin main
```

#### Fix 2: Check MongoDB Connection
Ensure MongoDB Atlas:
- Allows connections from anywhere (0.0.0.0/0)
- Has correct credentials
- Database name matches MONGODB_URI

#### Fix 3: Verify Environment Variables
In Vercel dashboard, ensure all environment variables are set correctly.

## Expected Working Flow
1. Frontend calls: `https://gwoc-lovat.vercel.app/api/media/published`
2. Backend CORS allows: `https://mindsettlerxparnika.vercel.app`
3. Database query executes successfully
4. Response returns with media data

## Next Steps
1. Check Vercel function logs for specific error
2. Test backend health endpoint
3. Verify environment variables are set
4. Check MongoDB connection