import { motion } from 'framer-motion';
import { Heart, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const CompletionMessage = ({ 
  userName, 
  sessionStats, 
  onContinueToBooking, 
  isLoading = false 
}) => {
  const firstName = userName ? userName.split(' ')[0] : 'Friend';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/60 rounded-3xl p-8 backdrop-blur-sm shadow-lg max-w-2xl mx-auto text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="text-green-600" size={40} />
      </motion.div>

      {/* Thank You Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-light text-slate-800 mb-4">
          Thank You, {firstName}
        </h2>
        <p className="text-xl text-slate-600 font-light leading-relaxed mb-6">
          Your reflection has been completed. This thoughtful preparation will help create a more meaningful session.
        </p>
      </motion.div>

      {/* Session Summary */}
      {sessionStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 mb-8"
        >
          <h3 className="font-medium text-slate-800 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="text-purple-600" size={20} />
            Your Reflection Journey
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {sessionStats.questionsAnswered || 0}
              </div>
              <div className="text-slate-600">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((sessionStats.duration || 0) / 60000) || 1}
              </div>
              <div className="text-slate-600">Minutes Spent</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-6 mb-8"
      >
        <h4 className="font-medium text-blue-900 mb-3">What Happens Next?</h4>
        <ul className="text-left space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            Your therapist will receive a gentle summary to better understand your context
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            This helps them prepare thoughtful questions and approaches for your session
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            You can now continue with booking your session at your preferred time
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            Remember, human professional judgment guides everything we do
          </li>
        </ul>
      </motion.div>

      {/* Appreciation Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Heart className="text-pink-500" size={20} />
          <span className="font-medium text-slate-800">A Moment of Recognition</span>
          <Heart className="text-pink-500" size={20} />
        </div>
        <p className="text-slate-700 leading-relaxed">
          Taking time for self-reflection shows courage and self-awareness. 
          You've already taken an important step in your journey toward understanding and growth.
        </p>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <button
          onClick={onContinueToBooking}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-10 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-medium hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mx-auto"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              Continue to Booking
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </motion.div>

      {/* Final Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="mt-8 pt-6 border-t border-slate-200/50"
      >
        <p className="text-sm text-slate-500 leading-relaxed">
          Your reflection responses are securely stored and will only be shared with your assigned therapist 
          to help prepare for your session. You can request deletion of this data at any time.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CompletionMessage;