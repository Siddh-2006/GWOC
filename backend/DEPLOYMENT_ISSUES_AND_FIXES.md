# Backend Deployment Issues and Fixes

## Issues Found

### 1. ❌ Missing Environment Variables in Vercel
**Problem**: The `vercel.json` referenced environment variables using `@variable_name` syntax, but these secrets were never set up in Vercel dashboard.

**Impact**: Backend couldn't connect to MongoDB, send emails, or access any external services.

**Fix**: 
- Simplified `vercel.json` to remove environment variable references
- Created deployment guide with all required environment variables
- You MUST set these in Vercel Dashboard → Settings → Environment Variables

### 2. ❌ Cron Job in Serverless Environment
**Problem**: The `sessionReminderService.start()` was being called in production, which tries to run a cron job. Serverless functions are stateless and don't support long-running cron jobs.

**Impact**: Could cause the serverless function to hang or fail during initialization.

**Fix**: 
- Disabled cron service in production
- Added comment that cron jobs should use Vercel Cron Jobs or external services
- Cron only runs in development now

### 3. ❌ Database Connection Not Optimized for Serverless
**Problem**: MongoDB connection was being established on every cold start without proper error handling for serverless.

**Impact**: Slow cold starts, potential timeout errors.

**Fix**: 
- Kept connection pooling settings optimized for serverless
- Added proper error handling that doesn't crash the function
- Connection is lazy-loaded on first request

### 4. ❌ Missing Default Export
**Problem**: The Express app wasn't being exported as default, which Vercel requires for serverless functions.

**Impact**: Vercel couldn't find the handler function, causing 404 or 500 errors.

**Fix**: 
- Added `export default app;` at the end of index.js
- This allows Vercel to use the Express app as a serverless function

### 5. ❌ Environment Variable Loading in Production
**Problem**: `dotenv.config()` was being called in production, which is unnecessary since Vercel provides environment variables directly.

**Impact**: Minor performance overhead, potential conflicts.

**Fix**: 
- Only load `.env` file in development
- In production, environment variables come from Vercel platform

### 6. ⚠️ Vercel Configuration Using Deprecated Syntax
**Problem**: Using `rewrites` instead of `routes` in vercel.json.

**Impact**: Might work but not following current best practices.

**Fix**: 
- Changed to use `routes` instead of `rewrites`
- Simplified configuration

## What You Need to Do Now

### Step 1: Set Environment Variables in Vercel (CRITICAL!)

1. Go to https://vercel.com/dashboard
2. Select your backend project (gwoc-lovat)
3. Go to **Settings** → **Environment Variables**
4. Add ALL variables from `DEPLOYMENT_CHECKLIST.md`
5. Make sure to select **Production**, **Preview**, AND **Development** for each variable

### Step 2: Verify MongoDB Atlas Configuration

1. Go to https://cloud.mongodb.com
2. Click **Network Access**
3. Ensure `0.0.0.0/0` is in the IP whitelist
4. Click **Database Access**
5. Verify user `mindsettler` exists with correct password
6. Ensure cluster is not paused

### Step 3: Redeploy Backend

Option A - Automatic (if GitHub connected):
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

Option B - Manual via Vercel Dashboard:
1. Go to Vercel dashboard
2. Select backend project
3. Click **Deployments**
4. Click **Redeploy** on latest deployment

### Step 4: Test Deployment

After deployment completes, test these URLs:

1. **Root**: https://gwoc-lovat.vercel.app/
   ```json
   {"message": "MindSettler API is running", "timestamp": "...", "environment": "production"}
   ```

2. **Health**: https://gwoc-lovat.vercel.app/health
   ```json
   {"status": "OK", "database": {"status": "connected", "test": "success"}, ...}
   ```

3. **API Endpoint**: https://gwoc-lovat.vercel.app/api/auth/...

### Step 5: Check Logs if Issues Persist

1. Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on `src/index.js`
5. Look for error messages

## Common Error Messages and Solutions

### "Cannot find module"
**Cause**: Missing `.js` extension in import statements
**Fix**: Ensure all imports have `.js` extension (ES modules requirement)

### "MongoDB connection timeout" or "ECONNREFUSED"
**Cause**: 
- `MONGODB_URI` not set in Vercel
- MongoDB Atlas not allowing connections from Vercel IPs

**Fix**:
1. Verify `MONGODB_URI` is set in Vercel dashboard
2. Add `0.0.0.0/0` to MongoDB Atlas IP whitelist
3. Check MongoDB cluster is running (not paused)

### "CORS blocked" from frontend
**Cause**: 
- `CORS_ORIGIN` not set correctly
- Frontend URL doesn't match CORS configuration

**Fix**:
1. Set `CORS_ORIGIN=https://gwoc-f8d2.vercel.app` in Vercel
2. Verify frontend URL is correct

### "Function execution timeout"
**Cause**: 
- Database connection taking too long
- Heavy computation in route handler

**Fix**:
1. Check MongoDB connection is fast
2. Optimize slow database queries
3. Increase timeout in vercel.json (already set to 30s)

### "Internal Server Error (500)"
**Cause**: Various - check logs for specific error

**Fix**:
1. Check Vercel function logs for exact error
2. Verify all environment variables are set
3. Test locally first with `npm run dev`

## Files Modified

1. ✅ `GWOC/backend/vercel.json` - Simplified configuration
2. ✅ `GWOC/backend/src/index.js` - Fixed serverless compatibility
3. ✅ `GWOC/backend/VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
4. ✅ `GWOC/backend/DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
5. ✅ `GWOC/backend/DEPLOYMENT_ISSUES_AND_FIXES.md` - This file

## Testing Locally Before Deployment

To test if the backend works correctly:

```bash
cd GWOC/backend
npm install
npm run dev
```

Then test:
- http://localhost:3001/ - Should return API running message
- http://localhost:3001/health - Should show database connected
- http://localhost:3001/api/... - Test your API endpoints

## Next Steps

1. ✅ Set all environment variables in Vercel dashboard
2. ✅ Verify MongoDB Atlas IP whitelist
3. ✅ Commit and push changes to GitHub
4. ✅ Wait for Vercel to auto-deploy (or manually redeploy)
5. ✅ Test all endpoints
6. ✅ Check Vercel function logs for any errors
7. ✅ Test frontend connection to backend

## Important Notes

- **Never commit `.env.production`** - It contains sensitive credentials
- **Always use Vercel dashboard for environment variables** - Don't put them in code
- **MongoDB connection is lazy** - First request after cold start will be slower
- **Serverless functions are stateless** - Don't rely on in-memory state
- **Cron jobs need external service** - Use Vercel Cron Jobs or GitHub Actions

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas: https://cloud.mongodb.com
- Node.js on Vercel: https://vercel.com/docs/functions/serverless-functions/runtimes/node-js
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
