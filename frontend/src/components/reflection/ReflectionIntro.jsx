import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock, ArrowRight, X } from 'lucide-react';

const ReflectionIntro = ({ onStart, onSkip, isLoading = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/60 rounded-3xl p-8 backdrop-blur-sm shadow-lg max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="text-purple-600" size={28} />
        </div>
        <h2 className="text-2xl font-light text-slate-800 mb-3">
          Take a Moment to Reflect
        </h2>
        <p className="text-slate-600 text-lg font-light leading-relaxed">
          This reflection helps us understand how to support you better. It is completely optional.
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl">
          <MessageCircle className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-slate-800 mb-1">Organize Your Thoughts</h3>
            <p className="text-sm text-slate-600">Take a few minutes to reflect on what's on your mind before your session.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-2xl">
          <Heart className="text-green-600 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-slate-800 mb-1">Better Understanding</h3>
            <p className="text-sm text-slate-600">Help your therapist understand your context to provide more personalized support.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl">
          <Clock className="text-purple-600 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-slate-800 mb-1">Just a Few Minutes</h3>
            <p className="text-sm text-slate-600">This gentle reflection takes about 5-10 minutes and can be paused anytime.</p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-6 mb-8">
        <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
          <span className="text-amber-600">💡</span>
          Important to Know
        </h4>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>• You can skip any question that doesn't feel right</li>
          <li>• There are no right or wrong answers</li>
          <li>• You can stop and continue to booking at any time</li>
          <li>• Your responses help prepare for your session, not replace it</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6 mb-8"
        >
          <h4 className="font-medium text-slate-800 mb-3">Privacy & Security</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Your responses are stored securely and encrypted</li>
            <li>• Only your assigned therapist will see your reflection summary</li>
            <li>• No AI diagnosis or medical advice is provided</li>
            <li>• You can request deletion of your reflection data anytime</li>
          </ul>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onStart}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-medium hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Starting Reflection...
            </>
          ) : (
            <>
              <Heart size={20} />
              Start Reflection
              <ArrowRight size={18} />
            </>
          )}
        </button>
        
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="flex-1 px-8 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip & Continue to Booking
        </button>
      </div>

      {/* Toggle Details */}
      <div className="text-center mt-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 mx-auto"
        >
          {showDetails ? (
            <>
              <X size={16} />
              Hide Details
            </>
          ) : (
            <>
              <MessageCircle size={16} />
              Privacy & Security Details
            </>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
        <p className="text-xs text-slate-500 leading-relaxed">
          This reflection is for preparation only. Human professional judgment is always required. 
          If you're experiencing a crisis, please contact emergency services or a crisis helpline immediately.
        </p>
      </div>
    </motion.div>
  );
};

export default ReflectionIntro;