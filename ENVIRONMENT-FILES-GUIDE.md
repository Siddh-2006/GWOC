# 🔧 Environment Files Configuration Guide

## Frontend Environment Files Priority

Vite loads environment files in this order (higher priority overrides lower):

1. `.env.production` (production builds) ✅
2. `.env.development` (development builds) ✅  
3. `.env.local` (local overrides - not in git)
4. `.env` (default fallback) ✅

## Current Configuration

### ✅ **Production (.env.production)**
```bash
VITE_API_URL=https://gwoc-lovat.vercel.app  # ✅ Correct
VITE_APP_ENV=production
```

### ✅ **Development (.env.development)**  
```bash
VITE_API_URL=http://localhost:3001  # ✅ Correct for local dev
VITE_APP_ENV=development
```

### ✅ **Default (.env) - FIXED**
```bash
VITE_API_URL=https://gwoc-lovat.vercel.app  # ✅ Fixed to production
VITE_APP_NAME=MindSettler
```

## How It Works

### Development Mode
```bash
npm run dev
# Uses: .env.development → VITE_API_URL=http://localhost:3001
```

### Production Build
```bash
npm run build
# Uses: .env.production → VITE_API_URL=https://gwoc-lovat.vercel.app
```

### Vercel Deployment
```bash
# Vercel also sets environment variables in vercel.json:
VITE_API_URL=https://gwoc-lovat.vercel.app
```

## ✅ **Issue Fixed**

**Before:**
- `.env` had `http://localhost:3001` (wrong for fallback)

**After:**  
- `.env` has `https://gwoc-lovat.vercel.app` (correct production URL)

## API Client Logic

The API client in `apiClient.js` uses this priority:

1. `import.meta.env.VITE_API_URL` (from environment files)
2. Fallback based on `import.meta.env.PROD` flag
3. Final fallback to localhost for development

```javascript
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;  // ✅ Now correct
  }
  
  if (import.meta.env.PROD) {
    return 'https://gwoc-lovat.vercel.app/api';    // ✅ Fallback
  } else {
    return 'http://localhost:3001/api';            // ✅ Dev fallback
  }
};
```

## ✅ **Result**

- **Development**: Uses localhost backend
- **Production**: Uses gwoc-lovat.vercel.app backend  
- **Vercel**: Environment variables ensure correct API URL
- **Fallback**: Now points to production instead of localhost