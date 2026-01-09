import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Play, CheckCircle, Clock } from 'lucide-react';
import EnhancedSessionCard from '../user/EnhancedSessionCard';

const SessionsTab = ({
  categorizedSessions,
  loading,
  error,
  onRetry,
  onNotesClick,
  onViewNotes,
  onTasksClick,
  onAdminRemarksClick,
  isAdminView = false,
  userName = 'User'
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">
          {isAdminView ? `Loading ${userName}'s sessions...` : 'Loading your sessions...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
        <div className="text-red-500 mb-4 text-4xl">⚠️</div>
        <p className="text-red-600 mb-2 font-bold">Unable to load sessions</p>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasSessions =
    categorizedSessions.upcoming.length > 0 ||
    categorizedSessions.ongoing.length > 0 ||
    categorizedSessions.past.length > 0;

  if (!hasSessions) {
    return (
      <div className="text-center py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <CalendarDays size={40} className="text-purple-300" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border-4 border-white">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No sessions found</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {isAdminView
              ? `${userName} hasn't booked any sessions yet.`
              : 'Your wellness journey starts with a single step. Book your first session to begin transforming your life.'}
          </p>
          <button
            onClick={() => window.location.href = '/booking'}
            className="btn-dark-purple px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-200"
          >
            Book a Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-12"
    >
      {/* Upcoming */}
      {categorizedSessions.upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100/50 rounded-lg">
              <Clock size={20} className="text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Upcoming</h3>
            <span className="bg-purple-100 text-purple-700 px-3 py-0.5 rounded-full text-xs font-bold">
              {categorizedSessions.upcoming.length}
            </span>
          </div>
          <div className="space-y-4">
            {categorizedSessions.upcoming.map((session) => (
              <motion.div key={session._id} variants={item}>
                <EnhancedSessionCard
                  session={session}
                  onNotesClick={onNotesClick}
                  onViewNotes={onViewNotes}
                  onTasksClick={onTasksClick}
                  onAdminRemarksClick={onAdminRemarksClick}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Ongoing */}
      {categorizedSessions.ongoing.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100/50 rounded-lg">
              <Play size={20} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Ongoing</h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold">
              {categorizedSessions.ongoing.length}
            </span>
          </div>
          <div className="space-y-4">
            {categorizedSessions.ongoing.map((session) => (
              <motion.div key={session._id} variants={item}>
                <EnhancedSessionCard
                  session={session}
                  onNotesClick={onNotesClick}
                  onViewNotes={onViewNotes}
                  onTasksClick={onTasksClick}
                  onAdminRemarksClick={onAdminRemarksClick}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {categorizedSessions.past.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100/50 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Completed</h3>
            <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold">
              {categorizedSessions.past.length}
            </span>
          </div>
          <div className="space-y-4">
            {categorizedSessions.past.map((session) => (
              <motion.div key={session._id} variants={item}>
                <EnhancedSessionCard
                  session={session}
                  onNotesClick={onNotesClick}
                  onViewNotes={onViewNotes}
                  onTasksClick={onTasksClick}
                  onAdminRemarksClick={onAdminRemarksClick}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default SessionsTab;