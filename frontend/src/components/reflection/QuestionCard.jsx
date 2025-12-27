import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SkipForward, MessageCircle } from 'lucide-react';

const QuestionCard = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer, 
  onSkip, 
  isLoading = false 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSubmit = () => {
    const finalAnswer = showCustomInput ? customAnswer.trim() : selectedAnswer;
    
    if (!finalAnswer) {
      return; // Don't submit empty answers
    }
    
    onAnswer(finalAnswer);
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleOptionSelect = (option) => {
    setSelectedAnswer(option);
    setShowCustomInput(false);
    setCustomAnswer('');
  };

  const handleCustomToggle = () => {
    setShowCustomInput(true);
    setSelectedAnswer('');
  };

  const canSubmit = showCustomInput ? customAnswer.trim().length > 0 : selectedAnswer.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/60 rounded-3xl p-8 backdrop-blur-sm shadow-lg max-w-2xl mx-auto"
    >
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-slate-500">
            {Math.round((questionNumber / totalQuestions) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-light text-slate-800 leading-relaxed">
              {question.text}
            </h2>
          </div>
        </div>
        
        {/* Reassuring Note */}
        <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-blue-700 text-center">
            💙 There's no right or wrong answer. Share whatever feels comfortable to you.
          </p>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-4 mb-8">
        <AnimatePresence mode="wait">
          {!showCustomInput ? (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {question.options?.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                    selectedAnswer === option
                      ? 'border-purple-400 bg-purple-50/50 text-purple-800'
                      : 'border-slate-200/50 hover:border-purple-200 hover:bg-purple-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                      selectedAnswer === option
                        ? 'border-purple-400 bg-purple-400'
                        : 'border-slate-300'
                    }`}>
                      {selectedAnswer === option && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </motion.button>
              ))}
              
              {/* Custom Answer Option */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (question.options?.length || 0) * 0.1 }}
                onClick={handleCustomToggle}
                className="w-full p-4 text-left rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-300 hover:bg-purple-50/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                  <span className="font-medium text-slate-600">I'd like to write my own response</span>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Your Response
                </label>
                <textarea
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Take your time... there's no pressure to share more than you're comfortable with."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    {customAnswer.length}/500 characters
                  </p>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomAnswer('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Back to options
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-medium hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={18} />
            </>
          )}
        </button>
        
        <button
          onClick={handleSkip}
          disabled={isLoading}
          className="px-6 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <SkipForward size={18} />
          Skip Question
        </button>
      </div>

      {/* Encouragement */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          You're doing great. Take as much time as you need.
        </p>
      </div>
    </motion.div>
  );
};

export default QuestionCard;