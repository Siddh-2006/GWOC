import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const JourneyScene = ({ scrollProgress }) => {
  const canvasRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    // This component will handle the visual "Game World"
    // The path animation will be driven by the parent's scroll or a local ScrollTrigger

    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();

      // Reset path to be hidden
      gsap.set(pathRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
        visibility: 'visible'
      });

      // Animate path drawing based on visual progress
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#journey-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        }
      });
    }

  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      {/* Background Layers (Parallax) */}
      <div id="layer-clouds" className="absolute inset-0 bg-[url('/assets/journey_clouds.png')] bg-cover opacity-20" />

      {/* Dynamic Path SVG */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M 50,0 Q 400,300 50,600 T 50,1200" // Simple S-curve placeholder, needs to be dynamic or responsive
          fill="none"
          stroke="#cbd5e1" // Slate-300
          strokeWidth="4"
          visibility="hidden"
          className="drop-shadow-lg"
        />
      </svg>
    </div>
  );
};

export default JourneyScene;
