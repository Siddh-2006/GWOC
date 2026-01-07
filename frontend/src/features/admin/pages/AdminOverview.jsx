import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../booking/booking.api';
import { slotApi } from '../../../services/slot.api';
import contactApi from '../../../services/contact.api';
import { corporateService } from '../../../services/corporate.api';
import AddSlotModal from '../../../components/admin/AddSlotModal';
import { Calendar, Clock, ShieldCheck, Zap, ArrowUpRight, Star, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    pendingBookings: 0,
    totalSlots: 0,
    activeSessions: 0,
    newMessages: 0,
    corporateInquiries: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const timeAgo = (date) => {
    if (!date) return 'Some time ago';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [bookingsRes, slotsRes, contactRes, corpRes, contactItemsRes, corpItemsRes] = await Promise.all([
        bookingApi.admin.getAllBookings({ status: 'all' }),
        slotApi.getAllSlots(),
        contactApi.getContactStats().catch(() => ({ data: { total: 0, unread: 0 } })),
        corporateService.admin.getStats().catch(() => ({ total: 0, pending: 0 })),
        contactApi.getContactMessages({ limit: 10 }).catch(() => ({ data: { contacts: [] } })),
        corporateService.admin.getInquiries({ limit: 10 }).catch(() => ({ data: [] }))
      ]);

      const allBookings = bookingsRes.data || [];
      const allSlots = slotsRes.data || [];
      const allMessages = contactItemsRes.data?.contacts || [];
      const allInquiries = corpItemsRes.data?.inquiries || [];

      // Build a more comprehensive activity list
      const activities = [];

      // 1. Booking Activities
      allBookings.forEach(b => {
        activities.push({
          id: `${b._id}_created`,
          name: b.personalInfo?.name || 'Unknown Client',
          type: 'Session Request',
          message: 'requested a new session.',
          time: b.createdAt
        });

        if (b.adminResponse?.reviewedAt) {
          activities.push({
            id: `${b._id}_reviewed`,
            name: b.personalInfo?.name || 'Unknown Client',
            type: 'Status Update',
            message: 'booking status changed to under review.',
            time: b.adminResponse.reviewedAt
          });
        }
        if (b.adminResponse?.confirmedAt) {
          activities.push({
            id: `${b._id}_confirmed`,
            name: b.personalInfo?.name || 'Unknown Client',
            type: 'Status Update',
            message: 'booking status changed to confirmed.',
            time: b.adminResponse.confirmedAt
          });
        }
      });

      // 2. Contact Message Activities
      allMessages.forEach(m => {
        activities.push({
          id: `${m._id}_msg`,
          name: m.name || 'Unknown',
          type: 'Contact Message',
          message: 'sent a new message through contact form.',
          time: m.createdAt
        });
      });

      // 3. Corporate Inquiry Activities
      allInquiries.forEach(i => {
        activities.push({
          id: `${i._id}_corp`,
          name: i.organizationName || i.contactPerson || 'Company',
          type: 'Corporate Inquiry',
          message: `requested a ${i.engagementType?.replace(/-/g, ' ')} session.`,
          time: i.createdAt
        });
      });

      const sortedActivities = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

      setStats({
        pendingBookings: allBookings.filter(b => b.status === 'pending').length,
        totalSlots: allSlots.length,
        activeSessions: allBookings.filter(b => b.status === 'confirmed').length,
        newMessages: contactRes.data?.unread || contactRes.data?.total || 0,
        corporateInquiries: corpRes.pending || corpRes.total || 0,
        recentActivity: sortedActivities
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: <Calendar className="text-blue-500" />, trend: 'Action Required', color: 'bg-blue-50' },
    { label: 'Total Time Slots', value: stats.totalSlots, icon: <Clock className="text-purple-500" />, trend: 'Manage Slots', color: 'bg-purple-50' },
    { label: 'Corporate Inquiries', value: stats.corporateInquiries, icon: <TrendingUp className="text-secondary" />, trend: 'Inquiries', color: 'bg-pink-50' },
    { label: 'Unread Messages', value: stats.newMessages, icon: <Zap className="text-orange-500" />, trend: 'Inbox', color: 'bg-orange-50' },
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

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity */}
        <div className="w-full">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-lg font-bold text-primary">Recent System Activity</h3>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="text-sm font-bold text-secondary hover:underline"
              >
                View Detailed Activity
              </button>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : stats.recentActivity.length === 0 ? (
                <p className="text-center text-gray-400 py-12">No recent activity found.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-4 items-start py-6 first:pt-0 last:pb-0 group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${activity.type === 'Session Request' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'Corporate Inquiry' ? 'bg-pink-100 text-pink-600' :
                          activity.type === 'Contact Message' ? 'bg-orange-100 text-orange-600' :
                            'bg-purple-100 text-primary'
                        }`}>
                        {activity.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-primary">
                            <span className="font-bold">{activity.name}</span> {activity.message}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">{timeAgo(activity.time)}</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                          <span className={`${activity.type === 'Session Request' ? 'text-blue-500' :
                            activity.type === 'Corporate Inquiry' ? 'text-pink-500' :
                              activity.type === 'Contact Message' ? 'text-orange-500' :
                                'text-primary/60'
                            }`}>{activity.type}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddSlotModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSlotAdded={() => {
            setShowAddModal(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default AdminOverview;
