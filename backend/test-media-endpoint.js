import fetch from 'node-fetch';

async function testMediaEndpoint() {
  try {
    console.log('🧪 Testing media endpoint...');
    
    const response = await fetch('http://localhost:3001/api/media/published?page=1&limit=12');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Media endpoint response:');
    console.log(`- Success: ${data.success}`);
    console.log(`- Media count: ${data.data?.length || 0}`);
    console.log(`- Total: ${data.pagination?.total || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Sample media items:');
      data.data.slice(0, 3).forEach((media, index) => {
        console.log(`${index + 1}. ${media.title} (${media.type}) - ${media.views} views`);
      });
    } else {
      console.log('⚠️ No media found. You may need to seed the database.');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Backend server is not running!');
      console.log('💡 Please start the backend server with: npm run dev');
    } else {
      console.error('❌ Error testing endpoint:', error.message);
    }
  }
}

testMediaEndpoint();