import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, CheckCircle, SkipForward, Loader2 } from 'lucide-react';

/**
 * NEW REFLECTION FLOW - FIRST SESSION ONLY
 * 
 * Core Rules:
 * 1. Fixed 10 questions (admin-editable)
 * 2. One-time completion for first-time clients only
 * 3. No adaptive learning or repeated sessions
 * 4. Generates permanent AI summary
 */

const ReflectionFlow = ({ onComplete, onSkip }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/reflection/questions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setQuestions(data.data.questions);
        } else {
          setError(data.message || 'Failed to load reflection questions');
        }
      } catch (err) {
        setError('Failed to load reflection questions');
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswerSelect = (questionNumber, optionValue) => {
    setResponses(prev => ({
      ...prev,
      [`q${questionNumber}`]: optionValue
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await fetch('http://localhost:3001/api/reflection/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responses })
      });

      const data = await response.json();

      if (data.success) {
        setIsComplete(true);
        // Call onComplete after a brief delay to show success message
        setTimeout(() => {
          onComplete && onComplete(null); // No session ID needed in new system
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit reflection');
      }
    } catch (err) {
      setError('Failed to submit reflection');
      console.error('Error submitting reflection:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = currentQuestion ? responses[`q${currentQuestion.questionNumber}`] : null;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading reflection questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={onSkip}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Continue Without Reflection
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 max-w-md mx-auto">
          <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-green-800 mb-2">Reflection Complete!</h3>
          <p className="text-green-700 text-sm">
            Thank you for sharing. This helps us understand you better for your first session.
          </p>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">No reflection questions available at the moment.</p>
        <button
          onClick={onSkip}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Continue to Booking
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-primary">Pre-Session Reflection</h2>
        </div>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          This short reflection helps us understand you better before your first conversation. 
          It's optional and there are no right or wrong answers.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.questionNumber}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                {currentQuestion.questionText}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswerSelect(currentQuestion.questionNumber, option.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      currentResponse === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        currentResponse === option.value
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {currentResponse === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="px-6 py-2 text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <SkipForward size={16} />
            Skip Reflection
          </button>

          <button
            onClick={handleNext}
            disabled={!currentResponse || submitting}
            className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                {currentQuestionIndex === questions.length - 1 ? 'Submitting...' : 'Next'}
              </>
            ) : (
              <>
                {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-8">
        <p className="text-xs text-gray-500">
          This reflection is only completed once for first-time clients. 
          Your responses help us prepare for a more meaningful first conversation.
        </p>
      </div>
    </div>
  );
};

export default ReflectionFlow;