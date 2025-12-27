import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const listModels = async () => {
  const keys = process.env.GEMINI_KEYS.split(',');
  const firstKey = keys[0].trim();
  
  console.log('🔍 Listing available Gemini models...\n');
  console.log('Using API key:', firstKey.substring(0, 10) + '...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(firstKey);
    
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    
    // Try a simple test with a basic model name
    console.log('\n🧪 Testing basic API connectivity...');
    try {
      const genAI = new GoogleGenerativeAI(firstKey);
      const model = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
      const result = await model.generateContent('Hello');
      console.log('✅ API key works with models/gemini-pro');
    } catch (testError) {
      console.log('❌ API test failed:', testError.message);
      
      // Check if it's an authentication error
      if (testError.message.includes('API_KEY_INVALID') || testError.message.includes('403')) {
        console.log('\n💡 Suggestion: Check if your API keys are valid and have the correct permissions.');
      }
    }
  }
};

listModels();