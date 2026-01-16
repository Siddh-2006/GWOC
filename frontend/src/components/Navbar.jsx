import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
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
            setScrolled(window.scrollY > 1);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

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

    const isHomePage = location.pathname === '/';
    const isResourcesPage = location.pathname === '/resources';
    const isLibraryPage = location.pathname.includes('/library');
    // Allow transparent navbar on Home AND Resources
    const isTransparentPage = isHomePage || isResourcesPage;
    const isWhite = isTransparentPage && !scrolled;
    
    // Hide main navbar on Resources and Library pages (they have ContentWebHeader)
    const shouldHideNavbar = isResourcesPage || isLibraryPage;

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Psycho-Education', path: '/psycho-education' },
        { name: 'Corporate', path: '/corporate' },
        { name: 'Resources', path: '/resources' },
        { name: 'Library', path: '/library', mobileOnly: true },
        { name: 'Contact', path: '/contact' },
    ];

    if (shouldHideNavbar) {
        return null;
    }

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-[9997] transition-all duration-300 ${scrolled ? 'bg-pink-100/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center">
                            <Logo className="h-10" variant={isWhite ? 'white' : 'default'} />
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {navLinks.filter(link => !link.mobileOnly).map((link) => (
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
                                            <span className="hidden xl:block">{user?.firstName}</span>
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
                                    <Link to="/login" className={`py-2.5 px-6 rounded-full transition-all font-bold ${isWhite ? 'text-white hover:bg-white/10' : 'btn-primary'}`}>
                                        Login
                                    </Link>
                                )}
                                <Link to="/booking" className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-base whitespace-nowrap">
                                    <Calendar size={18} />
                                    <span className="hidden xl:inline">Book Session</span>
                                    <span className="xl:hidden">Book</span>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center gap-3">
                            <Link 
                                to="/booking" 
                                className="bg-secondary text-white p-2.5 rounded-full shadow-lg hover:scale-105 transition-all"
                                title="Book Session"
                            >
                                <Calendar size={20} />
                            </Link>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`p-2 rounded-lg transition-colors ${isWhite ? 'text-white' : 'text-primary'}`}
                                aria-label="Toggle menu"
                            >
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay - Outside nav element */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                        />
                        
                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-[9999] overflow-y-auto"
                        >
                            {/* Mobile Menu Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                                <Logo className="h-8" />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Mobile Menu Content */}
                            <div className="p-6">
                                {/* User Section */}
                                {isAuthenticated && (
                                    <div className="mb-6 pb-6 border-b border-gray-100">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                                {user?.firstName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-sm text-gray-500">View Profile</p>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                {/* Navigation Links */}
                                <nav className="space-y-2 mb-6">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${
                                                location.pathname === link.path
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>

                                {/* Auth Actions */}
                                <div className="space-y-3 pt-6 border-t border-gray-100">
                                    {isAuthenticated ? (
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                                        >
                                            <LogOut size={20} />
                                            Logout
                                        </button>
                                    ) : (
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                                        >
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;