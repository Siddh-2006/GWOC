import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { bookingApi } from '../../booking/booking.api';
import { slotApi } from '../../../services/slot.api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    pendingBookings: 0,
    totalSlots: 0,
    activeCorporate: 0,
    newMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, slotsRes] = await Promise.all([
          bookingApi.admin.getAllBookings({ status: 'pending' }),
          slotApi.getAllSlots()
        ]);

        setStats({
          pendingBookings: bookingsRes.data?.length || 0,
          totalSlots: slotsRes.data?.length || 0,
          activeCorporate: 4, // Mock for now
          newMessages: 2 // Mock for now
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: <Calendar className="text-blue-500" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Total Time Slots', value: stats.totalSlots, icon: <Clock className="text-purple-500" />, trend: 'Stable', color: 'bg-purple-50' },
    { label: 'Corporate Inquiries', value: stats.activeCorporate, icon: <TrendingUp className="text-secondary" />, trend: '+5%', color: 'bg-pink-50' },
    { label: 'Active Sessions', value: 8, icon: <ShieldCheck className="text-green-500" />, trend: 'Live', color: 'bg-green-50' },
  ];

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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">Welcome Back, Admin</h1>
        <p className="text-gray-500">Here's what's happening with MindSettler today.</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            variants={item}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.color}`}>
                {card.icon}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full">
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-primary">
                {loading ? '...' : card.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Zap size={20} className="text-secondary" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-2xl bg-off-white hover:bg-lavender text-primary font-medium transition-colors flex justify-between items-center group">
                Add New Time Slot
                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full text-left p-4 rounded-2xl bg-off-white hover:bg-lavender text-primary font-medium transition-colors flex justify-between items-center group">
                Review Bookings
                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full text-left p-4 rounded-2xl bg-off-white hover:bg-lavender text-primary font-medium transition-colors flex justify-between items-center group">
                Send Notification
                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-purple-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-900/10">
            <h4 className="font-bold text-pink-200 mb-2 flex items-center gap-2">
              <Star size={18} />
              Admin Tip
            </h4>
            <p className="text-white/80 text-sm leading-relaxed">
              Consistently checking 'Under Review' bookings helps maintain a 100% response rate for new clients.
            </p>
          </div>
        </div>

        {/* Recent Activity Mockup */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">Recent System Activity</h3>
              <button className="text-sm font-bold text-secondary hover:underline">View All</button>
            </div>

            <div className="space-y-6">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-lavender flex items-center justify-center text-primary font-bold text-xs">
                    AB
                  </div>
                  <div className="flex-1 border-b border-gray-50 pb-6">
                    <p className="text-sm font-medium text-primary">
                      <span className="font-bold">Anu Bansal</span> requested a new session for tomorrow.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">14 minutes ago • Session Request</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
