import React from 'react';
import HeroSlider from '../components/HeroSlider';
import Journey from '../features/journey/Journey';
import HowItWorks from '../components/HowItWorks';
import TeamSection from '../components/TeamSection';
import FootnoteCTA from '../components/FootnoteCTA';

const Home = () => {
  return (
    <div className="bg-linear-to-r from-pink-50 via-pink-20 to-white-100">
      {/* Navbar handled by Layout */}

      {/* 1st CTA: Refined Light Hero Slider */}

      <HeroSlider />


      {/* 2nd CTA: How It Works Sticky Scroll */}
      <HowItWorks />

      {/* 3rd CTA: Scoped Mountains & Rivers Journey */}
      <Journey />

      {/* 4th: Razorpay-style Team Cards */}
      <TeamSection />

      {/* Modern Footnote CTA */}
      <FootnoteCTA />
    </div>
  );
};

export default Home;
