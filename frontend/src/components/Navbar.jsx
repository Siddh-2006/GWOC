import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, User as UserIcon, LogOut, ChevronDown, ChevronRight, Brain, Zap, Target, Shield, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';
import StaggeredMenu from './animations/StaggeredMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 1);
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

  const isHomePage = location.pathname === '/';
  const isResourcesPage = location.pathname === '/resources';
  // Allow transparent navbar on Home AND Resources
  const isTransparentPage = isHomePage || isResourcesPage;
  const isWhite = isTransparentPage && !scrolled;

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Psycho-Education', path: '/psycho-education' },
    { name: 'Corporate', path: '/corporate' },
    { name: 'Resources', path: '/resources' },
    { name: 'Library', path: '/library', mobileOnly: true },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-pink-100/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Logo className="h-10" variant={isWhite ? 'white' : 'default'} />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.filter(l => !l.mobileOnly).map((link) => (
              <div
                key={link.name}
                className="relative py-2"
                onMouseEnter={() => link.dropdown && setShowHubDropdown(true)}
                onMouseLeave={() => link.dropdown && setShowHubDropdown(false)}
              >
                <Link
                  to={link.path}
                  className={`text-lg font-semibold link-underline pb-1 transition-colors hover:text-secondary flex items-center gap-1 ${location.pathname === link.path
                    ? 'text-secondary'
                    : (isWhite ? 'text-white' : 'text-primary')
                    }`}
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

            <div className="flex items-center gap-4 pl-4 border-l border-purple-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className={`flex items-center gap-2 font-bold hover:text-secondary transition-colors group ${isWhite ? 'text-white' : 'text-primary'}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isWhite ? 'bg-white/20 text-white' : 'bg-purple-100 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                      <UserIcon size={18} />
                    </div>
                    <span className="hidden lg:block">{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`p-2 transition-colors ${isWhite ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className={`py-2.5 px-6 rounded-full transition-all ${isWhite ? 'text-white hover:bg-white/10' : 'btn-primary'}`}>
                  Login
                </Link>
              )}
              <Link to="/booking" className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-base">
                <Calendar size={18} />
                <span>Book Session</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Staggered Overlay) */}
      <div className="lg:hidden">
        <StaggeredMenu
          isFixed={true}
          items={navLinks.map(l => ({ label: l.name, link: l.path }))}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          colors={isWhite ? ['#ffffff22', '#ffffff44'] : ['#B19EEF', '#3F2965']}
          accentColor={isWhite ? "#fff" : "#3F2965"}
          menuButtonColor={isWhite ? "#fff" : "#3F2965"}
          openMenuButtonColor={isWhite ? "#fff" : "#3F2965"}
          logoUrl="/logo.png"
        />
      </div>

    </nav >
  );
};

export default Navbar;