import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Briefcase, BookOpen, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const OfferingCardContent = ({ offering }) => (
  <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden text-left">
    {/* Card Header with Gradient */}
    <div className={`flex items-center p-6 md:p-10 bg-gradient-to-br ${offering.color} border-b border-white/10 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center mr-4 md:mr-6 text-white shrink-0 border border-white/30 relative z-10">
        {offering.icon}
      </div>
      <h3 className="text-xl md:text-3xl font-black text-white tracking-tight relative z-10 drop-shadow-md">
        {offering.title}
      </h3>
    </div>

    {/* Card Content */}
    <div className="p-6 md:p-12">
      <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
        {/* WHAT WE PROVIDE */}
        <div className="bg-emerald-50/30 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-emerald-100/50">
          <h4 className="text-xs md:text-sm font-bold tracking-widest text-emerald-600 uppercase flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
            What we provide
          </h4>
          <ul className="space-y-3 md:space-y-4">
            {offering.what.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 md:gap-3 text-slate-700 text-sm md:text-lg leading-relaxed font-medium">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 mt-2 md:mt-2.5 shrink-0 opacity-60"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* WHAT WE DON'T PROVIDE */}
        <div className="bg-rose-50/30 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100/50">
          <h4 className="text-xs md:text-sm font-bold tracking-widest text-rose-500 uppercase flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <XCircle className="w-4 h-4 md:w-5 md:h-5" />
            What we don't provide
          </h4>
          <ul className="space-y-3 md:space-y-4">
            {offering.whatNot.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 md:gap-3 text-slate-500 italic text-sm md:text-lg leading-relaxed">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-rose-300 mt-2 md:mt-2.5 shrink-0 opacity-60"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const OfferingCard = ({ offering, index, total, progress }) => {
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - index) * 0.05]);
  const opacity = useTransform(progress, [index / total, (index + 0.5) / total], [1, 1]);

  return (
    <div
      className="sticky w-full flex items-start justify-center py-12"
      style={{ top: `${80 + index * 40}px` }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          zIndex: index + 1,
        }}
        className="w-full max-w-6xl origin-top"
      >
        <OfferingCardContent offering={offering} />
      </motion.div>
    </div>
  );
};

const GAP = 20;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

const CarouselItem = ({ item, index, itemWidth, trackItemOffset, x, transition }) => {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];

  // Curvy Arc Transforms
  const rotateY = useTransform(x, range, [45, 0, -45]);
  const y = useTransform(x, range, [20, 0, 20]); // Vertical arc
  const scale = useTransform(x, range, [0.9, 1, 0.9]); // Scale down on edges
  const opacity = useTransform(x, range, [0.5, 1, 0.5]); // Fade on edges

  return (
    <motion.div
      key={index}
      className="relative shrink-0 cursor-grab active:cursor-grabbing"
      style={{
        width: itemWidth,
        rotateY,
        y,
        scale,
        opacity,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      transition={transition}
    >
      <OfferingCardContent offering={item} />
    </motion.div>
  );
};

const OfferingCarousel = ({ items }) => {
  const [baseWidth, setBaseWidth] = React.useState(320);
  const [position, setPosition] = React.useState(0);
  const x = useMotionValue(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setBaseWidth(Math.min(window.innerWidth - 32, 500));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerPadding = 0;
  const itemWidth = baseWidth - containerPadding;
  const trackItemOffset = itemWidth + GAP;

  React.useEffect(() => {
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
    setPosition(Math.max(0, Math.min(next, items.length - 1)));
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

      {/* Pagination dots for carousel */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${position === index ? 'w-8 bg-purple-500' : 'w-2 bg-purple-200'
              }`}
            onClick={() => setPosition(index)}
          />
        ))}
      </div>
    </div>
  );
};

export const CorporateOfferings = () => {
  const container = useRef(null);

  const offerings = [
    {
      id: 0,
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Workplace Workshops',
      color: 'from-purple via-purple-light to-purple-soft',
      what: [
        'Facilitated conversations about stress and resilience',
        'Psycho-educational sessions on mental well-being',
        'Team discussions on healthy communication',
        'Workshops on work-life balance and boundaries'
      ],
      whatNot: [
        'Individual therapy or counseling',
        'Clinical assessments or diagnoses',
        'Crisis intervention services',
        'Guaranteed productivity improvements'
      ]
    },
    {
      id: 1,
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Institutional Psycho-Education',
      color: 'from-pink via-pink-light to-pink-soft',
      what: [
        'Educational sessions on mental health awareness',
        'Training for staff on supportive communication',
        'Workshops on creating inclusive environments',
        'Guidance on developing well-being policies'
      ],
      whatNot: [
        'Clinical training or certification',
        'Individual treatment recommendations',
        'Legal or policy compliance advice',
        'Replacement for professional mental health services'
      ]
    },
    {
      id: 2,
      icon: <Calendar className="w-6 h-6" />,
      title: 'Event-Based Sessions',
      color: 'from-primary via-purple to-secondary',
      what: [
        'Mindful conversation circles at conferences',
        'Well-being workshops at retreats',
        'Community discussions on mental health',
        'Educational presentations on psycho-education'
      ],
      whatNot: [
        'Entertainment or performance services',
        'Individual consultations during events',
        'Crisis support at events',
        'Medical or clinical presentations'
      ]
    }
  ];

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"]
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Stacking Cards Animation  */}
      <section className="relative bg-bg">
        {/* Premium Background Asset */}
        <div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/corporate-offerings-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        <div ref={container} className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-16 md:mb-24 relative">
            <span className="bg-gradient-to-r from-primary via-purple-light to-primary bg-clip-text text-transparent">
              What We Offer
            </span>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-secondary to-pink-400 rounded-full"></div>
          </h2>

          {/* Desktop Stacking Cards */}
          <div className="hidden md:block relative">
            {offerings.map((offering, index) => (
              <OfferingCard
                key={offering.id}
                offering={offering}
                index={index}
                total={offerings.length}
                progress={scrollYProgress}
              />
            ))}
            {/* Spacer to allow cards to stack and then scroll past */}
            <div className="h-[50vh]" />
          </div>

          {/* Mobile Carousel - Wrapped in clip to prevent 3D overflow without breaking sticky parent */}
          <div className="md:hidden overflow-x-clip -mx-4 px-4 py-8">
            <OfferingCarousel items={offerings} />
          </div>
        </div>
      </section>
    </div>
  );
};