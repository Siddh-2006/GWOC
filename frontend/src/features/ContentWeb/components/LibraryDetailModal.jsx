import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Heart, MessageCircle, FileText, Quote, Lightbulb, CheckCircle, BookOpen, Share2 } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

// Text formatting function to handle markdown-like syntax
const formatInlineText = (text) => {
  if (!text) return text;

  // Split text by formatting patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~~[^~]+~~)/g);

  return parts.map((part, index) => {
    // Bold text **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-800 bg-secondary/10 px-1 rounded">
          {boldText}
        </strong>
      );
    }

    // Italic text *text*
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic text-secondary font-medium">
          {italicText}
        </em>
      );
    }

    // Code text `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-sm font-mono border border-slate-200">
          {codeText}
        </code>
      );
    }

    // Strikethrough text ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      const strikeText = part.slice(2, -2);
      return (
        <span key={index} className="line-through text-slate-400">
          {strikeText}
        </span>
      );
    }

    // Regular text
    return part;
  });
};

const formatText = (text) => {
  if (!text) return text;

  const lines = text.split('\n');
  const formattedLines = lines.map((line, lineIndex) => {
    // Handle headings (### Heading)
    if (line.startsWith('### ')) {
      return (
        <h3 key={lineIndex} className="text-lg font-bold text-slate-800 mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    }

    if (line.startsWith('## ')) {
      return (
        <h2 key={lineIndex} className="text-xl font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-1">
          {line.substring(3)}
        </h2>
      );
    }

    // Handle bullet points
    if (line.match(/^[\s]*[-*]\s+/)) {
      const content = line.replace(/^[\s]*[-*]\s+/, '');
      return (
        <div key={lineIndex} className="flex items-start gap-3 my-2">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2.5 flex-shrink-0" />
          <span className="text-slate-600 leading-relaxed">{formatInlineText(content)}</span>
        </div>
      );
    }

    // Handle numbered lists
    if (line.match(/^[\s]*\d+\.\s+/)) {
      const match = line.match(/^[\s]*(\d+)\.\s+(.+)/);
      if (match) {
        return (
          <div key={lineIndex} className="flex items-start gap-4 my-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">
              {match[1]}
            </span>
            <span className="text-slate-600 leading-relaxed">{formatInlineText(match[2])}</span>
          </div>
        );
      }
    }

    // Empty lines
    if (line.trim() === '') {
      return <div key={lineIndex} className="h-4" />;
    }

    // Regular paragraph
    return (
      <p key={lineIndex} className="text-slate-600 leading-relaxed my-1 text-xs md:text-sm">
        {formatInlineText(line)}
      </p>
    );
  });

  return <div className="content-body">{formattedLines}</div>;
};

const LibraryDetailModal = ({ isOpen, onClose, content, onLike }) => {
  const { isAuthenticated } = useAuthStore();
  if (!content) return null;

  const getContentIcon = (type) => {
    switch (type) {
      case 'qa': return <MessageCircle size={24} />;
      case 'theory': return <BookOpen size={24} />;
      case 'quote': return <Quote size={24} />;
      case 'article': return <FileText size={24} />;
      case 'tip': return <Lightbulb size={24} />;
      case 'exercise': return <CheckCircle size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const renderContentBody = () => {
    switch (content.contentType) {
      case 'qa':
        return (
          <div className="space-y-8">
            <div className="bg-secondary/5 p-3 rounded-lg border border-secondary/10">
              <h3 className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MessageCircle size={12} /> Question
              </h3>
              <p className="text-sm text-slate-800 font-medium leading-relaxed">
                {formatInlineText(content.content.question)}
              </p>
            </div>
            <div className="p-0.5">
              <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Answer</h3>
              <div className="text-slate-600">
                {formatText(content.content.answer)}
              </div>
            </div>
          </div>
        );
      case 'theory':
      case 'article':
        return (
          <div className="prose prose-slate max-w-none px-2">
            {formatText(content.content.body)}
          </div>
        );
      case 'quote':
        return (
          <div className="py-6 flex flex-col items-center text-center px-4">
            <Quote size={32} className="text-secondary/20 mb-4" />
            <blockquote className="text-xl md:text-2xl font-medium text-slate-800 italic leading-snug mb-4 relative">
              <span className="text-4xl text-secondary/10 absolute -top-4 -left-6 font-serif">"</span>
              {content.content.quote}
              <span className="text-4xl text-secondary/10 absolute -bottom-8 -right-2 font-serif">"</span>
            </blockquote>
            {content.content.author && (
              <p className="text-base text-slate-400 font-medium tracking-wide">— {content.content.author}</p>
            )}
          </div>
        );
      case 'tip':
      case 'exercise':
        return (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 mb-3 px-1">{content.description}</p>
            <div className="grid gap-2">
              {content.content.steps && content.content.steps.map((step, index) => (
                <div key={index} className="bg-slate-50 border border-slate-100 p-3 rounded-lg hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-secondary text-white rounded flex items-center justify-center font-bold shadow-lg shadow-secondary/20 text-[10px] text-center leading-none">
                      {step.order || index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-0.5">{formatInlineText(step.title)}</h4>
                      <div className="text-slate-600 text-xs leading-relaxed">
                        {formatText(step.description)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-slate-600 leading-relaxed px-1">
            {content.description}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative p-4 md:p-6 pb-2 border-b border-slate-100">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all z-10"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
                    {getContentIcon(content.contentType)}
                  </div>
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">
                    {content.contentType === 'qa' ? 'Q&A' : content.contentType}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                  {content.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2.5 text-slate-400 text-[8px] font-bold mt-0.5">
                  <span className="px-2 py-0.5 bg-slate-50 rounded-md text-slate-500 uppercase tracking-widest border border-slate-100/50">
                    {content.category}
                  </span>
                  {content.estimatedReadTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{content.estimatedReadTime} MIN READ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-4 custom-scrollbar">
              {renderContentBody()}

              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex flex-wrap gap-1">
                    {content.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[8px] font-bold border border-slate-100 uppercase tracking-tighter">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap justify-start items-center gap-2">
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onLike(content._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[9px] transition-all ${content.hasLiked
                      ? 'bg-rose-50 text-rose-500 shadow-lg shadow-rose-200/50'
                      : 'bg-white text-slate-400 hover:text-slate-600 shadow-xl shadow-slate-200/20 border border-slate-100'
                      }`}
                  >
                    <Heart size={12} className={content.hasLiked ? 'fill-rose-500' : ''} />
                    {content.likesCount || 0}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LibraryDetailModal;
