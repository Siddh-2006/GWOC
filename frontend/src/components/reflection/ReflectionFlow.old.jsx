import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReflectionIntro from './ReflectionIntro';
import QuestionCard from './QuestionCard';
import CompletionMessage from './CompletionMessage';
import useAuthStore from '../../store/useAuthStore';
import { reflectionApi } from '../../services/reflection.api';

const ReflectionFlow = ({ onComplete, onSkip }) => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState('intro'); // 'intro', 'questions', 'completed'
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Start reflection session
  const handleStartReflection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting reflection session...');
      console.log('User auth state:', user);
      console.log('Access token exists:', !!localStorage.getItem('accessToken'));
      
      const response = await reflectionApi.startReflection();
      console.log('Reflection API response:', response);
      
      if (response.success) {
        setSessionId(response.data.sessionId);
        
        // Check if we have a question or if session is ready to complete
        if (response.data.question) {
          setCurrentQuestion(response.data.question);
          setQuestionNumber(response.data.question.number);
          setCurrentStep('questions');
          console.log('Successfully started reflection, moving to questions step');
        } else if (response.data.nextAction === 'complete') {
          // Session is ready to complete
          console.log('Session ready to complete, completing now...');
          await handleCompleteReflection(response.data.sessionId);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Unexpected response from server. Please try again.');
        }
      } else {
        console.error('Reflection start failed:', response.message);
        setError(response.message || 'Failed to start reflection');
      }
    } catch (err) {
      console.error('Start reflection error:', err);
      setError('Unable to start reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer and get next question
  const handleSubmitAnswer = async (answer) => {
    if (!sessionId || !currentQuestion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await reflectionApi.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        answer: answer,
        skipped: false
      });
      
      if (response.success) {
        if (response.data.canContinue && response.data.nextQuestion) {
          // Continue with next question
          setCurrentQuestion(response.data.nextQuestion);
          setQuestionNumber(response.data.nextQuestion.number);
        } else {
          // Complete the session
          await handleCompleteReflection();
        }
      } else {
        setError(response.message || 'Failed to submit answer');
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      setError('Unable to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Skip current question
  const handleSkipQuestion = async () => {
    if (!sessionId || !currentQuestion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await reflectionApi.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        answer: '',
        skipped: true
      });
      
      if (response.success) {
        if (response.data.canContinue && response.data.nextQuestion) {
          // Continue with next question
          setCurrentQuestion(response.data.nextQuestion);
          setQuestionNumber(response.data.nextQuestion.number);
        } else {
          // Complete the session
          await handleCompleteReflection();
        }
      } else {
        setError(response.message || 'Failed to skip question');
      }
    } catch (err) {
      console.error('Skip question error:', err);
      setError('Unable to skip question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Complete reflection session
  const handleCompleteReflection = async (sessionIdParam = null) => {
    const targetSessionId = sessionIdParam || sessionId;
    if (!targetSessionId) return;
    
    setLoading(true);
    
    try {
      const response = await reflectionApi.completeReflection(targetSessionId);
      
      if (response.success) {
        setSessionStats(response.data);
        setCurrentStep('completed');
      } else {
        setError(response.message || 'Failed to complete reflection');
      }
    } catch (err) {
      console.error('Complete reflection error:', err);
      setError('Unable to complete reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle skip entire reflection
  const handleSkipReflection = () => {
    onSkip();
  };

  // Handle continue to booking after completion
  const handleContinueToBooking = () => {
    onComplete(sessionId);
  };

  // Error display component
  const ErrorMessage = ({ message, onRetry }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-700 mb-6">{message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleSkipReflection}
            className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            Skip Reflection
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Remove debug info in production */}
        {/* Debug info removed for production */}
        
        <AnimatePresence mode="wait">
          {error ? (
            <ErrorMessage 
              key="error"
              message={error} 
              onRetry={() => {
                setError(null);
                if (currentStep === 'intro') {
                  handleStartReflection();
                }
              }} 
            />
          ) : (
            <>
              {currentStep === 'intro' && (
                <ReflectionIntro
                  key="intro"
                  onStart={handleStartReflection}
                  onSkip={handleSkipReflection}
                  isLoading={loading}
                />
              )}
              
              {currentStep === 'questions' && currentQuestion && (
                <QuestionCard
                  key={`question-${currentQuestion.id}`}
                  question={currentQuestion}
                  questionNumber={questionNumber}
                  totalQuestions={totalQuestions}
                  onAnswer={handleSubmitAnswer}
                  onSkip={handleSkipQuestion}
                  isLoading={loading}
                />
              )}
              
              {currentStep === 'completed' && (
                <CompletionMessage
                  key="completed"
                  userName={user ? `${user.firstName} ${user.lastName}` : ''}
                  sessionStats={sessionStats}
                  onContinueToBooking={handleContinueToBooking}
                  isLoading={loading}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReflectionFlow;