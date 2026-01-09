import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, CheckCircle, SkipForward, Loader2 } from 'lucide-react';
import { reflectionApi } from '../../services/reflection.api';

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
        const data = await reflectionApi.getQuestions();

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

      const data = await reflectionApi.submitReflection(responses);

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
      {/* Header Area - Removed for ultra-minimalist look */}
      <div className="mb-4" />

      {/* Question Card Area */}
      <div className="relative">
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
            Step {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>

        <div className="w-full bg-gray-100 h-1 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
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
              <div className="bg-white rounded-[2rem] p-2 sm:p-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 leading-snug">
                  {currentQuestion.questionText}
                </h3>

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(currentQuestion.questionNumber, option.value)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group ${currentResponse === option.value
                        ? 'border-primary bg-primary shadow-md shadow-primary/10'
                        : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-primary/20'
                        }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${currentResponse === option.value
                          ? 'border-white bg-white shadow-sm'
                          : 'border-gray-300 bg-white'
                          }`}>
                          {currentResponse === option.value && (
                            <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                          )}
                        </div>
                        <span className={`text-[13px] sm:text-sm font-semibold transition-colors ${currentResponse === option.value ? 'text-white' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </div>

                      {/* Selected state pulse effect */}
                      {currentResponse === option.value && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-primary/5 blur-xl"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pb-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto px-8 py-3 text-gray-400 font-bold text-sm hover:text-primary transition-colors disabled:opacity-0 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onSkip}
              className="px-8 py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-all flex items-center justify-center gap-2"
            >
              Skip for Now
            </button>

            <button
              onClick={handleNext}
              disabled={!currentResponse || submitting}
              className="px-10 py-3 bg-linear-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {currentQuestionIndex === questions.length - 1 ? 'Submitting...' : 'Next'}
                </>
              ) : (
                <>
                  <span>{currentQuestionIndex === questions.length - 1 ? 'Finish Reflection' : 'Next Question'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer note removed as per request */}
      </div>
    </div>
  );
};

export default ReflectionFlow;