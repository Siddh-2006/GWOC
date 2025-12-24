import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const stages = [
  {
    id: '01',
    title: 'Introductory Discovery',
    description: 'A safe 60-minute space to understand your environment, concerns, and emotional patterns—without judgment or pressure. Together, we gently define your personal goals.',
    image: '/assets/how_it_works_1.png'
  },
  {
    id: '02',
    title: 'Guided Structure',
    description: 'Based on your needs, we design weekly or bi-weekly sessions focused on specific emotional themes. Each session has a clear direction while moving at your pace.',
    image: '/assets/how_it_works_2.png'
  },
  {
    id: '03',
    title: 'Progress Tracking',
    description: 'Regular check-ins and reflections help you notice growth, emotional shifts, and areas that need more care. Progress is measured gently—no rushing.',
    image: '/assets/how_it_works_3.png'
  },
  {
    id: '04',
    title: 'Sustained Well-being',
    description: 'We focus on equipping you with tools and emotional resilience that stay with you beyond sessions. The goal is long-term balance, not dependency.',
    image: '/assets/how_it_works_4.png'
  }
];

const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef([]);

  useEffect(() => {
    const observers = [];

    stages.forEach((_, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        {
          threshold: 0.5,
          rootMargin: "-20% 0px -20% 0px"
        }
      );

      if (scrollRef.current[index]) {
        observer.observe(scrollRef.current[index]);
      }
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section className="bg-bg py-32 px-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-secondary font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Our Methodology
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6">How It Works</h2>
          <p className="text-gray-500 text-xl max-w-2xl">A structured, gentle approach to your mental wellness journey.</p>
        </div>

        {/* Sticky Container */}
        <div className="relative flex flex-col md:flex-row gap-8 lg:gap-24">

          {/* Left Side: Scrolling Text Boxes */}
          <div className="w-full md:w-1/2 space-y-[20vh] pb-[5vh]">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                ref={el => scrollRef.current[index] = el}
                className={`p-10 md:p-14 rounded-[2.5rem] transition-all duration-700 bg-white shadow-sm border border-purple-50
                  ${activeIndex === index ? 'opacity-100 scale-100 border-secondary/20 shadow-xl' : 'opacity-40 scale-95'}`}
              >
                <span className="text-sm font-bold text-secondary mb-6 block tracking-widest">STAGE {stage.id}</span>
                <h3 className="text-3xl font-bold text-primary mb-6">{stage.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>

          {/* Right Side: Sticky Images */}
          <div className="hidden md:block w-1/2 sticky top-48 h-[350px] lg:h-[350px] self-start overflow-hidden rounded-[3rem] shadow-2xl border-8 border-white">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={stages[activeIndex].image}
                alt={stages[activeIndex].title}
                initial={{ opacity: 0, scale: 1.1, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
