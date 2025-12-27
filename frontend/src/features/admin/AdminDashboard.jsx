import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, User, Filter, Plus, Calendar, Loader2, Building2 } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from '../booking/booking.api';
import { CorporateInquiries } from '../../components/admin/CorporateInquiries';

const AdminDashboard = () => {
  const {
    appointments,
    availableSlots,
    updateAppointmentStatus,
    setAvailableSlots,
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Dummy data for testing
      const dummySlots = [
        { id: 1, time: '10:00 AM', date: today, status: 'available' },
        { id: 2, time: '11:00 AM', date: today, status: 'available' },
        { id: 3, time: '02:00 PM', date: today, status: 'available' },
      ];

      // const slots = await bookingApi.getAvailableSlots(today);
      // setAvailableSlots(slots);

      setAvailableSlots(dummySlots);

      // Note: Assuming there's also an API for fetching appointments
      // const apps = await bookingApi.getAllAppointments();
      // setAppointments(apps);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { label: 'Pending', count: appointments.filter(a => a.status === 'pending').length, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length, color: 'text-green-600 bg-green-100' },
    { label: 'Total Slots', count: availableSlots.length, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your sessions and appointment requests.</p>
        </div>
        <div className="flex gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`px-4 py-2 rounded-xl flex items-center gap-3 ${stat.color}`}>
              <span className="font-bold text-lg">{stat.count}</span>
              <span className="text-xs uppercase font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-purple-50 p-1 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'appointments' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'slots' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          Time Slots
        </button>
        <button
          onClick={() => setActiveTab('corporate')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'corporate' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <Building2 size={16} />
          Corporate Inquiries
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {activeTab === 'appointments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-purple-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Session</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">No appointment requests yet.</td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-primary">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{app.name}</p>
                            <p className="text-xs text-gray-400">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{app.slot?.time}</p>
                        <p className="text-xs text-secondary capitalize">{app.mode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(app.id, 'rejected')}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'slots' ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Manage Available Slots</h3>
              <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
                <Plus size={18} />
                Add Slot
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {availableSlots.map((slot) => (
                <div key={slot.id} className="p-4 rounded-2xl border border-purple-100 flex justify-between items-center group hover:shadow-md transition-all">
                  <div>
                    <p className="font-bold text-primary">{slot.time}</p>
                    <p className="text-xs text-gray-400">{slot.date}</p>
                  </div>
                  <button className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CorporateInquiries />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
