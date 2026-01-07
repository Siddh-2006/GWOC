import React from 'react';
import ContentWebHeader from './ContentWebHeader';
import Footer from '../../../components/Footer';
import { motion } from 'framer-motion';

const ContentWebLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5F7]">
      <ContentWebHeader />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grow mt-44 sm:mt-40 md:mt-48"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default ContentWebLayout;
