import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
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
  Menu,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../../store/useAuthStore';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin', end: true },
    { icon: <Calendar size={20} />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <Clock size={20} />, label: 'Time Slots', path: '/admin/slots' },
    { icon: <Building2 size={20} />, label: 'Corporate', path: '/admin/corporate' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/admin/messages' },
    { icon: <Heart size={20} />, label: 'UserReflections', path: '/admin/user-reflections' },
    { icon: <Settings size={20} />, label: 'Quiz Setup', path: '/admin/reflection' },
    { icon: <FileText size={20} />, label: 'Resources', path: '/resources' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className={`p-6 flex items-center gap-3 overflow-hidden ${!isSidebarOpen ? 'justify-center' : ''}`}>
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
    </>
  );

  return (
    <div className="flex h-screen bg-off-white overflow-hidden text-primary font-sans">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex bg-primary text-white flex-col relative z-30 shadow-2xl flex-shrink-0"
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-40"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar & Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-primary text-white z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-white/60 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Force open state for mobile drawer */}
              {(() => {
                const wasOpen = isSidebarOpen;
                // We want the content to render as if 'open'
                if (!isSidebarOpen) setIsSidebarOpen(true);
                return <SidebarContent />;
              })()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-primary"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-primary truncate">Admin Control Center</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="h-6 md:h-8 w-px bg-gray-100"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-lavender rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-off-white relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
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