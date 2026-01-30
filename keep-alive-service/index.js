import express from 'express';
import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://gwoc-lovat.vercel.app';
const KEEPALIVE_SERVICE_2_URL = process.env.KEEPALIVE_SERVICE_2_URL || 'https://gwoc-duplicate-zxd4.onrender.com';
const PING_INTERVAL = process.env.PING_INTERVAL || '*/5 * * * *'; // Every 5 minutes
const HEALTH_CHECK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

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
    connectionStatus: 'unknown'
  },
  keepAliveService2: {
    totalPings: 0,
    successfulPings: 0,
    failedPings: 0,
    lastPingTime: null,
    lastPingStatus: null
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
 * Ping the backend to keep it warm and check database status
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
      
      // Update backend statistics
      stats.totalPings++;
      stats.successfulPings++;
      stats.lastPingTime = new Date().toISOString();
      stats.lastPingStatus = 'success';
      stats.lastPingDuration = duration;
      
      // Extract database status from backend response
      const dbStatus = response.data.database?.status || 'unknown';
      const dbTest = response.data.database?.test || 'untested';
      
      // Update database statistics based on backend response
      stats.database.totalPings++;
      if (dbStatus === 'connected' && dbTest === 'success') {
        stats.database.successfulPings++;
        stats.database.lastPingStatus = 'success';
        stats.database.connectionStatus = 'connected';
      } else {
        stats.database.failedPings++;
        stats.database.lastPingStatus = 'failed';
        stats.database.connectionStatus = dbStatus;
      }
      stats.database.lastPingTime = new Date().toISOString();
      
      // Log success
      console.log(`✅ Backend is alive! Response time: ${duration}ms`);
      console.log(`📊 Database status: ${dbStatus} (test: ${dbTest})`);
      
      // Keep only last 10 errors
      if (stats.errors.length > 10) {
        stats.errors = stats.errors.slice(-10);
      }
      
      return {
        success: true,
        duration,
        data: response.data,
        database: {
          status: dbStatus,
          test: dbTest
        }
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
        
        // Update database statistics for failure
        stats.database.totalPings++;
        stats.database.failedPings++;
        stats.database.lastPingTime = new Date().toISOString();
        stats.database.lastPingStatus = 'failed';
        stats.database.connectionStatus = 'failed';
        
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
        success: true,
        database: response.data.database || null
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

/**
 * Ping the second keep-alive service to keep it awake
 */
async function pingKeepAliveService2() {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Pinging second keep-alive service...`);
    
    const response = await axios.get(`${KEEPALIVE_SERVICE_2_URL}/`, {
      timeout: HEALTH_CHECK_TIMEOUT,
      headers: {
        'User-Agent': 'MindSettler-KeepAlive-1/1.0'
      }
    });
    
    const duration = Date.now() - startTime;
    
    // Update keep-alive service statistics
    stats.keepAliveService2.totalPings++;
    stats.keepAliveService2.successfulPings++;
    stats.keepAliveService2.lastPingTime = new Date().toISOString();
    stats.keepAliveService2.lastPingStatus = 'success';
    
    console.log(`✅ Second keep-alive service is awake! Response time: ${duration}ms`);
    
    return {
      success: true,
      duration,
      data: response.data
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    stats.keepAliveService2.totalPings++;
    stats.keepAliveService2.failedPings++;
    stats.keepAliveService2.lastPingTime = new Date().toISOString();
    stats.keepAliveService2.lastPingStatus = 'failed';
    
    console.error(`❌ Failed to ping second keep-alive service: ${error.message}`);
    
    return {
      success: false,
      duration,
      error: error.message
    };
  }
}

/**
 * Combined ping function that pings both backend and second keep-alive service
 */
async function performCombinedPing() {
  console.log('🚀 Starting combined ping cycle...');
  
  // Ping backend first
  const backendResult = await pingBackend();
  
  // Then ping the second keep-alive service
  const keepAliveResult = await pingKeepAliveService2();
  
  console.log('🎯 Combined ping cycle completed!');
  
  return {
    backend: backendResult,
    keepAliveService2: keepAliveResult
  };
}

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'MindSettler Keep-Alive Service #1',
    status: 'running',
    uptime: Math.floor((Date.now() - stats.uptime) / 1000),
    version: '1.0.0',
    targets: {
      backend: BACKEND_URL,
      keepAliveService2: KEEPALIVE_SERVICE_2_URL
    },
    pingInterval: PING_INTERVAL,
    approach: 'Dual-target monitoring (Backend + Keep-Alive Service #2)'
  });
});

app.get('/stats', (req, res) => {
  const uptime = Math.floor((Date.now() - stats.uptime) / 1000);
  const successRate = stats.totalPings > 0 ? 
    ((stats.successfulPings / stats.totalPings) * 100).toFixed(2) : 0;
  const dbSuccessRate = stats.database.totalPings > 0 ?
    ((stats.database.successfulPings / stats.database.totalPings) * 100).toFixed(2) : 0;
  const keepAlive2SuccessRate = stats.keepAliveService2.totalPings > 0 ?
    ((stats.keepAliveService2.successfulPings / stats.keepAliveService2.totalPings) * 100).toFixed(2) : 0;
  
  res.json({
    ...stats,
    uptime,
    successRate: `${successRate}%`,
    databaseSuccessRate: `${dbSuccessRate}%`,
    keepAlive2SuccessRate: `${keepAlive2SuccessRate}%`,
    targets: {
      backend: BACKEND_URL,
      keepAliveService2: KEEPALIVE_SERVICE_2_URL
    }
  });
});

app.get('/ping', async (req, res) => {
  console.log('🔄 Manual combined ping requested...');
  const result = await performCombinedPing();
  res.json(result);
});

app.get('/ping-backend', async (req, res) => {
  console.log('🔄 Manual backend ping requested...');
  const result = await pingBackend();
  res.json(result);
});

app.get('/ping-keepalive2', async (req, res) => {
  console.log('🔄 Manual keep-alive service #2 ping requested...');
  const result = await pingKeepAliveService2();
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
  const dbSuccessRate = stats.database.totalPings > 0 ?
    ((stats.database.successfulPings / stats.database.totalPings) * 100).toFixed(2) : 0;
  const keepAlive2SuccessRate = stats.keepAliveService2.totalPings > 0 ?
    ((stats.keepAliveService2.successfulPings / stats.keepAliveService2.totalPings) * 100).toFixed(2) : 0;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>MindSettler Keep-Alive Dashboard #1</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-value { font-size: 20px; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; font-size: 12px; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .button { background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 3px; font-size: 12px; }
        .button:hover { background: #0056b3; }
        .errors { margin-top: 20px; }
        .error-item { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 4px; font-size: 12px; }
        .targets { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MindSettler Keep-Alive Dashboard #1</h1>
            <p><strong>Primary Service</strong> - Keeps Backend + Service #2 Alive</p>
        </div>
        
        <div class="targets">
            <h3>🎯 Monitoring Targets:</h3>
            <p><strong>Backend:</strong> ${BACKEND_URL}</p>
            <p><strong>Keep-Alive Service #2:</strong> ${KEEPALIVE_SERVICE_2_URL}</p>
            <p><strong>Ping Interval:</strong> Every 5 minutes</p>
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
                <div class="stat-label">Backend Success</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.keepAliveService2.totalPings}</div>
                <div class="stat-label">Service #2 Pings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${keepAlive2SuccessRate}%</div>
                <div class="stat-label">Service #2 Success</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${dbSuccessRate}%</div>
                <div class="stat-label">DB Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.database.connectionStatus}</div>
                <div class="stat-label">DB Status</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.lastPingDuration || 0}ms</div>
                <div class="stat-label">Last Response</div>
            </div>
        </div>
        
        <div class="status ${stats.lastPingStatus === 'success' ? 'success' : 'error'}">
            <strong>Last Combined Ping:</strong> ${stats.lastPingTime || 'Never'} - ${stats.lastPingStatus || 'Unknown'}
        </div>
        
        <div class="status ${stats.database.lastPingStatus === 'success' ? 'success' : 'error'}">
            <strong>Database Status:</strong> ${stats.database.connectionStatus} (via backend health check)
        </div>
        
        <div class="status ${stats.keepAliveService2.lastPingStatus === 'success' ? 'success' : 'error'}">
            <strong>Service #2 Status:</strong> ${stats.keepAliveService2.lastPingStatus || 'Unknown'} (Last: ${stats.keepAliveService2.lastPingTime || 'Never'})
        </div>
        
        <div style="text-align: center;">
            <button class="button" onclick="pingCombined()">Ping Both</button>
            <button class="button" onclick="pingBackend()">Ping Backend</button>
            <button class="button" onclick="pingKeepAlive2()">Ping Service #2</button>
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
        async function pingCombined() {
            const response = await fetch('/ping');
            const result = await response.json();
            const backendSuccess = result.backend?.success;
            const keepAlive2Success = result.keepAliveService2?.success;
            alert(\`Combined ping: Backend \${backendSuccess ? 'OK' : 'FAIL'}, Service #2 \${keepAlive2Success ? 'OK' : 'FAIL'}\`);
            location.reload();
        }
        
        async function pingBackend() {
            const response = await fetch('/ping-backend');
            const result = await response.json();
            alert(result.success ? 'Backend ping successful!' : 'Backend ping failed: ' + result.error);
            location.reload();
        }
        
        async function pingKeepAlive2() {
            const response = await fetch('/ping-keepalive2');
            const result = await response.json();
            alert(result.success ? 'Service #2 ping successful!' : 'Service #2 ping failed: ' + result.error);
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
console.log(`🎯 Secondary target: ${KEEPALIVE_SERVICE_2_URL}`);
console.log(`⏰ Ping interval: ${PING_INTERVAL}`);
console.log(`📋 Approach: Mutual keep-alive system (Backend + Service #2)`);

cron.schedule(PING_INTERVAL, async () => {
  await performCombinedPing();
});

// Initial ping
setTimeout(async () => {
  console.log('🎯 Running initial combined ping...');
  await performCombinedPing();
}, 5000);

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Keep-alive service running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down keep-alive service...');
  process.exit(0);
});

export default app;