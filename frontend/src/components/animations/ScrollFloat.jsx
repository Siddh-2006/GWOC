import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'power3.out',
  scrollStart = 'top 130%',
  scrollEnd = 'top 50%',
  stagger = 0.05
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    // Split into words to keep them together, then wrap each word's characters
    return text.split(' ').map((word, i) => (
      <span key={i} className="inline-block whitespace-nowrap mr-[0.2em]">
        {word.split('').map((char, j) => (
          <span className="inline-block char will-change-transform" key={j}>
            {char}
          </span>
        ))}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const charElements = el.querySelectorAll('.char');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: scrollStart,
        end: scrollEnd,
        scrub: 1,
        // markers: true, // debug
      }
    });

    tl.fromTo(
      charElements,
      {
        opacity: 0,
        y: 40,
        rotateX: -45,
        scale: 0.8,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: animationDuration,
        ease: ease,
        stagger: stagger,
      }
    );

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <div ref={containerRef} className={`${containerClassName}`}>
      <span className={`inline-block ${textClassName}`}>{splitText}</span>
    </div>
  );
};

export default ScrollFloat;
