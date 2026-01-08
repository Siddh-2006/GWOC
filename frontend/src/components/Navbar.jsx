import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, User as UserIcon, LogOut, ChevronDown, ChevronRight, Brain, Zap, Target, Shield, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    console.log('🔄 Logout initiated...');
    try {
      console.log('📡 Calling logout API...');
      await authApi.logout();
      console.log('✅ Logout API successful');
    } catch (err) {
      console.error('❌ Logout API error:', err);
      // Continue with logout even if API call fails
    } finally {
      console.log('🧹 Clearing auth state...');
      logout();
      console.log('🔄 Navigating to login...');
      navigate('/login');
      console.log('✅ Logout completed');
    }
  };

  const [showHubDropdown, setShowHubDropdown] = useState(false);
  const [mobileHubOpen, setMobileHubOpen] = useState(false);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Psycho-Education', path: '/psycho-education' },
    { name: 'Corporate', path: '/corporate' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 md:left-4 md:right-4">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:rounded-2xl transition-all duration-300 ${scrolled ? 'bg-pink-100/90 backdrop-blur-lg shadow-xl py-2' : 'bg-purple-100/90 backdrop-blur-lg shadow-lg py-3'}`}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Logo className="h-10" />
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
                  className={`text-lg font-semibold link-underline pb-1 transition-colors hover:text-secondary flex items-center gap-1 ${location.pathname === link.path ? 'text-secondary' : 'text-primary'}`}
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
                              <h4 className="text-[10px] font-bold text- gray-400 uppercase tracking-widest mb-3">
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

            <div className="flex items-center gap-4 pl-4 border-l border-purple-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors group">
                    <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <UserIcon size={18} />
                    </div>
                    <span className="hidden lg:block">{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2.5 px-6">
                  Login
                </Link>
              )}

              <Link to="/booking" className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-base">
                <Calendar size={18} />
                <span>Book Session</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Link to="/booking" className="p-2 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20">
              <Calendar size={22} />
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-primary p-2 w-10 h-10 relative flex items-center justify-center">
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 8 : 0
                  }}
                  className="w-full h-0.5 bg-primary rounded-full origin-center"
                />
                <motion.span
                  animate={{
                    opacity: isOpen ? 0 : 1,
                    x: isOpen ? -10 : 0
                  }}
                  className="w-full h-0.5 bg-primary rounded-full transition-opacity"
                />
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -8 : 0
                  }}
                  className="w-full h-0.5 bg-primary rounded-full origin-center"
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
            className="lg:hidden bg-white shadow-xl border-t border-gray-100 overflow-y-auto max-h-[90vh] mx-4 rounded-b-2xl mt-2 p-0"
          >
            <div className="px-6 pt-4 pb-10 space-y-1">
              {navLinks.map((link) => (
                <div key={link.name} className="border-b border-purple-50 last:border-0">
                  {link.dropdown ? (
                    <>
                      <button
                        onClick={() => setMobileHubOpen(!mobileHubOpen)}
                        className="w-full py-5 flex items-center justify-between text-lg font-bold text-primary group"
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
                      className="block py-5 text-lg font-bold text-primary hover:text-secondary transition-colors"
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
                        <p className="font-bold text-primary">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-gray-500">View Profile</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full py-4 text-center font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center font-bold text-white bg-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav >
  );
};

export default Navbar;