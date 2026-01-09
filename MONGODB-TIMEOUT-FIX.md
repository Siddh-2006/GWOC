# MongoDB Connection Timeout Fix

## Issue Identified ✅
```
MongooseError: Operation `media.find()` buffering timed out after 10000ms
```

## Root Cause
MongoDB Atlas connection timeout in serverless environment (Vercel).

## Fixes Applied

### 1. **Optimized MongoDB Connection Settings**
- Reduced `serverSelectionTimeoutMS` from 30s to 5s
- Added `bufferMaxEntries: 0` and `bufferCommands: false`
- Configured connection pooling for serverless
- Added proper timeout handling

### 2. **Enhanced Error Handling**
- Added specific timeout error responses (503 Service Unavailable)
- Added `maxTimeMS` to database queries (8s timeout)
- Better error messages for users

### 3. **Improved Health Check**
- Added database connection status
- Added database ping test
- Better monitoring capabilities

## MongoDB Atlas Configuration Required

### Check These Settings in MongoDB Atlas:

1. **Network Access (IP Whitelist)**
   - Go to MongoDB Atlas → Network Access
   - Ensure `0.0.0.0/0` is whitelisted (allows all IPs)
   - Or add Vercel's IP ranges if you prefer restricted access

2. **Database User Permissions**
   - Go to Database Access
   - Ensure user has `readWrite` permissions
   - Check username/password are correct

3. **Connection String**
   - Verify the connection string in environment variables
   - Should look like: `mongodb+srv://username:password@cluster.mongodb.net/database`

## Testing Steps

### 1. Test Health Endpoint
```bash
curl https://gwoc-lovat.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-09T06:30:00.000Z",
  "database": {
    "status": "connected",
    "test": "success"
  }
}
```

### 2. Test Media Endpoint
```bash
curl https://gwoc-lovat.vercel.app/api/media/published?limit=1
```

## If Issues Persist

### Option 1: Check MongoDB Atlas Settings
1. Login to MongoDB Atlas
2. Go to Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. Go to Database Access → Check user permissions

### Option 2: Verify Environment Variables
Ensure these are set in Vercel:
- `MONGODB_URI` - Complete connection string with credentials
- `NODE_ENV=production`

### Option 3: Connection String Format
Ensure format is correct:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Expected Results After Fix
- ✅ Health check shows database connected
- ✅ Media endpoint returns data within 5 seconds
- ✅ No more timeout errors
- ✅ Proper error handling for connection issues