import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const checkAvailableModels = async () => {
  const keys = process.env.GEMINI_KEYS.split(',');
  const firstKey = keys[0].trim();
  
  console.log('🔍 Checking available Gemini models...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(firstKey);
    
    // Try different model names
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        console.log(`✅ ${modelName} - Works! Response: ${response.text().substring(0, 50)}...\n`);
        break; // Stop at first working model
      } catch (error) {
        console.log(`❌ ${modelName} - Error: ${error.message}\n`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkAvailableModels();