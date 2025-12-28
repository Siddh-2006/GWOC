import React from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../features/psycho-education/components/Hero';
import StartHere from '../features/psycho-education/components/StartHere';
import StrugglesGrid from '../features/psycho-education/components/StrugglesGrid';
import ToolsSection from '../features/psycho-education/components/ToolsSection';
import LifeAreas from '../features/psycho-education/components/LifeAreas';
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
    <div className="min-h-screen bg-off-white selection:bg-pink-soft selection:text-primary overflow-x-hidden">
      <Hero />
      <StartHere fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      <StrugglesGrid fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      <ToolsSection fadeInUp={fadeInUp} staggerContainer={staggerContainer} />
      <LifeAreas fadeInUp={fadeInUp} />
      <LearningFormats fadeInUp={fadeInUp} />

      {/* Gentle Transition to Support */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div {...fadeInUp} className="mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-primary mb-8 tracking-tight">
              You don't have to navigate <br className="hidden md:block" /> them alone.
            </h2>
            <p className="text-xl text-gray-500 leading-bold mb-12">
              If learning brings up questions or emotions, we are here to support you. No pressure, just conversation.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/booking" className="btn-primary px-12 py-5 text-lg w-full sm:w-auto shadow-2xl shadow-primary/20">
              Book Your First Session
            </Link>
            <Link to="/contact" className="text-primary font-bold px-8 py-5 hover:text-secondary transition-colors flex items-center gap-2 group">
              Talk to Us First <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ethical & Safety Note */}
      <footer className="py-20 px-6 bg-off-white border-t border-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="p-10 md:p-16 rounded-[3rem] bg-white shadow-sm border border-purple-50 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-24 h-24 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-400">
              <Shield size={48} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-primary mb-4">MindSettler Ethical & Safety Disclosure</h4>
              <p className="text-gray-500 leading-relaxed text-lg">
                MindSettler’s Psycho-Education Hub provides educational content only.
                The information shared here is designed for awareness and understanding, and does not diagnose conditions or replace professional mental health care, medical advice, or crisis intervention.
              </p>
              <div className="mt-8 flex flex-wrap gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Non-Clinical</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Evidence-Based</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Human-First</span>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center text-gray-400 text-sm">
            <p>&copy; 2025 MindSettler. All rights reserved. Learning is a journey.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PsychoEducationHub;
