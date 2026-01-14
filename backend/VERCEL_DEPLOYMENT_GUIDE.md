# Vercel Backend Deployment Guide

## Critical Issues Fixed

### 1. Vercel Configuration
- Simplified `vercel.json` to use `routes` instead of `rewrites`
- Removed environment variables from config (they should be set in Vercel dashboard)

### 2. Database Connection
- Fixed serverless compatibility in `index.js`
- Added proper error handling for MongoDB connection

## Environment Variables Required in Vercel Dashboard

You MUST set these environment variables in your Vercel project settings:

### Database
```
MONGODB_URI=mongodb+srv://mindsettler:zovotfSQfFEvnml8@mindsettler.791pbco.mongodb.net/?appName=MindSettler
```

### Authentication
```
JWT_ACCESS_SECRET=uihifhewifhewrow
JWT_REFRESH_SECRET=fweoiewoirhweowofh
```

### Email Configuration
```
EMAIL_SERVICE=gmail
EMAIL_USER=mindsettlerxteam@gmail.com
EMAIL_PASSWORD=omhr kyvv wowr ghbv
SKIP_EMAIL=false
```

### Frontend URLs
```
FRONTEND_URL=https://gwoc-f8d2.vercel.app
CORS_ORIGIN=https://gwoc-f8d2.vercel.app
```

### AI Services
```
GEMINI_KEYS=AIzaSyA_R89waR4YlrXRycpboqKPd4AZOcSQicg
```

### Cloudinary
```
CLOUDINARY_CLOUD_NAME=dvsn6k8zm
CLOUDINARY_API_KEY=688415758232343
CLOUDINARY_API_SECRET=ercN9ngLscsahjKq68yfID4b3f4
CLOUDINARY_URL=cloudinary://688415758232343:ercN9ngLscsahjKq68yfID4b3f4@dvsn6k8zm
```

### System
```
NODE_ENV=production
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your backend project (gwoc-lovat)
3. Go to **Settings** → **Environment Variables**
4. Add each variable above:
   - Variable Name: (e.g., `MONGODB_URI`)
   - Value: (paste the value)
   - Environment: Select **Production**, **Preview**, and **Development**
5. Click **Save**

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Set **Root Directory** to `GWOC/backend`
5. Framework Preset: **Other**
6. Build Command: Leave empty or use `npm install`
7. Output Directory: Leave empty
8. Install Command: `npm install`
9. Add all environment variables (see above)
10. Click **Deploy**

### Option 2: Deploy via Vercel CLI
```bash
cd GWOC/backend
npm install -g vercel
vercel login
vercel --prod
```

## Common Deployment Errors and Solutions

### Error: "Cannot find module"
**Solution**: Make sure all imports use `.js` extensions (ES modules requirement)

### Error: "MongoDB connection timeout"
**Solutions**:
1. Check if `MONGODB_URI` is set in Vercel dashboard
2. Verify MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
3. Check MongoDB Atlas cluster is running

### Error: "Function execution timeout"
**Solution**: Increase function timeout in `vercel.json` (already set to 30s)

### Error: "CORS blocked"
**Solutions**:
1. Verify `FRONTEND_URL` and `CORS_ORIGIN` are set correctly
2. Check frontend is deployed at the correct URL

## MongoDB Atlas Configuration

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Select your cluster
3. Click **Network Access**
4. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
5. Click **Database Access**
6. Verify user `mindsettler` exists with correct password

## Testing Deployment

After deployment, test these endpoints:

1. **Root endpoint**: `https://gwoc-lovat.vercel.app/`
   - Should return: `{"message": "MindSettler API is running", ...}`

2. **Health check**: `https://gwoc-lovat.vercel.app/health`
   - Should return: `{"status": "OK", "database": {"status": "connected", ...}}`

3. **API endpoint**: `https://gwoc-lovat.vercel.app/api/auth/...`

## Troubleshooting

### Check Vercel Logs
1. Go to Vercel dashboard
2. Select your project
3. Click on the deployment
4. Click **Functions** tab
5. Click on `src/index.js` to see logs

### Common Issues

**Issue**: Database shows "disconnected" in health check
**Fix**: 
- Verify `MONGODB_URI` is set in Vercel
- Check MongoDB Atlas network access settings
- Ensure MongoDB cluster is not paused

**Issue**: 500 Internal Server Error
**Fix**:
- Check Vercel function logs for specific error
- Verify all environment variables are set
- Check for missing dependencies in `package.json`

**Issue**: CORS errors from frontend
**Fix**:
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Check frontend is using correct backend URL

## Important Notes

1. **Never commit `.env.production`** - It's in `.gitignore` for security
2. **Always set environment variables in Vercel dashboard** - Don't put them in `vercel.json`
3. **MongoDB connection is lazy** - First request might be slower as it establishes connection
4. **Serverless functions are stateless** - Each request might use a different instance
5. **Function timeout is 30 seconds** - Long-running operations might fail

## Next Steps After Deployment

1. Test all API endpoints
2. Verify database operations work
3. Test file uploads (Cloudinary)
4. Test email sending
5. Test chatbot functionality
6. Monitor Vercel function logs for errors
