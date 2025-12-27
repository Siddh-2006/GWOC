import React from 'react';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Intro Section
 * Calm headline with mountain/river continuation theme
 * Sets the tone for human-centered, ethical approach
 */
export const CorporateIntro = () => {
  return (
    <section className={styles.introSection}>
      <div className={styles.introBackground}></div>
      <div className={styles.introContent}>
        <h1 className={styles.introHeadline}>
          Nurturing well-being in shared spaces
        </h1>
        <p className={styles.introText}>
          Mental well-being flourishes when we create supportive environments together. 
          We partner with organizations, institutions, and communities to foster 
          understanding, connection, and growth through thoughtful, human-led conversations.
        </p>
      </div>
    </section>
  );
};