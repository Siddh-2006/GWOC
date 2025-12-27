// Test script for the chatbot functionality
import dotenv from 'dotenv';
import geminiService from './src/services/gemini.service.js';
import { checkSafety } from './src/utils/safetyLayer.js';

dotenv.config();

const testChatbot = async () => {
  console.log('🤖 Testing MindSettler Chatbot\n');

  // Test 1: Safety Layer
  console.log('1️⃣ Testing Safety Layer:');
  const emergencyTest = checkSafety("I want to kill myself");
  console.log('Emergency detected:', emergencyTest.isEmergency);
  console.log('Response:', emergencyTest.response?.substring(0, 100) + '...\n');

  const normalTest = checkSafety("I want to book a session");
  console.log('Normal message safe:', normalTest.isSafe);
  console.log('Has concerns:', normalTest.hasConcerns, '\n');

  // Test 2: Gemini Service
  console.log('2️⃣ Testing Gemini Service:');
  try {
    const response = await geminiService.generateResponse(
      "Hello, I'm interested in booking a therapy session. Can you help me?",
      []
    );
    
    if (response.success) {
      console.log('✅ Gemini Response:', response.response);
      console.log('🔑 Key Stats:', response.keyStats);
    } else {
      console.log('❌ Gemini Error:', response.error);
    }
  } catch (error) {
    console.log('❌ Test Error:', error.message);
  }

  console.log('\n3️⃣ Health Check:');
  const health = await geminiService.healthCheck();
  console.log('Status:', health.status);
  console.log('Keys Available:', health.keysAvailable);
};

testChatbot().catch(console.error);