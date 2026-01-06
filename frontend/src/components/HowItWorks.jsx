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
          threshold: 0.6, // Increased threshold for better centering focus
          rootMargin: "-10% 0px -10% 0px"
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
    <section
      className="relative py-32 px-6 bg-stone-50"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-32 text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-stone-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block"
          >
            Our Methodology
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6">How It Works</h2>
          <p className="text-stone-600 text-xl max-w-2xl font-light leading-relaxed">A structured, gentle approach to your mental wellness journey.</p>
        </div>

        {/* Sticky Container */}
        <div className="relative flex flex-col md:flex-row gap-12 lg:gap-24">

          {/* Left Side: Scrolling Text Boxes */}
          <div className="w-full md:w-1/2 space-y-[40vh] pb-[10vh]">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                ref={el => scrollRef.current[index] = el}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: activeIndex === index ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
                className={`p-10 md:p-14 rounded-[2rem] transition-all duration-500 border
                  ${activeIndex === index
                    ? 'bg-white border-stone-200 shadow-2xl scale-100'
                    : 'bg-transparent border-transparent scale-95 grayscale'}`}
              >
                <span className={`text-sm font-bold mb-6 block tracking-widest ${activeIndex === index ? 'text-stone-500' : 'text-stone-300'}`}>STAGE {stage.id}</span>
                <h3 className={`text-3xl md:text-4xl font-serif mb-6 ${activeIndex === index ? 'text-stone-800' : 'text-stone-300'}`}>{stage.title}</h3>
                <p className={`text-lg leading-relaxed ${activeIndex === index ? 'text-stone-600' : 'text-stone-300'}`}>{stage.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Right Side: Sticky Images */}
          <div className="hidden md:block w-1/2 sticky top-48 h-[500px] self-start">
            <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  src={stages[activeIndex].image}
                  alt={stages[activeIndex].title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
