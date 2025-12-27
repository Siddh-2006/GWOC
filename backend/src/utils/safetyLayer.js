// Safety keywords that trigger emergency response
const EMERGENCY_KEYWORDS = [
  'suicide', 'kill myself', 'die', 'hurt myself', 'emergency',
  'end my life', 'want to die', 'kill me', 'harm myself', 
  'cut myself', 'overdose', 'jump off', 'hang myself',
  'self harm', 'self-harm', 'suicidal', 'end it all'
];

// Crisis response message
const CRISIS_RESPONSE = `I am truly sorry, but as an AI, I am not equipped to handle emergencies. Your safety is very important. 

🚨 **Immediate Help:**
• **Emergency**: Call 112 (India) or your local emergency number
• **Mental Health Helpline**: Call +91-9152987821 (AASRA)
• **Suicide Prevention**: Call 1860-2662-345

Please reach out to a mental health professional or visit the nearest hospital immediately. You matter, and help is available.`;

// Additional concerning keywords that need gentle redirection
const CONCERNING_KEYWORDS = [
  'depressed', 'depression', 'anxiety', 'panic', 'trauma',
  'abuse', 'addiction', 'eating disorder', 'bipolar',
  'schizophrenia', 'ptsd', 'ocd', 'adhd', 'therapy',
  'counseling', 'medication', 'antidepressant'
];

export const checkSafety = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for emergency keywords
  const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasEmergencyKeyword) {
    return {
      isSafe: false,
      isEmergency: true,
      response: CRISIS_RESPONSE
    };
  }
  
  // Check for concerning keywords (mental health topics)
  const hasConcerningKeyword = CONCERNING_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  return {
    isSafe: true,
    isEmergency: false,
    hasConcerns: hasConcerningKeyword,
    response: null
  };
};

export const getGentleRedirection = () => {
  return `I understand you may be going through a difficult time. While I'm here to help you navigate our services, I'm not qualified to provide mental health advice. 

Our trained professionals at MindSettler are here to support you properly. Would you like me to help you book a session with one of our experts? You can call us at +91 99746 31313.`;
};