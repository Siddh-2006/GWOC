import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  Check
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
      success(`Successfully cleaned up ${res.data.cleanedCount} expired slots`);
      fetchSlots();
    } catch (err) {
      error('Cleanup failed');
    }
  };

  // Stats calculation
  const stats = {
    total: availableSlots.length,
    available: availableSlots.filter(s => s.isAvailable && !s.bookingId).length,
    booked: availableSlots.filter(s => s.bookingId).length,
    thisWeek: availableSlots.filter(s => {
      const slotDate = new Date(s.date);
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return slotDate >= now && slotDate <= nextWeek;
    }).length
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Time Slot Management</h1>
          <p className="text-sm text-gray-500">Create and organize availability for client sessions.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={cleanupSlots}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50 transition-all font-medium text-sm flex items-center justify-center gap-2"
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

      {/* Stats Grid */}
      {!loading && availableSlots.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Slots', value: stats.total, icon: Clock, color: 'lavender', textColor: 'primary' },
            { label: 'Available', value: stats.available, icon: Check, color: 'green-50', textColor: 'green-600' },
            { label: 'Booked', value: stats.booked, icon: AlertCircle, color: 'red-50', textColor: 'red-600' },
            { label: 'This Week', value: stats.thisWeek, icon: CalendarIcon, color: 'blue-50', textColor: 'blue-600' }
          ].map((item, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl bg-${item.color} flex items-center justify-center text-${item.textColor}`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{item.label}</p>
                <p className={`text-xl font-bold text-primary`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
                className={`p-5 rounded-3xl border transition-all h-full flex flex-col ${slot.bookingId ? 'bg-red-50/50 border-red-100' :
                  slot.isBlocked ? 'bg-yellow-50/50 border-yellow-100 shadow-sm shadow-yellow-100/20' :
                    'bg-white border-gray-100 hover:shadow-md'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${slot.bookingId ? 'bg-red-100 text-red-600' :
                    slot.isBlocked ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                    <Clock size={16} />
                  </div>
                  {!slot.bookingId && (
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="Delete Slot"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                    {formatDate(slot.date)}
                    {slot.isBlocked && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[8px]">BLOCKED</span>}
                  </p>
                  <h3 className="text-lg font-bold text-primary leading-tight">
                    {slot.startTime} - {slot.endTime}
                  </h3>

                  <div className="mt-4 space-y-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {slot.availableModes?.map(mode => (
                        <span key={mode} className="px-2 py-0.5 rounded-full bg-lavender text-primary text-[10px] font-bold uppercase tracking-tight">
                          {mode}
                        </span>
                      ))}
                    </div>

                    {slot.isBlocked && slot.blockReason && (
                      <div className="flex gap-2 items-start p-2 rounded-xl bg-white/60 border border-yellow-100">
                        <AlertCircle size={10} className="text-yellow-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-yellow-700 italic leading-tight">"{slot.blockReason}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 pt-1">
                      <span className="text-secondary">₹{slot.pricing?.online} Online</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>₹{slot.pricing?.offline} Offline</span>
                    </div>
                  </div>
                </div>

                {slot.bookingId && (
                  <div className="mt-4 pt-4 border-t border-red-100/50 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase">
                      <AlertCircle size={12} /> Booked
                    </div>
                    {slot.bookingId.personalInfo?.name && (
                      <p className="text-[10px] text-gray-500 truncate">By: {slot.bookingId.personalInfo.name}</p>
                    )}
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
          onSlotAdded={fetchSlots}
        />
      )}
    </div>
  );
};

export default AdminSlots;
