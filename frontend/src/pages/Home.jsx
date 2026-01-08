import React, { useState, useEffect, useRef } from 'react';
import HeroSlider from '../components/HeroSlider';
import HeroNavbar from '../components/HeroNavbar';
import Navbar from '../components/Navbar';
import Journey from '../features/journey/Journey';
import HowItWorks from '../components/HowItWorks';
import TeamSection from '../components/TeamSection';
import FootnoteCTA from '../components/FootnoteCTA';

const Home = () => {
  const [showHeroNavbar, setShowHeroNavbar] = useState(true);
  const heroSliderRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroSliderRef.current) {
        const heroSliderBottom = heroSliderRef.current.getBoundingClientRect().bottom;
        setShowHeroNavbar(heroSliderBottom > 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white">
      {/* Conditional Navbar */}
      {showHeroNavbar ? <HeroNavbar /> : <Navbar />}

      {/* 1st CTA: Refined Light Hero Slider */}
      <div ref={heroSliderRef}>
        <HeroSlider />
      </div>

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
