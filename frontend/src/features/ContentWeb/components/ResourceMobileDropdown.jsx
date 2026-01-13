import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LayoutGrid, Video, Headphones, FileText, Camera, AlignLeft, MessageCircle, Lightbulb, Quote, CheckCircle, BookOpen } from 'lucide-react';

const RESOURCE_TYPES = [
  { name: 'All Resources', value: 'all', icon: LayoutGrid },
  { name: 'Videos', value: 'video', icon: Video },
  { name: 'Audio', value: 'audio', icon: Headphones },
  { name: 'Documents', value: 'document', icon: FileText },
  { name: 'Vlogs', value: 'vlog', icon: Camera },
  { name: 'Posts', value: 'post', icon: AlignLeft }
];

const LIBRARY_TYPES = [
  { name: 'All Library', value: 'all', icon: LayoutGrid },
  { name: 'Q&A', value: 'qa', icon: MessageCircle },
  { name: 'Theories', value: 'theory', icon: FileText },
  { name: 'Quotes', value: 'quote', icon: Quote },
  { name: 'Tips', value: 'tip', icon: Lightbulb },
  { name: 'Exercises', value: 'exercise', icon: CheckCircle }
];

const ResourceMobileDropdown = ({ mode = 'resources' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const types = mode === 'library' ? LIBRARY_TYPES : RESOURCE_TYPES;
  const currentType = searchParams.get('type') || 'all';

  const selectedType = types.find(t => t.value === currentType) || types[0];
  const SelectedIcon = selectedType.icon;

  const handleSelect = (value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', value);
    setSearchParams(newParams);
    setIsOpen(false);
  };

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white border border-purple-100 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-primary hover:bg-purple-50 flex-shrink-0"
      >
        <SelectedIcon size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-50 py-2 origin-top-right"
            >
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Filter {mode === 'library' ? 'Library' : 'Resources'}
                </span>
              </div>
              {types.map((type) => {
                const Icon = type.icon;
                const isSelected = currentType === type.value;

                return (
                  <button
                    key={type.value}
                    onClick={() => handleSelect(type.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isSelected
                      ? 'bg-purple-50 text-primary border-l-4 border-primary'
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                    <span className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}>
                      {type.name}
                    </span>
                    {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceMobileDropdown;
