import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

const processSteps = [
  {
    number: '01',
    title: 'Reach out',
    description:
      "Share your organization's context, goals, and what you hope to explore together. We listen carefully to understand your unique needs.",
    color: 'from-purple via-purple-light to-purple-soft'
  },
  {
    number: '02',
    title: 'Context understanding',
    description:
      "We have a thoughtful conversation about your community, existing support structures, and what kind of engagement would be most meaningful.",
    color: 'from-pink via-pink-light to-pink-soft'
  },
  {
    number: '03',
    title: 'Session design',
    description:
      "Together, we design an approach that fits your setting, timeline, and participants. Every engagement is tailored to your specific context.",
    color: 'from-primary via-purple to-secondary'
  },
  {
    number: '04',
    title: 'Human-led delivery',
    description:
      "Our facilitators create safe, respectful spaces for learning and conversation. All sessions are interactive and grounded in ethical practice.",
    color: 'from-secondary via-pink-light to-accent'
  },
  {
    number: '05',
    title: 'Optional follow-up',
    description:
      "If helpful, we can provide resources for continued learning or discuss how to maintain the supportive environment you've begun to create.",
    color: 'from-purple-light via-pink-soft to-purple-soft'
  }
];

export const CorporateProcess = () => {
  return (
    <section className="py-12 bg-bg overflow-hidden relative">
      {/* Premium Background Asset */}
      <div
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/corporate-process-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      <div className="max-w-6xl mx-auto px-6 relative z-20">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-8 tracking-tight"
          >
            <span className="bg-gradient-to-r from-primary via-purple-light to-primary bg-clip-text text-transparent">
              How Engagement Works
            </span>
          </motion.h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-secondary to-pink-400 mx-auto rounded-full"></div>
        </div>

        <Swiper
          modules={[EffectCoverflow, Mousewheel, Navigation]}
          effect="coverflow"
          grabCursor
          centeredSlides={true}
          slidesPerView="auto"
          loop={false}
          slideToClickedSlide={true}
          initialSlide={0}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
          }}
          className="!py-4 !overflow-visible"
        >
          {processSteps.map((step, i) => (
            <SwiperSlide
              key={i}
              className="!w-[260px] md:!w-[340px] transition-all duration-500 [&.swiper-slide-active]:scale-110"
            >
              <div className="bg-white shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-purple-50 rounded-[2.5rem] overflow-hidden h-[380px] flex flex-col transform-gpu transition-all duration-500 relative">
                {/* Clean Floating Step Badge */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center z-20 shadow-sm">
                  <span className="text-white text-xs font-bold">{step.number}</span>
                </div>

                {/* TOP HEADER */}
                <div className={`bg-gradient-to-br ${step.color} h-[150px] flex flex-col items-center justify-center px-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                  <h3 className="text-white text-2xl md:text-3xl font-black text-center leading-tight relative z-10 drop-shadow-md">
                    {step.title}
                  </h3>
                </div>

                {/* CONTENT LAYER */}
                <div className="flex-1 p-8 flex flex-col bg-white relative">
                  <p className="text-primary/70 text-sm md:text-base leading-relaxed font-medium italic">
                    {step.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
