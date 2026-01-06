import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Calendar, Clock, ExternalLink, 
  MessageSquare, CheckCircle 
} from 'lucide-react';

const AdminRemarksModal = ({ session, isOpen, onClose }) => {
  if (!isOpen || !session?.adminResponse) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <User className="text-green-600" size={28} />
                Admin Remarks
              </h2>
              <p className="text-gray-600 mt-1">
                Session confirmation details and admin notes
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Session Status */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-green-800">Session Confirmed</h3>
              </div>
              <p className="text-green-700">
                Your session has been confirmed by the admin. Please find the details below.
              </p>
            </div>

            {/* Confirmed Session Details */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmed Session Details</h3>
              
              <div className="space-y-4">
                {session.adminResponse.confirmedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={20} />
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(session.adminResponse.confirmedDate)}
                      </p>
                    </div>
                  </div>
                )}

                {session.adminResponse.confirmedTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="text-blue-600" size={20} />
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium text-gray-900">
                        {formatTime(session.adminResponse.confirmedTime)}
                      </p>
                    </div>
                  </div>
                )}

                {session.adminResponse.meetingLink && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="text-green-600 mt-1" size={20} />
                    <div className="flex-1">
                      <span className="text-gray-600">Meeting Link:</span>
                      <div className="mt-1">
                        <a
                          href={session.adminResponse.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                        >
                          <ExternalLink size={16} />
                          Join Session
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click the link above to join your session at the scheduled time
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {session.adminResponse.notes && (
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Admin Notes
                </h3>
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-gray-700 leading-relaxed">
                    {session.adminResponse.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Session Preparation Tips */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Session Preparation</h3>
              <div className="space-y-3 text-purple-800">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <p>Join the session 5 minutes early to test your connection</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <p>Ensure you're in a quiet, private space</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <p>Have a notebook ready if you'd like to take notes</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <p>Check your internet connection and audio/video settings</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions or need to reschedule, please contact us through the contact form or reach out to our support team.
              </p>
              <button
                onClick={() => window.location.href = '/contact'}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRemarksModal;