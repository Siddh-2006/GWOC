import React from 'react';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Ethics Section
 * Explicit statements about confidentiality and ethical boundaries
 * Visually calm and prominent as required
 */
export const CorporateEthics = () => {
  const ethicsPoints = [
    {
      icon: '🔒',
      title: 'No diagnosis',
      description: 'We provide education and facilitation, never clinical assessment or diagnosis of any kind.'
    },
    {
      icon: '📋',
      title: 'No individual reporting',
      description: 'Individual participation and sharing remain confidential. No personal information is reported to organizations.'
    },
    {
      icon: '🤝',
      title: 'No forced participation',
      description: 'All engagement is voluntary. Participants can choose their level of involvement in discussions and activities.'
    },
    {
      icon: '🌿',
      title: 'Respectful environment',
      description: 'We create safe, non-judgmental spaces where everyone can learn and share at their own comfort level.'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.ethicsSection}>
        <h2 className={styles.ethicsTitle}>
          Ethics & Confidentiality
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b', 
          maxWidth: '600px', 
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          Our approach is grounded in respect, confidentiality, and ethical practice. 
          We believe in creating supportive environments while maintaining clear boundaries.
        </p>
        
        <div className={styles.ethicsGrid}>
          {ethicsPoints.map((point, index) => (
            <div key={index} className={styles.ethicsItem}>
              <div className={styles.ethicsIcon}>
                {point.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: '#1e293b', 
                marginBottom: '0.5rem' 
              }}>
                {point.title}
              </h3>
              <p className={styles.ethicsText}>
                {point.description}
              </p>
            </div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '3rem', 
          padding: '2rem', 
          background: 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <p style={{ 
            fontSize: '1rem', 
            color: '#475569', 
            margin: 0,
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            "We are facilitators and educators, not therapists or clinicians. 
            Our role is to create supportive learning environments, not to provide treatment or clinical services."
          </p>
        </div>
      </div>
    </section>
  );
};