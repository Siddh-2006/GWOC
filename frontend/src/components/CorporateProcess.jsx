import React, { useEffect, useRef } from 'react';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Process Section
 * Step-by-step explanation of engagement process
 * Vertical scroll storytelling approach
 */
export const CorporateProcess = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    stepsRef.current.forEach((step, index) => {
      if (step) {
        setTimeout(() => {
          observer.observe(step);
        }, index * 200);
      }
    });

    return () => observer.disconnect();
  }, []);

  const processSteps = [
    {
      number: 1,
      title: 'Reach out',
      description: 'Share your organization\'s context, goals, and what you hope to explore together. We listen carefully to understand your unique needs and environment.'
    },
    {
      number: 2,
      title: 'Context understanding',
      description: 'We have a thoughtful conversation about your community, existing support structures, and what kind of engagement would be most meaningful.'
    },
    {
      number: 3,
      title: 'Session design',
      description: 'Together, we design an approach that fits your setting, timeline, and participants. Every engagement is tailored to your specific context and needs.'
    },
    {
      number: 4,
      title: 'Human-led delivery',
      description: 'Our facilitators create safe, respectful spaces for learning and conversation. All sessions are interactive, educational, and grounded in ethical practice.'
    },
    {
      number: 5,
      title: 'Optional follow-up',
      description: 'If helpful, we can provide resources for continued learning or discuss how to maintain the supportive environment you\'ve begun to create.'
    }
  ];

  return (
    <section className={styles.section} ref={sectionRef}>
      <h2 
        className={styles.sectionTitle} 
        ref={titleRef}
      >
        How engagement works
      </h2>
      
      <div className={styles.processSteps}>
        {processSteps.map((step, index) => (
          <div
            key={index}
            className={styles.processStep}
            ref={(el) => stepsRef.current[index] = el}
          >
            <div className={styles.stepNumber}>
              {step.number}
            </div>
            <div className={styles.stepContent}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};