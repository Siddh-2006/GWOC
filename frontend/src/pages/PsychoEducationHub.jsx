import React from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../features/psycho-education/components/Hero';
import StartHere from '../features/psycho-education/components/StartHere';
import StrugglesGrid from '../features/psycho-education/components/StrugglesGrid';
import ToolsSection from '../features/psycho-education/components/ToolsSection';
import LearningFormats from '../features/psycho-education/components/LearningFormats';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PsychoEducationHub = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1 }
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-pink-soft selection:text-primary overflow-x-hidden">
      <Hero />
      <StartHere fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      <StrugglesGrid fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      <ToolsSection fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      {/* <LifeAreas fadeInUp={fadeInUp} /> */}
      <LearningFormats fadeInUp={fadeInUp} />

      {/* Gentle Transition to Support */}
      <section className="py-32 px-6 bg-gradient-to-b from-white to-bg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -z-0" />

        <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div {...fadeInUp} className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight font-serif">
              You don't have to navigate <br className="hidden md:block" /> them alone.
            </h2>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
              If learning brings up questions or emotions, we are here to support you. No pressure, just conversation.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link to="/booking" className="px-12 py-5 bg-[#1a1831] text-white font-bold rounded-2xl shadow-xl shadow-pink-100 hover:bg-primary transition-all text-[11px] tracking-[0.3em] uppercase">
              Book Your First Session
            </Link>
            <Link to="/contact" className="text-primary font-bold px-8 py-5 hover:text-secondary transition-colors flex items-center gap-2 group text-sm uppercase tracking-widest">
              Talk to Us First <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ethical & Safety Note */}
      <footer className="py-24 px-6 bg-white border-t border-pink-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="p-10 md:p-16 rounded-[3rem] bg-[#fff5f7]/50 backdrop-blur-sm border border-pink-50 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-20 h-20 shrink-0 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 border border-red-100/50">
              <Shield size={40} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 font-serif">MindSettler Ethical & Safety Disclosure</h4>
              <p className="text-gray-500 leading-relaxed text-base font-medium">
                MindSettler’s Psycho-Education Hub provides educational content only.
                The information shared here is designed for awareness and understanding, and does not diagnose conditions or replace professional mental health care, medical advice, or crisis intervention.
              </p>
              <div className="mt-8 flex flex-wrap gap-8 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-100"><CheckCircle2 size={12} className="text-green-400" /> Non-Clinical</span>
                <span className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-100"><CheckCircle2 size={12} className="text-green-400" /> Evidence-Based</span>
                <span className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-100"><CheckCircle2 size={12} className="text-green-400" /> Human-First</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PsychoEducationHub;
