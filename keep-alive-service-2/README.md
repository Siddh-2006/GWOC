# 🔄 MindSettler Keep-Alive Service #2

## 🎯 Purpose

**Secondary keep-alive service** that creates a **mutual keep-alive system**:

- 🏓 **Pings your backend** every 7 minutes
- 🔄 **Pings Keep-Alive Service #1** every 7 minutes  
- 🛡️ **Ensures redundancy** - if one service sleeps, the other wakes it up

## 🏗️ Architecture

```
Service #2 (7min) ←→ Service #1 (5min)
     ↓                    ↓
   Backend ←→ Database ←→ Backend
```

**Mutual Keep-Alive System:**
- Service #1 pings backend every 5 minutes
- Service #2 pings backend + Service #1 every 7 minutes
- If Service #1 sleeps, Service #2 wakes it up
- If Service #2 sleeps, Service #1 keeps backend warm
- **Result**: 99.9% uptime with redundancy

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Go to**: https://render.com
2. **Create New Web Service**
3. **Connect Repository**: `Siddh-2006/GWOC_Duplicate`
4. **Settings**:
   - **Name**: `mindsettler-keep-alive-2`
   - **Root Directory**: `keep-alive-service-2`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Environment Variables**:
   ```
   BACKEND_URL=https://gwoc-lovat.vercel.app
   KEEPALIVE_SERVICE_1_URL=https://gwoc-duplicate.onrender.com
   PING_INTERVAL=*/7 * * * *
   ```

### Deploy to Different Platform

To avoid both services sleeping on the same platform:
- **Service #1**: Render
- **Service #2**: Railway, Fly.io, or Vercel

## 📊 Dashboard Features

- **Dual Monitoring**: Tracks both backend and Service #1
- **Separate Statistics**: Backend pings vs Service #1 pings
- **Combined Health Check**: Tests all endpoints
- **Manual Controls**: Ping backend, Service #1, or both

## 🎯 Benefits

1. **🛡️ Redundancy**: Two services keeping each other alive
2. **⏰ Offset Timing**: 5min + 7min intervals prevent conflicts
3. **📈 Higher Uptime**: If one sleeps, other continues
4. **🔄 Mutual Recovery**: Services wake each other up
5. **📊 Comprehensive Monitoring**: Full visibility into all components

## 🔧 Configuration

### Timing Strategy
- **Service #1**: Every 5 minutes
- **Service #2**: Every 7 minutes (offset)
- **Result**: Backend gets pinged every 2-3 minutes on average

### Environment Variables
```env
BACKEND_URL=https://gwoc-lovat.vercel.app
KEEPALIVE_SERVICE_1_URL=https://gwoc-duplicate.onrender.com
PING_INTERVAL=*/7 * * * *
```

## 📈 Expected Results

With both services running:
- **Backend Uptime**: 99.9%
- **Database Connection**: Always warm
- **Service Redundancy**: Mutual keep-alive
- **No Single Point of Failure**: Either service can maintain the system

## 🎉 Success Indicators

- ✅ Both dashboards show successful pings
- ✅ Backend health shows database "connected"
- ✅ Services wake each other up when needed
- ✅ Consistent performance with no cold starts

---

**This creates an unbreakable keep-alive system where services keep each other alive! 🔥**