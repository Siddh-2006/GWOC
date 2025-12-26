import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, User as UserIcon, LogOut } from 'lucide-react';
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
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Psycho-Education', path: '/psycho-education' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Corporate', path: '/corporate' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl transition-all duration-300 ${scrolled ? 'bg-pink-100 backdrop-blur-lg shadow-xl py-2' : 'bg-purple-100 backdrop-blur-lg shadow-lg py-3'}`}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Logo className="h-14" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium link-underline pb-1 transition-colors hover:text-secondary ${location.pathname === link.path ? 'text-secondary' : 'text-primary'}`}
              >
                {link.name}
              </Link>
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

              <Link to="/booking" className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm">
                <Calendar size={18} />
                <span>Book Session</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/booking" className="p-2 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20">
              <Calendar size={22} />
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-primary p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
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
            className="md:hidden bg-white shadow-xl border-t border-gray-100 overflow-y-auto max-h-[90vh] mx-4 rounded-b-2xl mt-2"
          >
            <div className="px-6 pt-4 pb-10 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block py-4 text-lg font-bold text-primary hover:text-secondary border-b border-purple-50 transition-colors"
                >
                  {link.name}
                </Link>
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
    </nav>
  );
};

export default Navbar;
