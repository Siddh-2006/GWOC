import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Play, Target } from 'lucide-react';
import MediaCard from '../MediaCard';

const LikedContentTab = ({ likedMedia, loading, error, onUnlike, onMediaClick, isAdminView = false, userName = 'User' }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">
            {isAdminView ? `Gathering ${userName}'s favorites...` : 'Gathering your favorites...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
        <div className="text-red-500 mb-4 text-4xl">⚠️</div>
        <p className="text-red-600 mb-2 font-bold">Unable to load favorites</p>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
      </div>
    );
  }

  if (likedMedia.length === 0) {
    return (
      <div className="text-center py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart size={40} className="text-pink-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {isAdminView ? `${userName}'s library is empty` : 'Your library is empty'}
          </h3>
          <p className="text-gray-500 mb-10 leading-relaxed text-lg">
            {isAdminView
              ? `${userName} hasn't saved any resources yet.`
              : 'Save the resources that resonate with you. When you find an article, video, or exercise that helps, click the heart to keep it here.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-bold text-gray-800 mb-1">Articles</h4>
              <p className="text-xs text-gray-500">Read expert insights</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Play className="w-8 h-8 text-pink-500 mb-3" />
              <h4 className="font-bold text-gray-800 mb-1">Videos</h4>
              <p className="text-xs text-gray-500">Watch & learn</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Target className="w-8 h-8 text-blue-500 mb-3" />
              <h4 className="font-bold text-gray-800 mb-1">Tools</h4>
              <p className="text-xs text-gray-500">Practice exercises</p>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/resources'}
            className="btn-dark-purple px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-pink-200"
          >
            Explore Resources
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Filter/Stats Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">Filtered by:</span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">All Items</span>
        </div>
        <div className="text-sm text-gray-400">
          {likedMedia.length} saved resources
        </div>
      </div>

      <motion.div
        variants={container} // Using the existing 'container' variant for stagger
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {likedMedia.map((media) => (
          <motion.div key={media._id} variants={item}>
            <MediaCard
              media={media}
              onUnlike={onUnlike}
              onClick={onMediaClick}
              showLikeButton={false}
              showRemoveButton={true}
              compact={true}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default LikedContentTab;