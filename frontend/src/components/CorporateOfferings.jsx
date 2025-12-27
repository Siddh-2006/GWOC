import React, { useEffect, useRef } from 'react';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Offerings Section
 * What we offer vs what we don't offer
 * Clear ethical boundaries and expectations
 */
export const CorporateOfferings = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const offeringsRef = useRef([]);

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

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    offeringsRef.current.forEach((offering, index) => {
      if (offering) {
        setTimeout(() => {
          observer.observe(offering);
        }, index * 300);
      }
    });

    return () => observer.disconnect();
  }, []);

  const offerings = [
    {
      icon: '💼',
      title: 'Workplace Workshops',
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
      icon: '📚',
      title: 'Institutional Psycho-Education',
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
      icon: '🌟',
      title: 'Event-Based Sessions',
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

  return (
    <section className={styles.section} ref={sectionRef}>
      <h2 
        className={styles.sectionTitle} 
        ref={titleRef}
      >
        What we offer
      </h2>
      
      <div className={styles.offeringsGrid}>
        {offerings.map((offering, index) => (
          <div
            key={index}
            className={styles.offeringItem}
            ref={(el) => offeringsRef.current[index] = el}
          >
            <div className={styles.offeringHeader}>
              <div className={styles.offeringIcon}>
                {offering.icon}
              </div>
              <h3 className={styles.offeringTitle}>
                {offering.title}
              </h3>
            </div>
            
            <div className={styles.offeringContent}>
              <div className={styles.offeringWhat}>
                <h4 className={styles.offeringSubtitle}>What we provide</h4>
                <ul>
                  {offering.what.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.offeringNot}>
                <h4 className={styles.offeringSubtitle}>What we don't provide</h4>
                <ul>
                  {offering.whatNot.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};