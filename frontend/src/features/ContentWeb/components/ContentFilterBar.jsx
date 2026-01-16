import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
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

const ContentFilterBar = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLibrary = location.pathname.includes('/library');
  const navItems = isLibrary ? LIBRARY_TYPES : RESOURCE_TYPES;
  const basePath = isLibrary ? '/library' : '/resources';

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
    <div className="w-full bg-primary py-3 md:py-4 px-4 md:px-12 rounded-3xl shadow-sm mb-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
          {navItems.map((item) => {
            const search = searchParams.get('search');
            const linkTo = `${basePath}?type=${item.value}${search ? `&search=${search}` : ''}`;
            const isActive = (searchParams.get('type') || 'all') === item.value;

            return (
              <Link
                key={item.name}
                to={linkTo}
                className={`${isActive ? 'text-white border-b-2 border-white' : 'text-white/80 hover:text-white'} text-[10px] md:text-xs font-bold tracking-widest transition-all whitespace-nowrap uppercase py-1`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Search Bar */}
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
  );
};

export default ContentFilterBar;
