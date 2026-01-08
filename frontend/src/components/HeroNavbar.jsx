import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User as UserIcon, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';

const HeroNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showHubDropdown, setShowHubDropdown] = useState(false);
  const [mobileHubOpen, setMobileHubOpen] = useState(false);

  const handleLogout = async () => {
    console.log('🔄 Logout initiated...');
    try {
      console.log('📡 Calling logout API...');
      await authApi.logout();
      console.log('✅ Logout API successful');
    } catch (err) {
      console.error('❌ Logout API error:', err);
    } finally {
      console.log('🧹 Clearing auth state...');
      logout();
      console.log('🔄 Navigating to login...');
      navigate('/login');
      console.log('✅ Logout completed');
    }
  };

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Psycho-Education', path: '/psycho-education' },
    { name: 'Corporate', path: '/corporate' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Transparent Background */}
      <div className="w-full px-4 sm:px-6 lg:px-8 transition-all duration-300 bg-transparent py-1">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center -mt-1">
            <Logo className="h-14" variant="white" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative py-2"
                onMouseEnter={() => link.dropdown && setShowHubDropdown(true)}
                onMouseLeave={() => link.dropdown && setShowHubDropdown(false)}
              >
                <Link
                  to={link.path}
                  className="text-sm font-normal text-white hover:text-white/80 hover:scale-105 hover:-translate-y-0.5 transition-all flex items-center gap-1"
                >
                  {link.name}
                  {link.dropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${showHubDropdown ? 'rotate-180' : ''}`} />}
                </Link>

                {link.dropdown && (
                  <AnimatePresence>
                    {showHubDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50 mt-1"
                      >
                        <div className="grid grid-cols-3 gap-8">
                          {link.dropdown.map((section, idx) => (
                            <div key={idx}>
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                {section.title}
                              </h4>
                              <div className="space-y-1">
                                {section.items.map((item, i) => (
                                  <Link
                                    key={i}
                                    to={item.path}
                                    className="block py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <span className="text-sm font-bold text-primary hover:text-secondary transition-colors">
                                      {item.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}

            {/* Auth Section */}
            <div className="flex items-center gap-4 pl-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-2 font-normal text-white hover:text-white/80 transition-colors group">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white">
                      <UserIcon size={18} />
                    </div>
                    <span className="hidden lg:block">{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm text-white hover:bg-white/10 py-2.5 px-6 rounded-full font-normal hover:scale-105 hover:-translate-y-0.5 transition-all">
                  Login
                </Link>
              )}

              <Link to="/booking" className="text-sm text-white px-6 py-2.5 rounded-full font-normal hover:text-white/80 hover:scale-105 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <Calendar size={18} />
                <span>Book Session</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Link to="/booking" className="p-2 text-white rounded-xl">
              <Calendar size={22} />
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 w-10 h-10 relative flex items-center justify-center transition-colors">
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 8 : 0
                  }}
                  className="w-full h-0.5 bg-white rounded-full origin-center"
                />
                <motion.span
                  animate={{
                    opacity: isOpen ? 0 : 1,
                    x: isOpen ? -10 : 0
                  }}
                  className="w-full h-0.5 bg-white rounded-full transition-opacity"
                />
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -8 : 0
                  }}
                  className="w-full h-0.5 bg-white rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white shadow-xl overflow-y-auto max-h-[90vh] mx-4 rounded-b-2xl mt-2 p-0"
          >
            <div className="px-6 pt-4 pb-10 space-y-1">
              {navLinks.map((link) => (
                <div key={link.name} className="border-b border-purple-50 last:border-0">
                  {link.dropdown ? (
                    <>
                      <button
                        onClick={() => setMobileHubOpen(!mobileHubOpen)}
                        className="w-full py-5 flex items-center justify-between text-sm font-normal text-primary group hover:scale-105 hover:-translate-y-0.5 transition-all"
                      >
                        {link.name}
                        <ChevronDown size={20} className={`text-gray-400 group-hover:text-secondary transition-transform ${mobileHubOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileHubOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-purple-50/30 rounded-2xl mb-4"
                          >
                            <div className="py-4 px-6 space-y-6">
                              {link.dropdown.map((section, idx) => (
                                <div key={idx}>
                                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{section.title}</h4>
                                  <div className="space-y-2">
                                    {section.items.map((item, i) => (
                                      <Link
                                        key={i}
                                        to={item.path}
                                        onClick={() => { setIsOpen(false); setMobileHubOpen(false); }}
                                        className="block py-1 text-primary font-bold hover:text-secondary transition-colors"
                                      >
                                        <span className="text-base">{item.name}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block py-5 text-sm font-normal text-primary hover:text-secondary hover:scale-105 hover:-translate-y-0.5 transition-all"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <p className="font-normal text-primary">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500">View Profile</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full py-4 text-center font-normal text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center font-normal text-white bg-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default HeroNavbar;
