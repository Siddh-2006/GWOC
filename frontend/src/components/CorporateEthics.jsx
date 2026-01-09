import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Shield, Lock, HandHeart, HeartHandshake } from 'lucide-react';

const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

const CarouselItem = ({ item, index, itemWidth, trackItemOffset, x, transition }) => {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];

  // Curvy Arc Transforms
  const rotateY = useTransform(x, range, [45, 0, -45]);
  const y = useTransform(x, range, [25, 0, 25]); // Vertical arc
  const scale = useTransform(x, range, [0.85, 1, 0.85]); // More pronounced scale for smaller cards
  const opacity = useTransform(x, range, [0.4, 1, 0.4]); // More pronounced fade

  return (
    <motion.div
      key={index}
      className="relative shrink-0 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-sm overflow-hidden cursor-grab active:cursor-grabbing p-8"
      style={{
        width: itemWidth,
        height: '340px',
        rotateY,
        y,
        scale,
        opacity,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      transition={transition}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-inner">
        {item.icon}
      </div>
      <h3 className="text-xl font-bold text-[#1a2b4b] mb-3">
        {item.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">
        {item.description}
      </p>
    </motion.div>
  );
};

const Carousel = ({ items }) => {
  const [baseWidth, setBaseWidth] = useState(320);

  useEffect(() => {
    const handleResize = () => {
      setBaseWidth(Math.min(window.innerWidth - 32, 400));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const [position, setPosition] = useState(0);
  const x = useMotionValue(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    x.set(-position * trackItemOffset);
  }, [position, trackItemOffset, x]);

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const DRAG_BUFFER = 50;
    const VELOCITY_THRESHOLD = 500;

    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    const next = position + direction;
    const max = items.length - 1;
    setPosition(Math.max(0, Math.min(next, max)));
  };

  return (
    <div className="relative overflow-visible mx-auto" style={{ width: `${baseWidth}px`, perspective: 3000, perspectiveOrigin: 'center center' }}>
      <motion.div
        className="flex"
        drag={isAnimating ? false : 'x'}
        dragConstraints={{
          left: -trackItemOffset * (items.length - 1),
          right: 0
        }}
        style={{
          gap: `${GAP}px`,
          transformStyle: 'preserve-3d',
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={SPRING_OPTIONS}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            item={item}
            index={index}
            itemWidth={itemWidth}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={SPRING_OPTIONS}
          />
        ))}
      </motion.div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full cursor-pointer transition-colors duration-150 ${position === index ? 'w-8 bg-primary' : 'w-2 bg-primary/20'
              }`}
            onClick={() => setPosition(index)}
            animate={{
              scale: position === index ? 1.1 : 1
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const CorporateEthics = () => {
  const ethicsPoints = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'No diagnosis',
      description: 'We provide education and facilitation, never clinical assessment or diagnosis.'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'No individual reporting',
      description: 'Individual participation remain confidential. No personal information is reported to organizations.'
    },
    {
      icon: <HandHeart className="w-8 h-8" />,
      title: 'No forced participation',
      description: 'All engagement is voluntary. Participants can choose their level of involvement.'
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: 'Respectful environment',
      description: 'We create safe, non-judgmental spaces where everyone can learn and share.'
    }
  ];

  return (
    <section className="py-4 md:px-8 max-w-7xl mx-auto overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 md:bg-none">
      <div className="md:bg-gradient-to-br md:from-purple-100 md:via-purple-50 md:to-pink-50 rounded-3xl p-6 md:p-16 md:my-16 text-center md:shadow-inner">
        <h2 className="text-3xl font-bold text-primary mb-8 relative inline-block">
          Ethics & Confidentiality
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-pink-200 to-pink-400 rounded-full"></div>
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Our approach is grounded in respect, confidentiality, and ethical practice.
        </p>

        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ethicsPoints.map((point, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-inner mx-auto md:mx-0">
                {point.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a2b4b] mb-3 text-center md:text-left">
                {point.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed text-center md:text-left">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <Carousel items={ethicsPoints} />
        </div>
      </div>
    </section>
  );
};