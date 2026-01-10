import { useState, useEffect, useRef, useMemo } from 'react';
import { Leaf, Heart, Sun, CloudRain } from 'lucide-react';

const stages = [
  {
    id: 1,
    title: 'Introductory Discovery',
    subtitle: 'Understanding your emotional landscape',
    description:
      'A safe 60-minute space to understand your environment, concerns, and emotional patterns—without judgment or pressure.',
    icon: CloudRain,
    image: '/assets/how_it_works_1.png',
  },
  {
    id: 2,
    title: 'Guided Structure',
    subtitle: 'Building your personalized roadmap',
    description:
      'Based on your needs, we design weekly or bi-weekly sessions focused on specific emotional themes.',
    icon: Leaf,
    image: '/assets/how_it_works_2.png',
  },
  {
    id: 3,
    title: 'Progress Tracking',
    subtitle: 'Noticing growth and change',
    description:
      'Regular check-ins and reflections help you notice growth and emotional shifts.',
    icon: Heart,
    image: '/assets/how_it_works_3.png',
  },
  {
    id: 4,
    title: 'Sustained Well-being',
    subtitle: 'Evolving into your best self',
    description:
      'We focus on tools and emotional resilience that stay with you beyond sessions.',
    icon: Sun,
    image: '/assets/how_it_works_4.png',
  },
];

const Particle = ({ delay, left }) => (
  <div
    className="absolute bottom-0 w-2 h-2 rounded-full bg-rose-200/40 pointer-events-none"
    style={{
      left: `${left}%`,
      animation: `drift 10s linear infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

const HowItWorks = () => {
  const containerRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);

  const particles = useMemo(
    () =>
      [...Array(12)].map((_, i) => (
        <Particle key={i} delay={i * 1.3} left={Math.random() * 100} />
      )),
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const scrollable = Math.max(1, rect.height - windowHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

      const index = Math.min(
        stages.length - 1,
        Math.floor(progress * stages.length)
      );

      setActiveStage(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[300vh] md:min-h-[400vh] bg-rose-50"
    >
      <style>{`
        @keyframes drift {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
      `}</style>

      <div className="sticky top-0 h-screen flex flex-col md:flex-row overflow-hidden">

        {/* Background particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {particles}
        </div>

        {/* IMAGE — TOP on mobile, RIGHT on desktop */}
        <div className="relative z-10 w-full md:w-1/2 h-[45vh] md:h-full order-1 md:order-2">
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-rose-50 via-transparent to-transparent" />
          {stages.map((stage, index) => (
            <img
              key={stage.id}
              src={stage.image}
              alt={stage.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                index === activeStage
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-110'
              }`}
            />
          ))}
        </div>

        {/* TEXT — BELOW image on mobile, LEFT on desktop */}
        <div className="relative z-20 w-full md:w-1/2 flex flex-col justify-start md:justify-center px-4 sm:px-6 md:px-16 py-8 md:py-0 order-2 md:order-1">

          {/* Heading */}
          <header className="mb-8 max-w-md md:max-w-xl">
            <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-stone-800 leading-tight">
              How It <span className="italic text-rose-500">Works</span>
            </h1>
            <p className="mt-3 text-stone-600 text-base md:text-lg">
              A gentle, structured path toward emotional well-being.
            </p>
          </header>

          {/* Stage Cards */}
          <div className="relative min-h-[320px]">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const active = index === activeStage;

              return (
                <div
                  key={stage.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    active
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-6 pointer-events-none'
                  }`}
                >
                  <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl max-w-md md:max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-100 text-rose-500">
                        <Icon size={20} />
                      </div>
                      <span className="text-xs tracking-widest font-bold text-rose-400">
                        STEP 0{stage.id}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-stone-800 mb-2">
                      {stage.title}
                    </h2>
                    <h3 className="text-lg italic text-rose-500 mb-4">
                      {stage.subtitle}
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
