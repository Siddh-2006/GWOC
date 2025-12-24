import React from 'react';
import { motion } from 'framer-motion';
import HeroSlider from '../components/HeroSlider';
import Journey from '../features/journey/Journey';
import HowItWorks from '../components/HowItWorks';
import TeamSection from '../components/TeamSection';

const Home = () => {
  return (
    <div className="bg-white">
      {/* 1st CTA: Refined Light Hero Slider */}
      <HeroSlider />

      {/* 2nd CTA: Scoped Mountains & Rivers Journey */}
      <Journey />

      {/* 3rd CTA: How It Works Sticky Scroll */}
      <HowItWorks />

      {/* 4th: Razorpay-style Team Cards */}
      <TeamSection />

      {/* Modern Footnote CTA */}
      <section className="py-32 bg-purple-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-16 md:p-24 rounded-[4rem] bg-white shadow-2xl border border-purple-100"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-primary mb-8 leading-tight">Begin Your Path <br /> to <span className="text-secondary italic">Clarity</span> Today.</h2>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
              Scientific psycho-education combined with human compassion. We're here to help you navigate your unique journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="px-12 py-5 bg-primary text-white rounded-full font-bold text-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                Start Free Consultation
              </button>
              <button className="px-12 py-5 border-2 border-primary text-primary rounded-full font-bold text-xl hover:bg-primary hover:text-white transition-all">
                Learn Our Approach
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
