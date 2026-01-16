import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Eye, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Quote, Target } from 'lucide-react';
import ScrollFloat from '../components/animations/ScrollFloat';
import Stack from '../components/animations/Stack';
import CardSwap, { Card } from '../components/animations/CardSwap';
import MagicBento from '../components/MagicBento';

const About = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // TODO: About Page Refactor Checklist
  // - [x] Refine About Page Layout
  //     - [x] Swap CardSwap and Stack components
  //     - [x] Standardize typography to compact premium style
  //     - [x] Rebalance Ethos and Founder section layouts
  //     - [x] Fix card label clipping issues
  //     - [x] Adjust Stack fanning direction and peek-out effect
  //     - [x] Align Hero design to editorial mockup (colors, scale, and background)
  //     - [x] Redesign section titles (Editorial Hero / Simple Sections)
  // - [ ] Responsiveness check across all devices

  const float = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const AnimatedSection = ({ children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className={className}
      >
        {children}
      </motion.div>
    );
  };
  const WavyDivider = ({ top = false, color = "fill-white/80" }) => (
    <div className={`absolute left-0 w-full overflow-hidden leading-0 ${top ? 'top-0 rotate-180' : 'bottom-0'} -z-1`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`relative block w-full h-[80px] md:h-[120px] ${color}`}>
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
      </svg>
    </div>
  );

  const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    const isInView = useInView(videoRef, { amount: 0.5 });

    useEffect(() => {
      if (isInView) {
        videoRef.current?.play().catch(err => console.log("Autoplay prevented:", err));
      } else {
        videoRef.current?.pause();
      }
    }, [isInView]);

    return (
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        className="w-full h-full object-cover"
      />
    );
  };


  return (
    <div className="min-h-screen bg-white selection:bg-primary/10 selection:text-primary overflow-x-hidden">

      {/* 1. CINEMATIC HERO */}
      <section className="relative bg-bg overflow-hidden py-16 md:py-20 lg:py-28 border-b border-gray-50">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-pink-100/25 rounded-full blur-[120px] -mr-44 -mt-44" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-purple-100/25 rounded-full blur-[120px] -ml-44 -mb-44" />

        <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-12 md:gap-16 lg:gap-20 relative z-10">
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 lg:space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              className="flex items-center gap-3 md:gap-4"
            >
              <div className="w-8 md:w-10 h-[2px] bg-pink-500" />
              <span className="text-secondary font-semibold tracking-[0.25em] md:tracking-[0.35em] uppercase text-[10px] md:text-xs">
                About MindSettler
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary"
            >
              Understanding is the first form of care<br />
              {/* <span className="text-secondary">you with</span> */}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.2 }}
              className="text-base md:text-lg lg:text-xl text-primary/80 leading-relaxed max-w-xl border-l border-primary/20 pl-4 md:pl-6"
            >
              Healing happens in circles, not lines. We provide the map to return to old places with new eyes, honoring the landscape of your internal world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.2 }}
            >
              <button
                onClick={() => window.location.href = '/booking'}
                className="px-6 md:px-9 py-3 md:py-4 bg-secondary text-white font-bold rounded-2xl shadow-xl shadow-pink-100 hover:bg-primary transition-all flex items-center gap-3 md:gap-4 group text-[9px] md:text-[10px] tracking-[0.25em] md:tracking-[0.3em] uppercase"
              >
                START YOUR JOURNEY
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Stack Animation */}
          <div className="w-full lg:w-1/2 flex justify-center items-center lg:items-end h-[400px] md:h-[500px] lg:h-[600px] pb-10 md:pb-16 lg:pb-20 overflow-visible relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex justify-center items-center lg:items-end w-full max-w-[300px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-none h-full overflow-visible mx-auto"
            >
              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={true}
                cards={[
                  // Card 4
                  <div key="c4" className="relative w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px] h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] border-[6px] md:border-[8px] lg:border-[10px] border-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] bg-white overflow-hidden">
                    <img
                      src="/assets/about_stack_4.jpg"
                      className="w-full h-full object-cover brightness-110"
                      alt="Therapy Insight 4"
                    />
                  </div>,
                  // Card 3
                  <div key="c3" className="relative w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px] h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] border-[6px] md:border-[8px] lg:border-[10px] border-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] bg-white overflow-hidden">
                    <img
                      src="/assets/about_stack_3.jpg"
                      className="w-full h-full object-cover brightness-110"
                      alt="Therapy Insight 3"
                    />
                  </div>,
                  // Card 2
                  <div key="c2" className="relative w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px] h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] border-[6px] md:border-[8px] lg:border-[10px] border-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] bg-white overflow-hidden">
                    <img
                      src="/assets/about_stack_2.jpg"
                      className="w-full h-full object-cover brightness-110"
                      alt="Therapy Insight 2"
                    />
                  </div>,
                  // Card 1
                  <div key="c1" className="relative w-[280px] sm:w-[340px] md:w-[380px] lg:w-[420px] h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] border-[6px] md:border-[8px] lg:border-[10px] border-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] bg-white overflow-hidden">
                    <img
                      src="/assets/about_stack_1.jpg"
                      className="w-full h-full object-cover brightness-110"
                      alt="Therapy Insight 1"
                    />
                  </div>
                ]}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. WHAT MINDSETTLER IS (Video & Ethos) */}
      <section className="py-24 md:py-32 px-6 bg-white relative overflow-hidden">
        {/* Soft background glow - perfectly aligned with brand theme */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">

            {/* Left: Video Player - Grounded & Large */}
            <div className="w-full lg:w-[48%] relative group lg:sticky lg:top-32">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 aspect-[4/5] w-full max-w-lg mx-auto rounded-[3.5rem] md:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border-[12px] md:border-[20px] border-white bg-white hover:shadow-secondary/20 transition-all duration-1000"
              >
                <VideoPlayer src="/assets/pranika1.mp4" />

                {/* Visual accents inside frame */}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5 rounded-[2.8rem] md:rounded-[4rem]" />

                {/* Subtle Breathing Overlay */}
                <div className="absolute bottom-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 animate-pulse">
                  <div className="w-3 h-3 bg-secondary rounded-full" />
                </div>
              </motion.div>

              {/* Floating decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/10 rounded-[4rem] -z-0 blur-3xl group-hover:blur-2xl transition-all duration-1000" />
              <div className="absolute top-1/2 -right-12 w-40 h-40 bg-primary/5 rounded-full -z-0 blur-3xl" />
            </div>

            {/* Right: Ethos Content */}
            <div className="w-full lg:w-[52%] space-y-12">
              <AnimatedSection>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-px bg-secondary/40" />
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.4em]">The Core Philosophy</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary leading-[1] font-serif italic">
                    What Is <br />
                    <span className="text-primary not-italic">MindSettler?</span>
                  </h2>

                  <p className="text-lg md:text-xl text-primary/70 leading-relaxed font-light max-w-2xl">
                    MindSettler is a sanctuary for those who seek to understand the <span className="text-secondary font-semibold border-b-2 border-secondary/10">why</span> before the <span className="text-secondary font-semibold border-b-2 border-secondary/10">how</span>. We believe true healing begins with quiet awareness and human-led clarity.
                  </p>
                </div>
              </AnimatedSection>

              {/* Pillars Grid - Modern blocks with hover effects */}
              <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                {[
                  { title: "Awareness", desc: "Understanding the patterns that shape your inner world.", icon: <Eye size={22} />, color: "bg-pink-50 text-pink-500" },
                  { title: "Guidance", desc: "Human-led support designed for your unique journey.", icon: <Heart size={22} />, color: "bg-blue-50 text-secondary" },
                  { title: "Reflection", desc: "Creating safe spaces to speak without being judged.", icon: <Sparkles size={22} />, color: "bg-purple-50 text-purple-500" },
                  { title: "Growth", desc: "Sustainable change rooted in self-compassion.", icon: <Target size={22} />, color: "bg-indigo-50 text-primary" }
                ].map((pillar, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.8 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group flex flex-col p-8 rounded-3xl bg-white border border-gray-100/60 shadow-sm hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/30 transition-all duration-500 cursor-default"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${pillar.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      {pillar.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-primary font-serif italic mb-3 tracking-tight">{pillar.title}</h3>
                    <p className="text-primary/50 text-sm leading-relaxed font-medium">{pillar.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET THE FOUNDER (Interactive Display) */}
      <section className="py-32 px-6 relative bg-gray-50/80 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Founder Content */}
            <AnimatedSection>
              <div className="space-y-10">
                <div>
                  <span className="text-primary font-bold text-[8px] uppercase tracking-[0.4em] mb-4 block underline decoration-primary/20 underline-offset-8">Our Goal</span>

                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-8 font-serif">
                    Our Vision <br />
                    <span className="text-secondary italic">& Mission</span>
                  </h2>
                </div>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3 font-serif">Our Mission</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      To replace silence with understanding and isolation with connection. We aim to create a safe harbor where mental health is not just treated, but deeply understood.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-3 font-serif">Our Vision</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      A world where seeking help is as natural as seeking shade. We envision a society where emotional well-being is prioritized and accessible to everyone, without stigma or judgment.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Founder Image Stack */}
            <div className="relative w-full max-w-[320px] mx-auto bg-white p-3 rounded-2xl shadow-xl border border-gray-100 rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* PORTRAIT CARD (FRONT) */}
              <div className="relative w-full aspect-[4/5] rounded-xl bg-gray-50 overflow-hidden mb-4">
                <img src="/assets/pranika.jpg" className="w-full h-full object-cover" alt="Founder" />
              </div>

              <div className="text-center space-y-1.5 pb-2">
                <h3 className="text-xl font-bold tracking-tight text-primary font-serif">Parnika Bajaj</h3>
                <p className="text-[10px] font-bold tracking-widest uppercase text-secondary">Counseling Psychologist</p>
                <div className="w-6 h-px bg-gray-200 mx-auto my-2" />
                <div className="flex flex-col items-center gap-0.5 text-gray-500 text-[9px] font-medium">
                  <span className="flex items-center gap-1">
                    Master of Arts, Counseling Psychology
                  </span>
                  <span className="opacity-60">GGU (2022)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WavyDivider top color="fill-gray-50/80" />
      </section>

      {/* 3. PREMIUM DIFFERENTIATION (MAGIC BENTO) */}
      <section className="py-12 bg-[#FFF0F3] relative overflow-hidden">
        {/* Background Aura */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -z-1" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] -z-1" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center mb-8">
            <span className="text-primary font-bold text-[8px] tracking-[0.4em] uppercase mb-2 block">Compassionate Care</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-serif italic">
              We Help You With
            </h2>
            <div className="w-10 h-1 bg-primary/20 mx-auto mt-3 rounded-full" />
          </AnimatedSection>

          <MagicBento />
        </div>

        <WavyDivider color="fill-gray-50/80" />
      </section>


    </div>
  );
};

export default About;
