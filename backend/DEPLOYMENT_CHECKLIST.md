# Vercel Backend Deployment Checklist

## Pre-Deployment Checklist

- [ ] All code is committed and pushed to GitHub
- [ ] `vercel.json` is properly configured
- [ ] `package.json` has all required dependencies
- [ ] Backend exports Express app as default export
- [ ] MongoDB Atlas cluster is running and accessible

## Vercel Dashboard Setup

### 1. Environment Variables (CRITICAL!)
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = `mongodb+srv://mindsettler:zovotfSQfFEvnml8@mindsettler.791pbco.mongodb.net/?appName=MindSettler`
- [ ] `JWT_ACCESS_SECRET` = `uihifhewifhewrow`
- [ ] `JWT_REFRESH_SECRET` = `fweoiewoirhweowofh`
- [ ] `EMAIL_SERVICE` = `gmail`
- [ ] `EMAIL_USER` = `mindsettlerxteam@gmail.com`
- [ ] `EMAIL_PASSWORD` = `omhr kyvv wowr ghbv`
- [ ] `SKIP_EMAIL` = `false`
- [ ] `FRONTEND_URL` = `https://gwoc-f8d2.vercel.app`
- [ ] `CORS_ORIGIN` = `https://gwoc-f8d2.vercel.app`
- [ ] `GEMINI_KEYS` = `AIzaSyA_R89waR4YlrXRycpboqKPd4AZOcSQicg`
- [ ] `CLOUDINARY_CLOUD_NAME` = `dvsn6k8zm`
- [ ] `CLOUDINARY_API_KEY` = `688415758232343`
- [ ] `CLOUDINARY_API_SECRET` = `ercN9ngLscsahjKq68yfID4b3f4`
- [ ] `CLOUDINARY_URL` = `cloudinary://688415758232343:ercN9ngLscsahjKq68yfID4b3f4@dvsn6k8zm`

### 2. Project Settings
- [ ] Root Directory: `GWOC/backend`
- [ ] Framework Preset: **Other**
- [ ] Build Command: (leave empty or `npm install`)
- [ ] Output Directory: (leave empty)
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 18.x or higher

## MongoDB Atlas Setup

- [ ] Go to https://cloud.mongodb.com
- [ ] Navigate to **Network Access**
- [ ] Add IP: `0.0.0.0/0` (Allow from anywhere)
- [ ] Navigate to **Database Access**
- [ ] Verify user `mindsettler` exists
- [ ] Verify cluster is not paused

## Deployment

- [ ] Push latest code to GitHub
- [ ] Vercel auto-deploys (if connected to GitHub)
- [ ] OR manually deploy via Vercel dashboard
- [ ] Wait for deployment to complete

## Post-Deployment Testing

Test these URLs (replace with your actual backend URL):

- [ ] Root: `https://gwoc-lovat.vercel.app/`
  - Expected: `{"message": "MindSettler API is running", ...}`

- [ ] Health: `https://gwoc-lovat.vercel.app/health`
  - Expected: `{"status": "OK", "database": {"status": "connected", "test": "success"}}`

- [ ] API Auth: `https://gwoc-lovat.vercel.app/api/auth/...`
  - Test a simple auth endpoint

## Troubleshooting

If deployment fails, check:

1. **Vercel Function Logs**
   - Dashboard → Project → Deployment → Functions → src/index.js

2. **Common Errors**
   - "Cannot find module" → Check import paths have `.js` extensions
   - "MongoDB timeout" → Check environment variables and MongoDB Atlas IP whitelist
   - "500 error" → Check function logs for specific error
   - "CORS error" → Verify CORS_ORIGIN matches frontend URL

3. **Environment Variables**
   - Verify ALL variables are set in Vercel dashboard
   - Check for typos in variable names
   - Ensure values don't have extra spaces

## Success Criteria

✅ Deployment shows "Ready" status in Vercel
✅ Root endpoint returns API running message
✅ Health endpoint shows database connected
✅ Frontend can make API calls without CORS errors
✅ No errors in Vercel function logs

## If Still Failing

1. Check Vercel function logs for exact error message
2. Verify MongoDB Atlas connection string is correct
3. Test MongoDB connection from another tool (MongoDB Compass)
4. Ensure all environment variables are set correctly
5. Check if any dependencies are missing from package.json
6. Verify Node.js version compatibility (18.x+)

## Contact Points

- MongoDB Atlas: https://cloud.mongodb.com
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/Siddh-2006/GWOC
