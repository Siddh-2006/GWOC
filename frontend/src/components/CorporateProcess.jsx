import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import { motion, useScroll, useTransform } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

const processSteps = [
  {
    number: '01',
    title: 'Reach out',
    description:
      "Share your organization's context, goals, and what you hope to explore together. We listen carefully to understand your unique needs.",
    color: 'bg-[#0095ff]'
  },
  {
    number: '02',
    title: 'Context understanding',
    description:
      "We have a thoughtful conversation about your community, existing support structures, and what kind of engagement would be most meaningful.",
    color: 'bg-[#ff206e]'
  },
  {
    number: '03',
    title: 'Session design',
    description:
      "Together, we design an approach that fits your setting, timeline, and participants. Every engagement is tailored to your specific context.",
    color: 'bg-[#b0d911]'
  },
  {
    number: '04',
    title: 'Human-led delivery',
    description:
      "Our facilitators create safe, respectful spaces for learning and conversation. All sessions are interactive and grounded in ethical practice.",
    color: 'bg-[#ff9500]'
  },
  {
    number: '05',
    title: 'Optional follow-up',
    description:
      "If helpful, we can provide resources for continued learning or discuss how to maintain the supportive environment you've begun to create.",
    color: 'bg-[#8a2be2]'
  }
];

export const CorporateProcess = () => {
  return (
    <section className="py-24 bg-bg overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-6 relative z-20">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-primary mb-8 tracking-tight"
          >
            How Engagement Works
          </motion.h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-secondary to-pink-400 mx-auto rounded-full"></div>
        </div>

        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          grabCursor
          centeredSlides={true}
          slidesPerView="auto"
          loop={false}
          slideToClickedSlide={true}
          initialSlide={0}
          coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
          }}
          className="!py-16"
        >
          {processSteps.map((step, i) => (
            <SwiperSlide
              key={i}
              className="!w-[260px] md:!w-[340px] transition-all duration-500 [&.swiper-slide-active]:scale-110"
            >
              <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-purple-50 rounded-[2.5rem] overflow-hidden h-[440px] flex flex-col transform-gpu transition-all duration-500 relative">
                {/* Clean Floating Step Badge */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center z-20 shadow-sm">
                  <span className="text-white text-xs font-bold">{step.number}</span>
                </div>

                {/* TOP VIBRANT HEADER */}
                <div className={`${step.color} h-[160px] flex flex-col items-center justify-center px-8 relative overflow-hidden`}>
                  <h3 className="text-white text-2xl md:text-3xl font-black text-center leading-tight relative z-10 drop-shadow-sm">
                    {step.title}
                  </h3>
                </div>

                {/* CONTENT LAYER */}
                <div className="flex-1 p-8 flex flex-col justify-between bg-white relative">
                  <p className="text-primary/70 text-sm md:text-base leading-relaxed font-medium italic">
                    {step.description}
                  </p>

                  <button className="group flex items-center gap-3 border-2 border-primary/20 px-6 py-3 text-xs md:text-sm font-bold text-primary hover:border-secondary hover:text-secondary transition-all duration-300 self-start mt-4 rounded-xl uppercase tracking-widest opacity-40 [.swiper-slide-active_&]:opacity-100 [.swiper-slide-active_&]:scale-105">
                    Read More
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-secondary transition-colors"></span>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
