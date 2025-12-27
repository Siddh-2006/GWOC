import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, ArrowRight, Clock } from 'lucide-react';

const DUMMY_BLOGS = [
  {
    id: 1,
    title: "Understanding Anxiety: More Than Just Worry",
    category: "Awareness",
    excerpt: "Anxiety is a natural response to stress, but when it becomes overwhelming, it's important to understand its roots...",
    date: "Dec 15, 2025",
    readTime: "5 min read",
    image: "/assets/blog1.jpg"
  },
  {
    id: 2,
    title: "The Power of Mindful Breathing",
    category: "Self-Help",
    excerpt: "Discover how simple breathing techniques can ground you in moments of chaos and restore emotional balance.",
    date: "Dec 10, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Navigating Grief: A Gentle Journey",
    category: "Guidance",
    excerpt: "Grief is not a linear process. Learn how to hold space for your emotions while moving through life's toughest changes.",
    date: "Dec 05, 2025",
    readTime: "7 min read",
    image: "/assets/blog3.jpg"
  },
  {
    id: 4,
    title: "Breaking the Stigma of Therapy",
    category: "Awareness",
    excerpt: "Why seeking help is a sign of strength, not weakness. Let's change the conversation around mental health support.",
    date: "Nov 28, 2025",
    readTime: "6 min read",
    image: "/assets/blog4.jpg"
  },
  {
    id: 5,
    title: "Building Resilience in Everyday Life",
    category: "Self-Help",
    excerpt: "Resilience isn't about never falling; it's about how you get back up. Here are practical tips for mental toughness.",
    date: "Nov 20, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    title: "The Role of Nutrition in Mental Health",
    category: "Awareness",
    excerpt: "Exploring the gut-brain connection and how what you eat influences how you feel and think.",
    date: "Nov 12, 2025",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80"
  }
];

const CATEGORIES = ["All", "Awareness", "Self-Help", "Guidance"];

const BlogCard = ({ blog }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
  >
    <div className="relative h-48 overflow-hidden">
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full shadow-sm">
          {blog.category}
        </span>
      </div>
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {blog.date}
        </span>
        <span>•</span>
        <span>{blog.readTime}</span>
      </div>

      <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2">
        {blog.title}
      </h3>

      <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
        {blog.excerpt}
      </p>

      <div className="mt-auto pt-4 border-t border-purple-50">
        <button className="text-secondary font-bold text-sm flex items-center gap-2 group/btn">
          Read Full Article
          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  </motion.div>
);

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBlogs = useMemo(() => {
    return DUMMY_BLOGS.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="py-20 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-primary rounded-full text-sm font-bold mb-6"
        >
          <BookOpen size={18} />
          <span>MindSettler Resources</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold text-primary mb-6"
        >
          Explore Our <span className="text-secondary">Wellness Blog</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-lg max-w-2xl mx-auto"
        >
          Thoughtful insights, guided practices, and supportive articles to help you navigate your mental health journey.
        </motion.p>
      </div>

      {/* Filters & Search */}
      <div className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-purple-50 shadow-sm sticky top-24 z-30">
        {/* Category Tabs */}
        <div className="flex p-1 bg-purple-50/50 rounded-2xl overflow-x-auto no-scrollbar w-full md:w-auto">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === category
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-primary'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Blog Grid */}
      <AnimatePresence mode="popLayout">
        {filteredBlogs.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-purple-50/30 rounded-3xl border-2 border-dashed border-purple-100"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No results found</h3>
            <p className="text-gray-500">We couldn't find any articles matching "{searchQuery}" in {selectedCategory}.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-6 text-secondary font-bold underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;
