import express from 'express';
import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://gwoc-lovat.vercel.app';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mindsettler:zovotfSQfFEvnml8@mindsettler.791pbco.mongodb.net/?appName=MindSettler';
const PING_INTERVAL = process.env.PING_INTERVAL || '*/5 * * * *'; // Every 5 minutes
const HEALTH_CHECK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Database connection for direct MongoDB pings
let dbConnection = null;

// Statistics tracking
let stats = {
  totalPings: 0,
  successfulPings: 0,
  failedPings: 0,
  lastPingTime: null,
  lastPingStatus: null,
  lastPingDuration: null,
  uptime: Date.now(),
  errors: [],
  database: {
    totalPings: 0,
    successfulPings: 0,
    failedPings: 0,
    lastPingTime: null,
    lastPingStatus: null,
    connectionStatus: 'disconnected'
  }
};

// Middleware
app.use(express.json());

// CORS for dashboard access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/**
 * Connect to MongoDB database
 */
async function connectToDatabase() {
  try {
    if (dbConnection && mongoose.connection.readyState === 1) {
      console.log('📊 Database already connected');
      return dbConnection;
    }

    console.log('🔌 Connecting to MongoDB...');
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    };

    dbConnection = await mongoose.connect(MONGODB_URI, options);
    
    stats.database.connectionStatus = 'connected';
    console.log('✅ Connected to MongoDB successfully');
    
    return dbConnection;
  } catch (error) {
    stats.database.connectionStatus = 'failed';
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Ping MongoDB database directly
 */
async function pingDatabase() {
  const startTime = Date.now();
  
  try {
    // Ensure connection exists
    if (!dbConnection || mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    const duration = Date.now() - startTime;
    
    // Update database statistics
    stats.database.totalPings++;
    stats.database.successfulPings++;
    stats.database.lastPingTime = new Date().toISOString();
    stats.database.lastPingStatus = 'success';
    stats.database.connectionStatus = 'connected';
    
    console.log(`✅ Database ping successful! Response time: ${duration}ms`);
    
    return {
      success: true,
      duration,
      status: 'connected'
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    stats.database.totalPings++;
    stats.database.failedPings++;
    stats.database.lastPingTime = new Date().toISOString();
    stats.database.lastPingStatus = 'failed';
    stats.database.connectionStatus = 'failed';
    
    console.error(`❌ Database ping failed: ${error.message}`);
    
    return {
      success: false,
      duration,
      error: error.message
    };
  }
}

/**
 * Ping the backend to keep it warm
 */
async function pingBackend() {
  const startTime = Date.now();
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      console.log(`🏓 Pinging backend (attempt ${attempt + 1}/${MAX_RETRIES})...`);
      
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: HEALTH_CHECK_TIMEOUT,
        headers: {
          'User-Agent': 'MindSettler-KeepAlive/1.0'
        }
      });
      
      const duration = Date.now() - startTime;
      
      // Update statistics
      stats.totalPings++;
      stats.successfulPings++;
      stats.lastPingTime = new Date().toISOString();
      stats.lastPingStatus = 'success';
      stats.lastPingDuration = duration;
      
      // Log success
      console.log(`✅ Backend is alive! Response time: ${duration}ms`);
      console.log(`📊 Database status: ${response.data.database?.status || 'unknown'}`);
      
      // Also ping database directly to keep it warm
      console.log('🔄 Pinging database directly...');
      const dbResult = await pingDatabase();
      
      if (dbResult.success) {
        console.log(`✅ Direct database ping successful! Response time: ${dbResult.duration}ms`);
      } else {
        console.log(`⚠️ Direct database ping failed: ${dbResult.error}`);
      }
      
      // Keep only last 10 errors
      if (stats.errors.length > 10) {
        stats.errors = stats.errors.slice(-10);
      }
      
      return {
        success: true,
        duration,
        data: response.data,
        database: dbResult
      };
      
    } catch (error) {
      attempt++;
      const duration = Date.now() - startTime;
      
      console.error(`❌ Ping failed (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      
      if (attempt >= MAX_RETRIES) {
        // Update statistics for final failure
        stats.totalPings++;
        stats.failedPings++;
        stats.lastPingTime = new Date().toISOString();
        stats.lastPingStatus = 'failed';
        stats.lastPingDuration = duration;
        
        // Log error
        const errorInfo = {
          timestamp: new Date().toISOString(),
          error: error.message,
          code: error.code,
          status: error.response?.status,
          duration
        };
        
        stats.errors.push(errorInfo);
        
        console.error(`💀 All ping attempts failed after ${duration}ms`);
        
        return {
          success: false,
          duration,
          error: error.message
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Advanced health check that tests multiple endpoints
 */
async function comprehensiveHealthCheck() {
  console.log('🔍 Running comprehensive health check...');
  
  const endpoints = [
    { name: 'Root', url: `${BACKEND_URL}/` },
    { name: 'Health', url: `${BACKEND_URL}/health` },
    { name: 'API Auth', url: `${BACKEND_URL}/api/auth/health` }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(endpoint.url, {
        timeout: 15000,
        validateStatus: (status) => status < 500 // Accept 4xx as "working"
      });
      
      const duration = Date.now() - startTime;
      
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        duration,
        success: true
      });
      
      console.log(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
      
    } catch (error) {
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        error: error.message,
        success: false
      });
      
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
  
  return results;
}

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'MindSettler Keep-Alive Service',
    status: 'running',
    uptime: Math.floor((Date.now() - stats.uptime) / 1000),
    version: '1.0.0',
    target: BACKEND_URL,
    pingInterval: PING_INTERVAL
  });
});

app.get('/stats', (req, res) => {
  const uptime = Math.floor((Date.now() - stats.uptime) / 1000);
  const successRate = stats.totalPings > 0 ? 
    ((stats.successfulPings / stats.totalPings) * 100).toFixed(2) : 0;
  
  res.json({
    ...stats,
    uptime,
    successRate: `${successRate}%`,
    target: BACKEND_URL
  });
});

app.get('/ping', async (req, res) => {
  console.log('🔄 Manual ping requested...');
  const result = await pingBackend();
  res.json(result);
});

app.get('/ping-db', async (req, res) => {
  console.log('🔄 Manual database ping requested...');
  const result = await pingDatabase();
  res.json(result);
});

app.get('/health-check', async (req, res) => {
  const results = await comprehensiveHealthCheck();
  res.json({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  });
});

app.get('/dashboard', (req, res) => {
  const uptime = Math.floor((Date.now() - stats.uptime) / 1000);
  const successRate = stats.totalPings > 0 ? 
    ((stats.successfulPings / stats.totalPings) * 100).toFixed(2) : 0;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>MindSettler Keep-Alive Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .button:hover { background: #0056b3; }
        .errors { margin-top: 20px; }
        .error-item { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MindSettler Keep-Alive Dashboard</h1>
            <p>Monitoring: <strong>${BACKEND_URL}</strong></p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${uptime}s</div>
                <div class="stat-label">Uptime</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalPings}</div>
                <div class="stat-label">Backend Pings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lastPingDuration || 0}ms</div>
                <div class="stat-label">Last Response Time</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.database.totalPings}</div>
                <div class="stat-label">DB Pings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.database.connectionStatus}</div>
                <div class="stat-label">DB Status</div>
            </div>
        </div>
        
        <div class="status ${stats.lastPingStatus === 'success' ? 'success' : 'error'}">
            <strong>Last Ping:</strong> ${stats.lastPingTime || 'Never'} - ${stats.lastPingStatus || 'Unknown'}
        </div>
        
        <div style="text-align: center;">
            <button class="button" onclick="pingNow()">Ping Backend</button>
            <button class="button" onclick="pingDatabase()">Ping Database</button>
            <button class="button" onclick="healthCheck()">Health Check</button>
            <button class="button" onclick="location.reload()">Refresh</button>
        </div>
        
        ${stats.errors.length > 0 ? `
        <div class="errors">
            <h3>Recent Errors</h3>
            ${stats.errors.slice(-5).map(error => `
                <div class="error-item">
                    <strong>${error.timestamp}</strong>: ${error.error} (${error.duration}ms)
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
    
    <script>
        async function pingNow() {
            const response = await fetch('/ping');
            const result = await response.json();
            alert(result.success ? 'Backend ping successful!' : 'Backend ping failed: ' + result.error);
            location.reload();
        }
        
        async function pingDatabase() {
            const response = await fetch('/ping-db');
            const result = await response.json();
            alert(result.success ? 'Database ping successful!' : 'Database ping failed: ' + result.error);
            location.reload();
        }
        
        async function healthCheck() {
            const response = await fetch('/health-check');
            const result = await response.json();
            const successful = result.summary.successful;
            const total = result.summary.total;
            alert(\`Health check completed: \${successful}/\${total} endpoints healthy\`);
        }
        
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;
  
  res.send(html);
});

// Start the cron job
console.log(`🚀 Starting keep-alive service for ${BACKEND_URL}`);
console.log(`⏰ Ping interval: ${PING_INTERVAL}`);

cron.schedule(PING_INTERVAL, async () => {
  await pingBackend();
});

// Initial ping
setTimeout(async () => {
  console.log('🎯 Running initial ping...');
  await pingBackend();
}, 5000);

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Keep-alive service running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
  
  // Initialize database connection
  console.log('🔌 Initializing database connection...');
  connectToDatabase().catch(err => {
    console.error('⚠️ Initial database connection failed:', err.message);
    console.log('🔄 Will retry on first ping...');
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down keep-alive service...');
  process.exit(0);
});

export default app;