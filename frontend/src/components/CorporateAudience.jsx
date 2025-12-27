import React, { useEffect, useRef } from 'react';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Audience Section
 * Three cards showing who this is for
 * Subtle scroll animations with intersection observer
 */
export const CorporateAudience = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe title
    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    // Observe cards with staggered delay
    cardsRef.current.forEach((card, index) => {
      if (card) {
        setTimeout(() => {
          observer.observe(card);
        }, index * 200);
      }
    });

    return () => observer.disconnect();
  }, []);

  const audiences = [
    {
      icon: '🏢',
      title: 'Organizations',
      description: 'Workplaces seeking to create supportive environments where teams can explore well-being, stress management, and healthy communication patterns together.'
    },
    {
      icon: '🎓',
      title: 'Institutions',
      description: 'Educational institutions, healthcare systems, and community centers looking to integrate psycho-educational approaches into their existing support structures.'
    },
    {
      icon: '🌱',
      title: 'Events & Communities',
      description: 'Conferences, retreats, and community gatherings wanting to include meaningful conversations about mental well-being as part of their programming.'
    }
  ];

  return (
    <section className={styles.section} ref={sectionRef}>
      <h2 
        className={styles.sectionTitle} 
        ref={titleRef}
      >
        Who we work with
      </h2>
      
      <div className={styles.audienceGrid}>
        {audiences.map((audience, index) => (
          <div
            key={index}
            className={styles.audienceCard}
            ref={(el) => cardsRef.current[index] = el}
          >
            <div className={styles.audienceIcon}>
              {audience.icon}
            </div>
            <h3 className={styles.audienceTitle}>
              {audience.title}
            </h3>
            <p className={styles.audienceDescription}>
              {audience.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};