import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { STATIC_RESOURCES } from './data/staticResources.jsx';

const SnowPink = () => {
  const particles = useMemo(() => Array.from({ length: 40 }), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {particles.map((_, i) => {
        const size = Math.random() * 6 + 4; // 4px to 10px
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-pink-300/50 blur-[1px]"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`
            }}
            initial={{
              y: `${Math.random() * 100 - 10}vh`,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: '110vh',
              opacity: [0, 0.7, 0.7, 0],
              x: [`0px`, `${(Math.random() - 0.5) * 100}px`],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
};

const ResourceReader = () => {
  const { slug } = useParams();
  const resource = STATIC_RESOURCES[slug];

  // States
  const [copied, setCopied] = useState(false);

  // Refs
  const contentRef = useRef(null);

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

  // Handle 404
  if (!resource) {
    return <Navigate to="/psycho-education" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff0f3] via-white to-[#fff0f3] relative overflow-x-hidden">

      {/* Background Animation */}
      <SnowPink />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-32 relative z-10">
        <div className="flex flex-col relative">

          {/* Back to Hub */}
          <div className="mb-4">
            <Link to={`/psycho-education#${resource.hubSection || ''}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-medium group text-[10px] uppercase tracking-widest">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Back to Hub
            </Link>
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight tracking-tight max-w-2xl">
                {resource.title}
              </h1>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-pink-100 text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest flex-shrink-0 h-fit"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                {copied ? 'Copied' : 'Share Guide'}
              </button>
            </div>

            <div className="max-w-2xl relative">
              <p className="text-xl text-gray-400 font-light leading-relaxed border-l-4 border-primary/20 pl-6">
                {resource.subtitle}
              </p>
            </div>
          </header>

          {/* Content Body */}
          <div
            ref={contentRef}
            className="prose prose-slate max-w-none 
              prose-headings:text-gray-900 prose-headings:font-bold prose-headings:scroll-mt-32 prose-headings:mb-6
              [&>h3]:mt-12 [&>h4]:mt-8
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-gray-600 prose-strong:text-gray-900 prose-strong:font-bold
              prose-img:rounded-[1.5rem] prose-hr:border-gray-100
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          >
            {resource.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceReader;
