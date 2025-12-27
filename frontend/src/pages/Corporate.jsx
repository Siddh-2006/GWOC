import React from 'react';
import { CorporateIntro } from '../components/CorporateIntro';
import { CorporateAudience } from '../components/CorporateAudience';
import { CorporateOfferings } from '../components/CorporateOfferings';
import { CorporateProcess } from '../components/CorporateProcess';
import { CorporateEthics } from '../components/CorporateEthics';
import { CorporateForm } from '../components/CorporateForm';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Services Page
 * Calm, journey-driven design aligned with existing MindSettler philosophy
 * Human-centered approach to organizational mental well-being
 */
export const Corporate = () => {
  return (
    <div className={styles.corporatePage}>
      {/* Intro - Calm headline with mountain/river continuation */}
      <CorporateIntro />
      
      {/* Who This Is For - Three audience cards */}
      <CorporateAudience />
      
      {/* What We Offer - Grouped sections with clear boundaries */}
      <CorporateOfferings />
      
      {/* How Engagement Works - Step-based vertical storytelling */}
      <CorporateProcess />
      
      {/* Ethics & Confidentiality - Prominent and calm */}
      <CorporateEthics />
      
      {/* Corporate Enquiry Form - "Start a conversation" */}
      <CorporateForm />
    </div>
  );
};