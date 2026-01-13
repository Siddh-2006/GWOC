import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { LayoutGrid, Video, Headphones, FileText, Camera, AlignLeft, ChevronRight, MessageCircle, Lightbulb, Quote, CheckCircle, BookOpen } from 'lucide-react';

const RESOURCE_TYPES = [
  { name: 'All Resources', value: 'all', icon: LayoutGrid, path: '/resources' },
  { name: 'Videos', value: 'video', icon: Video, path: '/resources' },
  { name: 'Audio', value: 'audio', icon: Headphones, path: '/resources' },
  { name: 'Documents', value: 'document', icon: FileText, path: '/resources' },
  { name: 'Vlogs', value: 'vlog', icon: Camera, path: '/resources' },
  { name: 'Posts', value: 'post', icon: AlignLeft, path: '/resources' }
];

const LIBRARY_TYPES = [
  { name: 'All Library', value: 'all', icon: LayoutGrid, path: '/library' },
  { name: 'Q&A', value: 'qa', icon: MessageCircle, path: '/library' },
  { name: 'Theories', value: 'theory', icon: FileText, path: '/library' },
  { name: 'Quotes', value: 'quote', icon: Quote, path: '/library' },
  { name: 'Tips', value: 'tip', icon: Lightbulb, path: '/library' },
  { name: 'Exercises', value: 'exercise', icon: CheckCircle, path: '/library' }
];

const ResourceSidebar = ({ mode = 'resources' }) => {
  const [searchParams] = useSearchParams();
  const currentType = searchParams.get('type') || 'all';
  const searchTerm = searchParams.get('search');

  const types = mode === 'library' ? LIBRARY_TYPES : RESOURCE_TYPES;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50/50">
      <h3 className="text-lg font-bold text-primary mb-6 px-2">Discover</h3>

      <div className="space-y-2">
        {types.map((type) => {
          const Icon = type.icon;
          const isActive = currentType === type.value;
          const linkTo = `${type.path}?type=${type.value}${searchTerm ? `&search=${searchTerm}` : ''}`;

          return (
            <Link
              key={type.value}
              to={linkTo}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                : 'text-gray-500 hover:bg-purple-50 hover:text-primary'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-white'}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'} />
                </div>
                <span className="font-semibold text-sm">{type.name}</span>
              </div>

              {isActive && (
                <ChevronRight size={16} className="text-white/80" />
              )}
            </Link>
          );
        })}
      </div>

    </div>
  );
};

export default ResourceSidebar;
