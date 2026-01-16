import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FootnoteCTA = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <img
        src="/assets/bg-img-1.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Optional Overlay to ensure text readability if needed, though the card is white */}
      <div className="absolute inset-0 bg-purple-50 mix-blend-multiply"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="p-8 md:p-12 lg:p-16 xl:p-24 rounded-3xl md:rounded-[3rem] lg:rounded-[4rem] bg-white shadow-2xl border border-purple-100"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 md:mb-6 lg:mb-8 leading-tight">
            Begin Your Path <br /> to <span className="text-secondary italic">Clarity</span> Today.
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 mb-8 md:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed">
            Scientific psycho-education combined with human compassion. We're here to help you navigate your unique journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Link to="/booking" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 bg-primary text-white rounded-full font-bold text-base md:text-lg lg:text-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                Start Free Consultation
              </button>
            </Link>
            <Link to="/psycho-education" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 border-2 border-primary text-primary rounded-full font-bold text-base md:text-lg lg:text-xl hover:bg-primary hover:text-white transition-all">
                Learn Our Approach
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FootnoteCTA;
