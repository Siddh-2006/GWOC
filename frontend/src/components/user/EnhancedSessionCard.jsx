import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Video, User,
  CheckCircle, AlertCircle, FileText,
  Plus, Edit2, Eye, Target, MessageSquare,
  ExternalLink
} from 'lucide-react';

const EnhancedSessionCard = ({ session, onNotesClick, onViewNotes, onTasksClick, onAdminRemarksClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'under_review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col"
    >
      <div className="p-4 flex flex-col flex-1 h-full">
        {/* Session Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-900/10 text-purple-700 rounded-xl border border-purple-200/30">
                {session.sessionMode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 capitalize text-sm tracking-tight">
                  {session.sessionType || 'Individual'} Session
                </h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  {session.sessionMode === 'online' ? 'Digital Space' : 'In-Person Sanctuary'}
                </p>
              </div>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusColor(session.status)}`}>
            {session.status?.replace('_', ' ') || 'Pending'}
          </span>
        </div>

        {/* Session Details */}
        <div className="space-y-2.5 mb-5 px-1 flex-1">
          {session.slotId && (
            <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium tracking-tight">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-purple-400" />
                <span>{formatDate(session.slotId.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-1 border-l border-gray-200 pl-2.5">
                <Clock size={13} className="text-purple-400" />
                <span>{formatTime(session.slotId.startTime)} - {formatTime(session.slotId.endTime)}</span>
              </div>
            </div>
          )}

          {session.sessionContent?.topics && (
            <div className="flex items-start gap-2.5 text-[11px] text-gray-500 font-medium">
              <Target size={13} className="mt-0.5 text-purple-300 shadow-sm" />
              <div className="leading-relaxed">
                <span className="text-gray-400 uppercase text-[9px] font-black tracking-wider block mb-0.5">Focus Areas</span>
                <span className="text-gray-700">{session.sessionContent.topics}</span>
              </div>
            </div>
          )}

          {session.sessionContent?.concerns && (
            <div className="flex items-start gap-2.5 text-[11px] text-gray-500 font-medium">
              <MessageSquare size={13} className="mt-0.5 text-purple-300 shadow-sm" />
              <div className="leading-relaxed">
                <span className="text-gray-400 uppercase text-[9px] font-black tracking-wider block mb-0.5">Primary Intentions</span>
                <span className="text-gray-700">{session.sessionContent.concerns}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/40 mt-auto">
          {/* Session Notes Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (session.hasNotes) {
                onViewNotes?.(session);
              } else {
                onNotesClick?.(session);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-[10px] font-bold uppercase tracking-wider border border-purple-100/50"
          >
            {session.hasNotes ? (
              <>
                <Eye size={12} strokeWidth={2.5} />
                View Notes
              </>
            ) : (
              <>
                <Plus size={12} strokeWidth={2.5} />
                Add Insights
              </>
            )}
          </button>

          {/* Edit Notes Button (if notes exist) */}
          {session.hasNotes && (
            <button
              onClick={() => onNotesClick?.(session)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-[10px] font-bold uppercase tracking-wider border border-gray-200/50"
            >
              <Edit2 size={12} strokeWidth={2.5} />
              Refine
            </button>
          )}

          {/* Assigned Tasks Button */}
          <button
            onClick={() => onTasksClick?.(session)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-[10px] font-bold uppercase tracking-wider border border-indigo-100/50"
          >
            <CheckCircle size={12} strokeWidth={2.5} />
            My Tasks
          </button>

          {/* Admin Remarks Button */}
          {session.status === 'confirmed' && session.adminResponse && (
            <button
              onClick={() => onAdminRemarksClick?.(session)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-[10px] font-bold uppercase tracking-wider border border-pink-100/50"
            >
              <MessageSquare size={12} strokeWidth={2.5} />
              Feedback
            </button>
          )}

          {/* Meeting Link Button */}
          {session.status === 'confirmed' && session.adminResponse?.meetingLink && (
            <a
              href={session.adminResponse.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-[10px] font-bold uppercase tracking-wider border border-green-100/50 ml-auto"
            >
              <ExternalLink size={12} strokeWidth={2.5} />
              Open Space
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedSessionCard;