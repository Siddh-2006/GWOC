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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="p-6">
        {/* Session Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                {session.sessionMode === 'online' ? <Video size={20} /> : <MapPin size={20} />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 capitalize text-lg">
                  {session.sessionType || 'Individual'} Session
                </h3>
                <p className="text-sm text-gray-500">
                  {session.sessionMode === 'online' ? 'Online Session' : 'In-Person Session'}
                </p>
              </div>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
            {session.status?.replace('_', ' ') || 'Pending'}
          </span>
        </div>

        {/* Session Details */}
        <div className="space-y-3 mb-6">
          {session.slotId && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar size={16} />
              <span>{formatDate(session.slotId.date)}</span>
              <Clock size={16} className="ml-2" />
              <span>{formatTime(session.slotId.startTime)} - {formatTime(session.slotId.endTime)}</span>
            </div>
          )}

          {session.sessionContent?.topics && (
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Target size={16} className="mt-0.5" />
              <div>
                <span className="font-medium">Topics: </span>
                <span>{session.sessionContent.topics}</span>
              </div>
            </div>
          )}

          {session.sessionContent?.concerns && (
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <MessageSquare size={16} className="mt-0.5" />
              <div>
                <span className="font-medium">Concerns: </span>
                <span>{session.sessionContent.concerns}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium cursor-pointer"
          >
            {session.hasNotes ? (
              <>
                <Eye size={16} />
                View Notes
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Notes
              </>
            )}
          </button>

          {/* Edit Notes Button (if notes exist) */}
          {session.hasNotes && (
            <button
              onClick={() => onNotesClick?.(session)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            >
              <Edit2 size={16} />
              Edit Notes
            </button>
          )}

          {/* Assigned Tasks Button */}
          <button
            onClick={() => onTasksClick?.(session)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium"
          >
            <CheckCircle size={16} />
            My Tasks
          </button>

          {/* Admin Remarks Button (if confirmed and has admin response) */}
          {session.status === 'confirmed' && session.adminResponse && (
            <button
              onClick={() => onAdminRemarksClick?.(session)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium"
            >
              <User size={16} />
              Admin Remarks
            </button>
          )}

          {/* Meeting Link Button (if available) */}
          {session.status === 'confirmed' && session.adminResponse?.meetingLink && (
            <a
              href={session.adminResponse.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
            >
              <ExternalLink size={16} />
              Join Session
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedSessionCard;