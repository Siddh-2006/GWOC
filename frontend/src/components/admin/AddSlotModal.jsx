import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Calendar, DollarSign, Loader2, Plus } from 'lucide-react';
import { slotApi } from '../../services/slot.api';

const AddSlotModal = ({ isOpen, onClose, onSlotAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    availableModes: ['online', 'offline'],
    pricing: {
      online: 1200,
      offline: 1500
    },
    maxBookings: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.date || !formData.startTime || !formData.endTime) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.startTime >= formData.endTime) {
        throw new Error('End time must be after start time');
      }

      const response = await slotApi.createSlot(formData);
      
      if (response.success) {
        onSlotAdded(response.data);
        onClose();
        // Reset form
        setFormData({
          date: '',
          startTime: '',
          endTime: '',
          availableModes: ['online', 'offline'],
          pricing: {
            online: 1200,
            offline: 1500
          },
          maxBookings: 1
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create slot');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    const newModes = formData.availableModes.includes(mode)
      ? formData.availableModes.filter(m => m !== mode)
      : [...formData.availableModes, mode];
    
    setFormData({ ...formData, availableModes: newModes });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Plus size={24} />
              Add New Time Slot
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Start Time
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                End Time
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Available Modes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Session Modes
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.availableModes.includes('online')}
                  onChange={() => handleModeChange('online')}
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Online Sessions
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.availableModes.includes('offline')}
                  onChange={() => handleModeChange('offline')}
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                In-Person Sessions
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <DollarSign size={16} className="inline mr-1" />
              Pricing (₹)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Online Session</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pricing.online}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, online: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">In-Person Session</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pricing.offline}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, offline: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Max Bookings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Bookings
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxBookings}
              onChange={(e) => setFormData({ ...formData, maxBookings: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of clients that can book this slot (usually 1 for individual sessions)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || formData.availableModes.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Create Slot
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddSlotModal;