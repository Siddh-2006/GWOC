import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isContentWebRoute = location.pathname.startsWith('/resources') ||
    location.pathname.startsWith('/psycho-education/library');
  const isHomePage = location.pathname === '/';

  if (isContentWebRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Don't render Navbar on home page - Home component manages its own navbar */}
      {!isHomePage && <Navbar />}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grow"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
