import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATIC_RESOURCES } from './data/staticResources.jsx';

const ResourceReader = () => {
  const [copied, setCopied] = useState(false);
  const { slug } = useParams();
  const resource = STATIC_RESOURCES[slug];

  const handleShare = async () => {
    const shareData = {
      title: `MindSettler: ${resource.title}`,
      text: resource.subtitle,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  // Handle 404 if slug doesn't exist
  if (!resource) {
    return <Navigate to="/psycho-education" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-10 md:pt-32 md:pb-16 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">

        {/* Navigation */}
        <Link to={`/psycho-education#${resource.hubSection || ''}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold mb-6 group relative z-20">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
        </Link>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 mb-8 relative overflow-hidden"
        >
          {/* Decorative Gradient Blob */}
          <div className={`absolute -top-24 -right-24 w-80 h-80 ${resource.color.split(' ')[0]} opacity-30 rounded-full blur-3xl`} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${resource.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
              {React.cloneElement(resource.icon, { size: 28 })}
            </div>

            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 tracking-tight leading-tight">{resource.title}</h1>
              <p className="text-sm md:text-lg text-gray-500 font-light leading-relaxed max-w-2xl">{resource.subtitle}</p>
            </div>
          </div>
        </motion.div>

        {/* Content Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-gray-50 prose prose-slate max-w-none 
            prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
            prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-6
            prose-li:text-gray-600 prose-strong:text-gray-900 prose-strong:font-bold
            prose-img:rounded-3xl prose-hr:border-gray-100"
        >
          {resource.content}
        </motion.div>

        {/* Footer Actions */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-gray-100 pt-12"
          >
            <div className="flex items-center gap-6">
              <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
                {copied ? 'Link Copied!' : 'Share this path'}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-sm ${copied
                      ? 'bg-secondary border-secondary text-white scale-110'
                      : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-primary'
                    }`}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <Link to="/psycho-education/library" className="group flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-full font-bold hover:bg-primary transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              Browse Library <BookOpen size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ResourceReader;
