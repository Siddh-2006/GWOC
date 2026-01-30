import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://gwoc-lovat.vercel.app';

async function testBackendConnection() {
  console.log('🧪 Testing backend connection...');
  console.log(`🎯 Target: ${BACKEND_URL}`);
  
  const endpoints = [
    { name: 'Root', url: `${BACKEND_URL}/` },
    { name: 'Health', url: `${BACKEND_URL}/health` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name}: ${endpoint.url}`);
      const startTime = Date.now();
      
      const response = await axios.get(endpoint.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'MindSettler-KeepAlive-Test/1.0'
        }
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${endpoint.name} - Status: ${response.status} (${duration}ms)`);
      console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} - Error: ${error.message}`);
      if (error.response) {
        console.log(`📄 Status: ${error.response.status}`);
        console.log(`📄 Data:`, error.response.data);
      }
    }
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testBackendConnection().catch(console.error);