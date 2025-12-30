import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  FileText,
  Target,
  Eye,
  Edit3,
  BookOpen
} from 'lucide-react';

const SessionCard = ({ session, onViewDetails, onAddNotes, onViewNotes, hasNotes = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'upcoming':
        return <Calendar size={16} className="text-blue-600" />;
      case 'ongoing':
        return <PlayCircle size={16} className="text-green-600" />;
      case 'past':
        return <CheckCircle size={16} className="text-gray-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const slot = session.slotId;
  if (!slot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getCategoryIcon(session.category)}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              Therapy Session
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {session.category} • {session.sessionMode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
          {hasNotes && (
            <div className="p-1 bg-blue-100 text-blue-600 rounded-full" title="Has notes">
              <BookOpen size={12} />
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span className="text-sm">{formatDate(slot.date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} />
          <span className="text-sm">
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          {session.sessionMode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
          <span className="text-sm">
            {session.sessionMode === 'online' ? 'Online Session' : session.location || 'In-Person'}
          </span>
        </div>

        {session.personalInfo?.numberOfPeople > 1 && (
          <div className="flex items-center gap-2 text-gray-600">
            <User size={16} />
            <span className="text-sm">{session.personalInfo.numberOfPeople} people</span>
          </div>
        )}
      </div>

      {/* Session Content Preview */}
      {session.sessionContent?.topics && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-2">
            <span className="font-medium">Topics: </span>
            {session.sessionContent.topics}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(session)}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          View Details
        </motion.button>
        
        {(session.category === 'past' || session.category === 'ongoing') && (
          <>
            {hasNotes ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewNotes(session)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Eye size={16} />
                View Notes
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddNotes(session)}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Edit3 size={16} />
                Add Notes
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SessionCard;