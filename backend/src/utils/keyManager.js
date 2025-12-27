class KeyManager {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.loadKeys();
    this.initialized = true;
  }

  loadKeys() {
    const keysString = process.env.GEMINI_KEYS;
    if (!keysString) {
      console.warn('⚠️ GEMINI_KEYS environment variable is not set. Chatbot will not work.');
      return;
    }
    
    this.keys = keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    
    if (this.keys.length === 0) {
      console.warn('⚠️ No valid Gemini API keys found');
      return;
    }
    
    console.log(`🔑 Loaded ${this.keys.length} Gemini API keys`);
  }

  getCurrentKey() {
    if (!this.initialized) this.initialize();
    
    if (this.keys.length === 0) {
      throw new Error('No API keys available. Please check GEMINI_KEYS environment variable.');
    }
    return this.keys[this.currentIndex];
  }

  rotateKey() {
    if (!this.initialized) this.initialize();
    
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    console.log(`🔄 Rotated to key index: ${this.currentIndex}`);
    return this.getCurrentKey();
  }

  async executeWithRetry(apiCall, maxRetries = 3) {
    if (!this.initialized) this.initialize();
    
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys configured. Please set GEMINI_KEYS in your .env file.');
    }

    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const currentKey = this.getCurrentKey();
        console.log(`🔑 Attempting request with key index: ${this.currentIndex} (attempt ${attempt + 1}/${maxRetries})`);
        
        const result = await apiCall(currentKey);
        
        if (attempt > 0) {
          console.log(`✅ Request succeeded after ${attempt + 1} attempts`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error (429) or quota exceeded
        const isRateLimitError = 
          error.status === 429 || 
          error.code === 429 ||
          (error.message && error.message.includes('quota')) ||
          (error.message && error.message.includes('rate limit')) ||
          (error.message && error.message.includes('429'));
        
        console.log(`❌ Request failed with key ${this.currentIndex}: ${error.message}`);
        
        if (attempt < maxRetries - 1) {
          console.log(`🔄 Rotating to next key...`);
          this.rotateKey();
          
          // Add a small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.error(`❌ All ${maxRetries} attempts failed. Last error:`, lastError);
    throw lastError;
  }

  getStats() {
    if (!this.initialized) this.initialize();
    
    return {
      totalKeys: this.keys.length,
      currentIndex: this.currentIndex,
      currentKey: this.keys.length > 0 ? this.getCurrentKey().substring(0, 10) + '...' : 'None',
      initialized: this.initialized
    };
  }
}

// Export singleton instance
const keyManager = new KeyManager();
export default keyManager;