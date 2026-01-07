import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { slotApi } from '../../../services/slot.api';
import { useBookingStore } from '../../../store/useBookingStore';
import { useToast } from '../../../hooks/useToast';
import AddSlotModal from '../../../components/admin/AddSlotModal';

const AdminSlots = () => {
  const { availableSlots, setAvailableSlots } = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { success, error } = useToast();

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await slotApi.getAllSlots();
      setAvailableSlots(response.data || []);
    } catch (err) {
      error('Failed to fetch slots: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await slotApi.deleteSlot(id);
      success('Slot deleted');
      fetchSlots();
    } catch (err) {
      error('Deletion failed');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const cleanupSlots = async () => {
    try {
      const res = await slotApi.bulkCleanup();
      success(`Cleaned up ${res.data.cleanedCount} slots`);
      fetchSlots();
    } catch (err) {
      error('Cleanup failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Time Slot Management</h1>
          <p className="text-sm text-gray-500">Create and organize availability for client sessions.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={cleanupSlots}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-100 transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Cleanup
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Slot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-medium">Refreshing availability...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableSlots.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-lavender rounded-3xl flex items-center justify-center text-primary mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold text-primary">No available slots</h3>
              <p className="text-gray-400 max-w-xs mt-2">Start by adding your first time slot to allow clients to book sessions.</p>
            </div>
          ) : (
            availableSlots.map((slot) => (
              <div
                key={slot._id}
                className={`p-5 rounded-3xl border transition-all h-full flex flex-col ${slot.bookingId
                    ? 'bg-red-50/30 border-red-100'
                    : 'bg-white border-gray-100 hover:shadow-md'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${slot.bookingId ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <Clock size={16} />
                  </div>
                  {!slot.bookingId && (
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {formatDate(slot.date)}
                  </p>
                  <h3 className="text-lg font-bold text-primary">
                    {slot.startTime} - {slot.endTime}
                  </h3>

                  <div className="mt-4 space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {slot.availableModes?.map(mode => (
                        <span key={mode} className="px-2 py-0.5 rounded-full bg-lavender text-primary text-[10px] font-bold uppercase">
                          {mode}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span>₹{slot.pricing?.online}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>₹{slot.pricing?.offline}</span>
                    </div>
                  </div>
                </div>

                {slot.bookingId && (
                  <div className="mt-4 pt-4 border-t border-red-100/50 flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase">
                    <AlertCircle size={12} /> Booked by Client
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showAddModal && (
        <AddSlotModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchSlots}
        />
      )}
    </div>
  );
};

export default AdminSlots;
