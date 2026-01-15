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
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
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

  return (
    <div className="min-h-screen bg-white selection:bg-primary/10 selection:text-primary overflow-x-hidden">

      {/* 1. CINEMATIC HERO */}
      <section className="relative bg-bg overflow-hidden py-28 border-b border-gray-50">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-pink-100/25 rounded-full blur-[120px] -mr-44 -mt-44" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-purple-100/25 rounded-full blur-[120px] -ml-44 -mb-44" />

        <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-20 relative z-10">
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-1/2 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-[2px] bg-pink-500" />
              <span className="text-secondary font-semibold tracking-[0.35em] uppercase text-xs">
                About MindSettler
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary"
            >
              Understanding is the first form of care<br />
              {/* <span className="text-secondary">you with</span> */}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="text-lg md:text-xl text-primary/80 leading-relaxed max-w-xl border-l border-primary/20 pl-6"
            >
              Healing happens in circles, not lines. We provide the map to return to old places with new eyes, honoring the landscape of your internal world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <button
                onClick={() => window.location.href = '/booking'}
                className="px-9 py-4 bg-secondary text-white font-bold rounded-2xl shadow-xl shadow-pink-100 hover:bg-primary transition-all flex items-center gap-4 group text-[10px] tracking-[0.3em] uppercase"
              >
                START YOUR JOURNEY
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Stack Animation */}
          <div className="w-full lg:w-1/2 flex justify-center items-end h-[600px] pb-20 overflow-visible relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex justify-center items-end w-full h-full overflow-visible"
            >
              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={true}
                cards={[
                  // Approach Card
                  <div key="appr" className="relative w-[420px] h-[460px] border-none shadow-2xl rounded-[3rem] bg-white overflow-visible">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50">
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 shadow-xl rounded-full border border-gray-800 whitespace-nowrap">
                        <Sparkles size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">Our Approach</span>
                      </div>
                    </div>
                    <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-gray-100">
                      <img
                        src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format"
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                        alt="Approach"
                      />
                      <div className="relative z-10 w-full h-full p-14 flex flex-col justify-center text-center">
                        <div className="mx-auto w-12 h-12 bg-indigo-400/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-indigo-400/10">
                          <Quote size={24} />
                        </div>
                        <h4 className="text-lg md:text-xl font-bold mb-4 tracking-tight text-gray-900 leading-tight">A unique methodology rooted in clinical depth and human heart.</h4>
                        <div className="space-y-2 text-[12px] text-gray-600 leading-relaxed font-medium px-4">
                          <p>Guide individuals toward informed, human support while normalizing the process of seeking guidance.</p>
                          <p>Provide safe, confidential pathways to sessions that honor each person's unique journey.</p>
                          <p>We walk alongside, we don't push forward.</p>
                        </div>
                      </div>
                    </div>
                  </div>,
                  // Mission Card
                  <div key="miss" className="relative w-[420px] h-[460px] border-none shadow-2xl rounded-[3rem] bg-white overflow-visible">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50">
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 shadow-xl rounded-full border border-gray-800 whitespace-nowrap">
                        <Target size={10} className="text-primary" />
                        <span className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">Our Mission</span>
                      </div>
                    </div>
                    <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-gray-100">
                      <img
                        src="/assets/mountain2.jpg"
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                        alt="Mission"
                      />
                      <div className="relative z-10 w-full h-full p-14 flex flex-col justify-center text-center">
                        <div className="mx-auto w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary mb-8 border border-secondary/10">
                          <Quote size={24} />
                        </div>
                        <h4 className="text-lg md:text-xl font-bold mb-4 tracking-tight text-gray-900 leading-tight">Accessible excellence for every inner world.</h4>
                        <div className="space-y-2 text-[12px] text-gray-600 leading-relaxed font-medium px-4">
                          <p>To make mental health understanding less intimidating.</p>
                          <p>To create space for reflection without pressure, prioritizing clarity over urgency.</p>
                          <p>Understanding comes first.</p>
                        </div>
                      </div>
                    </div>
                  </div>,
                  // Philosophy Card
                  <div key="phil" className="relative w-[420px] h-[460px] border-none shadow-2xl rounded-[3rem] bg-white overflow-visible">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50">
                      <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 shadow-xl rounded-full border border-gray-800 whitespace-nowrap">
                        <Quote size={10} className="text-secondary" />
                        <span className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">Our Philosophy</span>
                      </div>
                    </div>
                    <div className="relative w-full h-full rounded-[3rem] overflow-hidden border border-gray-100">
                      <img
                        src="/assets/river1.jpg"
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                        alt="Philosophy"
                      />
                      <div className="relative z-10 w-full h-full p-14 flex flex-col justify-center text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/10">
                          <Quote size={24} />
                        </div>
                        <h4 className="text-lg md:text-xl font-bold mb-6 tracking-tight text-gray-900 leading-tight">Our Philosophy of Care</h4>
                        <div className="space-y-2 text-[12px] text-gray-600 leading-relaxed font-medium">
                          <p>Psycho-education: Not diagnosis</p>
                          <p>Understanding: Not fixing</p>
                          <p>Reflection: Not reaction</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ]}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. WHAT MINDSETTLER IS (Video & Ethos) */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Video Player */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-[3/4] max-w-xs mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-50 group"
            >
              <video
                src="/assets/pranika1.mp4"
                controls
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-[2.5rem]" />
            </motion.div>

            {/* Right: Ethos Content */}
            <AnimatedSection>
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.4em]">The Core Vision</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-primary leading-[1.1] mb-8 font-serif">
                  What Is <br />
                  <span className="text-primary italic">MindSettler?</span>
                </h2>

                <p className="text-base text-gray-600 leading-relaxed font-medium">
                  MindSettler is a psycho-education and mental well-being platform that focuses on understanding before action.

                  We support awareness and human-led guidance through both online and offline sessions, creating space for reflection without pressure.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  {/* <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100"> */}
                  {/* <div className="text-primary font-bold text-xl mb-1">98%</div> */}
                  {/* <div className="text-[8px] uppercase tracking-[0.3em] text-gray-400 font-bold">Client Comfort</div> */}
                  {/* </div> */}
                  {/* <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100"> */}
                  {/* <div className="text-secondary font-bold text-xl mb-1">Human</div> */}
                  {/* <div className="text-[8px] uppercase tracking-[0.3em] text-gray-400 font-bold">Led Approach</div> */}
                  {/* </div> */}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
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

      {/* 3. IS / IS NOT SECTION (Aura Immersive) */}
      <section className="py-32 bg-gradient-to-br from-pink-50 via-white to-gray-100 overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] opacity-40" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[160px] opacity-30" />
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-12 rounded-[3rem] bg-indigo-50/50 backdrop-blur-2xl border border-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 text-green-500/5 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle2 size={140} />
              </div>
              <h3 className="text-2xl font-bold mb-10 flex items-center gap-5 text-green-600">
                <CheckCircle2 size={32} /> MindSettler Is
              </h3>
              <ul className="space-y-6 relative z-10">
                {[
                  "A psycho-education space",
                  "A guided well-being platform",
                  "A human-led support system"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-5 text-[17px] font-bold text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.4)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-12 rounded-[3rem] bg-gray-50/50 backdrop-blur-2xl border border-gray-100 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 text-gray-200/5 group-hover:scale-110 transition-transform duration-700">
                <AlertCircle size={140} />
              </div>
              <h3 className="text-2xl font-bold mb-10 flex items-center gap-5 text-gray-400">
                <AlertCircle size={32} /> MindSettler Is Not
              </h3>
              <ul className="space-y-6 relative z-10">
                {[
                  "An emergency service",
                  "An AI therapy tool",
                  "An instant solution platform"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-5 text-[17px] font-bold text-gray-400">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
        <WavyDivider color="fill-gray-50/80" />
      </section>

      {/* 4. MEET THE FOUNDER (Interactive Display) */}
      <section className="py-32 px-6 relative bg-gray-50/80 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Founder Content */}
            <AnimatedSection>
              <div className="space-y-10">
                <div>
                  <span className="text-primary font-bold text-[8px] uppercase tracking-[0.4em] mb-4 block underline decoration-primary/20 underline-offset-8">Voices of Vision</span>

                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-[1.1] mb-8 font-serif">
                    Parnika's <br />
                    <span className="text-secondary italic">Story</span>
                  </h2>
                </div>
                <div className="space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium max-w-lg">
                    MindSettler was born from observation, not crisis. Parnika recognized the lack of safe spaces for reflection and the need for calm, human-centered mental health support.
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium max-w-lg">
                    The intention was always to create a platform built with care, not speed—a place where understanding unfolds naturally.
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed font-medium max-w-lg italic">
                    MindSettler was built with care, not speed.
                  </p>
                </div>

                <div className="grid gap-8">
                  {[
                    { icon: Eye, title: "Master of Arts", detail: "Counseling Psychology, GGU (2022)", color: "primary" },
                    { icon: Sparkles, title: "Human-Led", detail: "Rooted in clinical research & radical empathy.", color: "secondary" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex gap-8 items-center p-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-indigo-100/30 group hover:border-primary/20 transition-all duration-500"
                    >
                      <div className={`w-14 h-14 bg-${item.color}/10 rounded-2xl flex items-center justify-center text-${item.color} group-hover:bg-${item.color} group-hover:text-white transition-all duration-500`}>
                        <item.icon size={26} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-widest">{item.title}</h4>
                        <p className="text-sm text-gray-500 font-medium">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Founder Image Stack */}
            <div className="relative h-[500px] w-full max-w-[440px] mx-auto hidden lg:block">
              <CardSwap
                width={440}
                height={500}
                cardDistance={20}
                verticalDistance={30}
                delay={6000}
              >
                {/* PORTRAIT CARD (FRONT) */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white">
                  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-[10px] border-white/60">
                    <img src="/assets/pranika.jpg" className="w-full h-full object-cover" alt="Founder" />
                    <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-0 right-0 text-center text-white px-8">
                      <h3 className="text-2xl font-bold tracking-tight mb-1">Parnika Bajaj</h3>
                      <p className="text-[9px] uppercase tracking-[0.3em] opacity-90 font-bold">Counseling Psychologist</p>
                    </div>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
        <WavyDivider top color="fill-gray-50/80" />
      </section>

      {/* 5. FINAL CTA (Soft & Emotional) */}
      <section className="py-48 px-6 relative bg-aurora-light overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format" className="absolute inset-0 w-full h-full object-cover opacity-[0.05] grayscale" alt="Relaxation" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <motion.div
              variants={float}
              animate="animate"
              className="inline-flex items-center justify-center w-20 h-20 bg-white/80 backdrop-blur-xl rounded-full mb-12 shadow-2xl border border-white/50"
            >
              <Heart size={36} className="text-primary" fill="currentColor" />
            </motion.div>

            <ScrollFloat
              containerClassName="mb-16"
              textClassName="text-3xl md:text-4xl font-serif italic text-gray-900 leading-[1.3] tracking-tight"
              scrollStart="top 110%"
              scrollEnd="top 30%"
            >
              Understanding unfolds differently for everyone. Take your time.
            </ScrollFloat>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/booking'}
                className="px-14 py-5 bg-linear-to-r from-primary to-secondary text-white font-black rounded-[2rem] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:opacity-90 transition-all font-title uppercase tracking-widest text-[11px]"
              >
                Book Your First Session
              </motion.button>
              <div className="text-left border-l-2 border-gray-200 pl-6 py-1">
                <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase leading-relaxed mb-1">Status</p>
                <p className="text-xs text-gray-900 font-bold uppercase tracking-tight">Spaces Available</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default About;