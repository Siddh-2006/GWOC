import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ReflectionQuestion } from '../src/models/ReflectionQuestion.model.js';

dotenv.config();

const defaultQuestions = [
  {
    questionNumber: 1,
    category: 'emotional-awareness',
    questionText: 'When something difficult happens, how clearly can you recognize what you\'re feeling?',
    options: [
      { value: 'very-clearly', label: 'Very clearly' },
      { value: 'somewhat-clearly', label: 'Somewhat clearly' },
      { value: 'not-very-clearly', label: 'Not very clearly' },
      { value: 'usually-confused', label: 'I usually feel confused' }
    ]
  },
  {
    questionNumber: 2,
    category: 'emotional-expression',
    questionText: 'How comfortable are you expressing your feelings to someone you trust?',
    options: [
      { value: 'very-comfortable', label: 'Very comfortable' },
      { value: 'somewhat-comfortable', label: 'Somewhat comfortable' },
      { value: 'rarely-comfortable', label: 'Rarely comfortable' },
      { value: 'usually-avoid', label: 'I usually avoid it' }
    ]
  },
  {
    questionNumber: 3,
    category: 'stress-response',
    questionText: 'When under stress, what describes you best?',
    options: [
      { value: 'pause-and-think', label: 'I pause and think things through' },
      { value: 'overwhelmed-but-manage', label: 'I feel overwhelmed but try to manage' },
      { value: 'react-quickly', label: 'I react quickly without much thought' },
      { value: 'withdraw-shutdown', label: 'I tend to withdraw or shut down' }
    ]
  },
  {
    questionNumber: 4,
    category: 'self-reflection',
    questionText: 'How often do you reflect on your own thoughts or behaviors?',
    options: [
      { value: 'regularly', label: 'Regularly' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'almost-never', label: 'Almost never' }
    ]
  },
  {
    questionNumber: 5,
    category: 'adaptability',
    questionText: 'When plans or expectations change unexpectedly, how do you usually respond?',
    options: [
      { value: 'adjust-easily', label: 'I adjust fairly easily' },
      { value: 'need-time-adapt', label: 'I need some time but adapt' },
      { value: 'struggle-to-adjust', label: 'I struggle to adjust' },
      { value: 'feel-stuck', label: 'I feel stuck or resistant' }
    ]
  },
  {
    questionNumber: 6,
    category: 'relationship-orientation',
    questionText: 'In relationships, what feels most important to you?',
    options: [
      { value: 'understanding', label: 'Understanding each other' },
      { value: 'emotional-connection', label: 'Emotional connection' },
      { value: 'stability-clarity', label: 'Stability and clarity' },
      { value: 'independence-space', label: 'Independence and space' }
    ]
  },
  {
    questionNumber: 7,
    category: 'coping-style',
    questionText: 'When facing ongoing challenges, what do you rely on most?',
    options: [
      { value: 'problem-solving', label: 'Problem-solving' },
      { value: 'emotional-support', label: 'Emotional support' },
      { value: 'internal-strength', label: 'Internal strength' },
      { value: 'distraction-avoidance', label: 'Distraction or avoidance' }
    ]
  },
  {
    questionNumber: 8,
    category: 'sense-of-control',
    questionText: 'How much control do you feel you have over your life right now?',
    options: [
      { value: 'strong-control', label: 'A strong sense of control' },
      { value: 'some-control', label: 'Some control' },
      { value: 'very-little-control', label: 'Very little control' },
      { value: 'unsure', label: 'Unsure' }
    ]
  },
  {
    questionNumber: 9,
    category: 'openness-to-growth',
    questionText: 'How open do you feel toward personal change or growth?',
    options: [
      { value: 'very-open', label: 'Very open' },
      { value: 'open-with-caution', label: 'Open with caution' },
      { value: 'unsure', label: 'Unsure' },
      { value: 'not-very-open', label: 'Not very open right now' }
    ]
  },
  {
    questionNumber: 10,
    category: 'self-description',
    questionText: 'Which statement feels closest to how you see yourself?',
    options: [
      { value: 'thoughtful-reflective', label: 'Thoughtful and reflective' },
      { value: 'emotionally-sensitive', label: 'Emotionally sensitive' },
      { value: 'practical-grounded', label: 'Practical and grounded' },
      { value: 'still-understanding', label: 'Still trying to understand myself' }
    ]
  }
];

const seedReflectionQuestions = async () => {
  try {
    // Use local MongoDB for testing if Atlas is not available
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsettler';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions
    await ReflectionQuestion.deleteMany({});
    console.log('🗑️ Cleared existing reflection questions');

    // Insert default questions
    await ReflectionQuestion.insertMany(defaultQuestions);
    console.log('✅ Seeded 10 default reflection questions');

    console.log('\n📋 Questions seeded:');
    defaultQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionText}`);
    });

  } catch (error) {
    console.error('❌ Error seeding reflection questions:', error.message);
    
    // If it's a connection error, provide helpful message
    if (error.message.includes('Could not connect')) {
      console.log('\n💡 Tip: Make sure MongoDB is running locally or check your MONGODB_URI in .env file');
      console.log('For local MongoDB: mongodb://localhost:27017/mindsettler');
      console.log('For Atlas: Check your connection string and IP whitelist');
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

seedReflectionQuestions();