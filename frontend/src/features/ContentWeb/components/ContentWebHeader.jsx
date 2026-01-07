import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Logo from '../../../components/Logo';
import { Search } from 'lucide-react';

const RESOURCE_TYPES = [
  { name: 'ALL', value: 'all' },
  { name: 'VIDEOS', value: 'video' },
  { name: 'AUDIO', value: 'audio' },
  { name: 'DOCUMENTS', value: 'document' },
  { name: 'VLOGS', value: 'vlog' },
  { name: 'POSTS', value: 'post' }
];

const LIBRARY_TYPES = [
  { name: 'ALL', value: 'all' },
  { name: 'Q&A', value: 'qa' },
  { name: 'THEORY', value: 'theory' },
  { name: 'QUOTES', value: 'quote' },
  { name: 'ARTICLES', value: 'article' },
  { name: 'TIPS', value: 'tip' },
  { name: 'EXERCISES', value: 'exercise' },
  { name: 'LIFE AREAS', value: 'life-area' }
];

const ContentWebHeader = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLibrary = location.pathname.includes('/library');
  const navItems = isLibrary ? LIBRARY_TYPES : RESOURCE_TYPES;
  const basePath = isLibrary ? '/psycho-education/library' : '/resources';

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Search Animation State
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const placeholderWords = ['depression', 'happiness roadmap', 'imposter syndrome', 'law of attraction'];

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchTerm) {
        newParams.set('search', searchTerm);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Typing animation effect
  useEffect(() => {
    if (searchTerm) return;
    const currentWord = placeholderWords[placeholderIndex];
    const typingSpeed = isDeleting ? 50 : 150;
    const timeout = setTimeout(() => {
      if (!isDeleting && placeholder === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholderWords.length);
      } else if (isDeleting) {
        setPlaceholder(currentWord.substring(0, placeholder.length - 1));
      } else {
        setPlaceholder(currentWord.substring(0, placeholder.length + 1));
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [placeholder, placeholderIndex, isDeleting, searchTerm]);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex flex-col w-full shadow-sm">
      {/* Top Bar (White) */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Logo className="h-8 md:h-12" />
          </Link>

          <nav className="flex items-center gap-4 md:gap-10">
            <Link
              to="/"
              className="hidden sm:block text-gray-500 hover:text-primary font-medium text-xs md:text-sm transition-colors"
            >
              MindSettler Home
            </Link>
            <Link
              to="/resources"
              className={`font-semibold text-xs md:text-sm transition-colors ${!isLibrary && location.pathname === '/resources' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
            >
              Resources
            </Link>
            <Link
              to="/psycho-education/library"
              className={`font-semibold text-xs md:text-sm transition-colors ${isLibrary ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
            >
              Library
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Bar (Purple) - Dynamic Content */}
      <div className="bg-primary py-3 md:py-4 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {navItems.map((item) => {
              const search = searchParams.get('search');
              const linkTo = `${basePath}?type=${item.value}${search ? `&search=${search}` : ''}`;
              return (
                <Link
                  key={item.name}
                  to={linkTo}
                  className="text-white/80 hover:text-white text-[10px] md:text-xs font-bold tracking-widest transition-colors whitespace-nowrap uppercase"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Search Bar in Purple Line */}
          <div className="relative w-full sm:w-48 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={14} />
            <input
              type="text"
              placeholder={`Search ${placeholder}${showCursor ? '|' : ''}`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/20 rounded-full text-white text-[11px] md:text-xs placeholder-white/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ContentWebHeader;
