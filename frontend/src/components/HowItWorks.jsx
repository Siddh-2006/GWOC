import { useState, useEffect, useRef } from 'react';
import { Leaf, Heart, Sun, CloudRain } from 'lucide-react';

const stages = [
  {
    id: 1,
    title: 'Introductory Discovery',
    subtitle: 'Understanding your emotional landscape',
    description: 'A safe 60-minute space to understand your environment, concerns, and emotional patterns—without judgment or pressure. Together, we gently define your personal goals.',
    icon: CloudRain,
    image: '/assets/how_it_works_1.png',
    color: 'bg-stone-300'
  },
  {
    id: 2,
    title: 'Guided Structure',
    subtitle: 'Building your personalized roadmap',
    description: 'Based on your needs, we design weekly or bi-weekly sessions focused on specific emotional themes. Each session has a clear direction while moving at your pace.',
    icon: Leaf,
    image: '/assets/how_it_works_2.png',
    color: 'bg-rose-200'
  },
  {
    id: 3,
    title: 'Progress Tracking',
    subtitle: 'Noticing growth and change',
    description: 'Regular check-ins and reflections help you notice growth, emotional shifts, and areas that need more care. Progress is measured gently—no rushing.',
    icon: Heart,
    image: '/assets/how_it_works_3.png',
    color: 'bg-rose-300'
  },
  {
    id: 4,
    title: 'Sustained Well-being',
    subtitle: 'Evolving into your best self',
    description: 'We focus on equipping you with tools and emotional resilience that stay with you beyond sessions. The goal is long-term balance, not dependency.',
    icon: Sun,
    image: '/assets/how_it_works_4.png',
    color: 'bg-rose-400'
  }
];

const Particle = ({ delay, left }) => (
  <div
    className="absolute bottom-0 w-3 h-3 rounded-full bg-rose-200/40 backdrop-blur-sm pointer-events-none"
    style={{
      left: `${left}%`,
      animation: "drift 8s linear infinite",
      animationDelay: `${delay}s`,
    }}
  />
);

const HowItWorks = () => {
  const containerRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;

      const scrollableDistance = elementHeight - windowHeight;
      const scrolled = -rect.top;

      let newProgress = scrolled / scrollableDistance;
      newProgress = Math.max(0, Math.min(1, newProgress));

      setProgress(newProgress);

      const stageIndex = Math.min(
        stages.length - 1,
        Math.floor(newProgress * stages.length)
      );

      setActiveStage(stageIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-rose-50">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row">

        {/* Background Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <Particle key={i} delay={i * 1.5} left={Math.random() * 100} />
          ))}
        </div>

        {/* LEFT CONTENT */}
        <div className="relative z-10 w-full md:w-1/2 h-full flex flex-col px-6 md:px-16 lg:px-24">

          {/* Header */}
          <div className="absolute top-8 md:top-16 left-6 md:left-16 lg:left-24 z-20 max-w-xl pr-4">
            <h1 className="font-serif text-3xl md:text-5xl text-stone-800 mb-4 leading-tight">
              How It <br />
              <span className="italic text-rose-500">Works</span>
            </h1>
            <p className="text-base md:text-lg text-stone-600">
              A structured, gentle approach to your mental wellness journey.
            </p>
          </div>

          {/* Progress Line */}
          <div className="absolute left-6 md:left-12 top-[55%] -translate-y-1/2 h-[45%] w-0.5 bg-rose-100 rounded-full hidden md:block">
            <div
              className="absolute top-0 left-0 w-full bg-rose-400 rounded-full transition-all duration-300"
              style={{ height: `${progress * 100}%` }}
            />
            {stages.map((_, idx) => (
              <div
                key={idx}
                className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
                  idx <= activeStage
                    ? 'bg-rose-500 border-rose-500'
                    : 'bg-rose-50 border-rose-200'
                }`}
                style={{
                  top: `${(idx / (stages.length - 1)) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Stage Content */}
          <div className="relative h-full flex flex-col justify-center md:pl-12">
            {stages.map((stage, index) => {
              const isActive = index === activeStage;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`absolute w-full md:w-[90%] top-[55%] -translate-y-1/2 transition-all duration-1200 ${
                    isActive
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 blur-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-600">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-bold tracking-widest text-rose-400 uppercase">
                      Step 0{stage.id}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl text-stone-800 mb-4">
                    {stage.title}
                  </h2>

                  <h3 className="text-xl md:text-2xl text-rose-500 italic mb-6">
                    {stage.subtitle}
                  </h3>

                  <p className="text-lg text-stone-600 max-w-md">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT IMAGES */}
        <div className="relative z-10 w-full md:w-1/2 h-[40vh] md:h-full bg-rose-50/50">
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-rose-50 via-transparent to-transparent" />

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-6 md:p-12">
            {stages.map((stage, index) => {
              const isActive = index === activeStage;

              return (
                <div
                  key={stage.id}
                  className={`absolute inset-0 md:inset-12 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-1500 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                  }`}
                >
                  <img
                    src={stage.image}
                    alt={stage.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-rose-900/10" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;