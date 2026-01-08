import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Building2,
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  User,
  Settings,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../../store/useAuthStore';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin', end: true },
    { icon: <Calendar size={20} />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <Clock size={20} />, label: 'Time Slots', path: '/admin/slots' },
    { icon: <Building2 size={20} />, label: 'Corporate', path: '/admin/corporate' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/admin/messages' },
    { icon: <Heart size={20} />, label: 'UserReflections', path: '/admin/user-reflections' },
    { icon: <Settings size={20} />, label: 'Quiz Setup', path: '/admin/reflection' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-off-white overflow-hidden text-primary font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-primary text-white flex flex-col relative z-30 shadow-2xl"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-secondary">M</span>
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold tracking-tight whitespace-nowrap"
            >
              MindSettler <span className="text-secondary">Admin</span>
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group ${isActive
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-4 p-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
          >
            <Home size={20} />
            {isSidebarOpen && (
              <span className="font-medium whitespace-nowrap">Home Site</span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-primary">Admin Control Center</h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-off-white relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
