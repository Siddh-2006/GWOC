# 🏥 MindSettler Keep-Alive Service

A dedicated service to keep your MindSettler backend and MongoDB database warm by sending regular health checks.

## 🎯 Purpose

- **Prevent Cold Starts**: Keeps serverless functions warm
- **Database Connection**: Maintains MongoDB Atlas connection
- **Health Monitoring**: Tracks backend availability and response times
- **Statistics**: Provides detailed analytics and dashboard

## 🚀 Features

- ✅ Automated health checks every 5 minutes
- ✅ Comprehensive endpoint testing
- ✅ Real-time dashboard with statistics
- ✅ Error tracking and retry logic
- ✅ Multiple deployment options (Vercel, Render, Railway)
- ✅ Manual ping triggers
- ✅ Response time monitoring

## 📊 Dashboard

Access the live dashboard at: `https://your-keepalive-service.vercel.app/dashboard`

Features:
- Real-time statistics
- Success rate tracking
- Response time monitoring
- Manual ping buttons
- Error history
- Auto-refresh every 30 seconds

## 🛠️ Setup

### Option 1: Deploy to Vercel (Recommended)

1. **Create a new Vercel project:**
   ```bash
   cd keep-alive-service
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard:**
   - `BACKEND_URL`: `https://gwoc-lovat.vercel.app`
   - `PING_INTERVAL`: `*/5 * * * *`

3. **Vercel will automatically:**
   - Set up cron jobs for automated pings
   - Deploy the dashboard
   - Handle scaling

### Option 2: Deploy to Render

1. **Connect your GitHub repo to Render**
2. **Create a new Web Service**
3. **Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `BACKEND_URL`: `https://gwoc-lovat.vercel.app`
     - `PING_INTERVAL`: `*/5 * * * *`

### Option 3: Deploy to Railway

1. **Connect GitHub repo to Railway**
2. **Deploy from `keep-alive-service` folder**
3. **Set environment variables:**
   - `BACKEND_URL`: `https://gwoc-lovat.vercel.app`
   - `PING_INTERVAL`: `*/5 * * * *`

## 🧪 Testing

Test the connection before deploying:

```bash
cd keep-alive-service
npm install
npm run test
```

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Service info and status |
| `GET /stats` | Detailed statistics |
| `GET /ping` | Manual ping trigger |
| `GET /health-check` | Comprehensive health check |
| `GET /dashboard` | Web dashboard |

## ⚙️ Configuration

### Environment Variables

```env
# Required
BACKEND_URL=https://gwoc-lovat.vercel.app

# Optional
PING_INTERVAL=*/5 * * * *  # Every 5 minutes
PORT=3000                  # Local development port
```

### Ping Intervals

- `*/3 * * * *` - Every 3 minutes (aggressive)
- `*/5 * * * *` - Every 5 minutes (recommended)
- `*/10 * * * *` - Every 10 minutes (conservative)
- `0 */1 * * *` - Every hour (minimal)

## 📈 Monitoring

### Success Metrics
- **Uptime**: Service availability
- **Success Rate**: Percentage of successful pings
- **Response Time**: Average backend response time
- **Error Rate**: Failed ping attempts

### Dashboard Features
- Real-time statistics
- Visual status indicators
- Manual ping buttons
- Error history
- Auto-refresh

## 🔧 Troubleshooting

### Common Issues

**Backend not responding:**
- Check if backend is deployed correctly
- Verify BACKEND_URL is correct
- Check Vercel function logs

**High error rate:**
- MongoDB Atlas might be paused
- Check network connectivity
- Verify environment variables

**Service not pinging:**
- Check cron job configuration
- Verify deployment is successful
- Check service logs

### Debugging

1. **Check service status:**
   ```
   GET https://your-keepalive-service.vercel.app/
   ```

2. **View statistics:**
   ```
   GET https://your-keepalive-service.vercel.app/stats
   ```

3. **Manual ping test:**
   ```
   GET https://your-keepalive-service.vercel.app/ping
   ```

4. **Comprehensive health check:**
   ```
   GET https://your-keepalive-service.vercel.app/health-check
   ```

## 🎛️ Advanced Configuration

### Custom Ping Logic

Modify `pingBackend()` function in `index.js` to:
- Add custom headers
- Test specific endpoints
- Implement custom retry logic
- Add notification webhooks

### Monitoring Integration

Add integrations for:
- Slack notifications
- Email alerts
- Discord webhooks
- Custom analytics

## 📊 Expected Results

After deployment, you should see:

1. **Reduced Cold Starts**: Backend responds faster
2. **Database Warmth**: MongoDB connections stay active
3. **Better User Experience**: Faster initial page loads
4. **Monitoring Data**: Track backend health over time

## 🚨 Important Notes

- **Free Tier Limits**: Be aware of service limits on free tiers
- **Cost Monitoring**: Monitor usage to avoid unexpected charges
- **Backup Strategy**: Consider multiple keep-alive services for redundancy
- **Security**: Keep-alive service doesn't need authentication but monitor access

## 📞 Support

If you encounter issues:

1. Check the dashboard for error details
2. Review service logs
3. Test manual ping endpoints
4. Verify environment variables
5. Check backend deployment status

## 🔄 Updates

To update the keep-alive service:

1. Modify the code
2. Commit changes to GitHub
3. Redeploy to your chosen platform
4. Monitor dashboard for successful deployment

---

**TL;DR**: Deploy this service to Vercel/Render, set `BACKEND_URL` environment variable, and it will automatically keep your backend warm every 5 minutes with a nice dashboard to monitor everything! 🎉