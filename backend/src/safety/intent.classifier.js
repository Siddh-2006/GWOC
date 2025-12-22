export class IntentClassifier {
  static classifyMessage(message) {
    // Crisis detection keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself'];
    
    if (crisisKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return 'crisis';
    }

    // Booking intent keywords
    const bookingKeywords = ['appointment', 'book', 'schedule', 'therapist'];
    
    if (bookingKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return 'booking';
    }

    return 'general';
  }

  static requiresEscalation(intent) {
    return intent === 'crisis';
  }
}