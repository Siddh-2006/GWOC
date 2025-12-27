import React, { useState } from 'react';
import { corporateService } from '../services/corporate.api';
import styles from '../styles/corporate.module.css';

/**
 * Corporate Inquiry Form
 * Calm, human-centered form for starting conversations
 * No "Submit" or "Request proposal" - uses "Start a conversation"
 */
export const CorporateForm = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    engagementType: '',
    message: '',
    organizationSize: 'not-specified',
    preferredContact: 'email'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const engagementTypes = [
    { value: '', label: 'Please select...' },
    { value: 'workplace-workshops', label: 'Workplace Workshops' },
    { value: 'institutional-education', label: 'Institutional Psycho-Education' },
    { value: 'event-sessions', label: 'Event-Based Sessions' },
    { value: 'community-programs', label: 'Community Programs' },
    { value: 'other', label: 'Other (please describe in message)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.engagementType) {
      newErrors.engagementType = 'Please select an engagement type';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please share some context about your needs';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide more details (at least 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await corporateService.submitInquiry(formData);
      
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(response.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'We\'re experiencing technical difficulties. Please try again in a moment.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className={styles.section}>
        <div className={styles.formSection}>
          <div className={styles.successMessage}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              Thank you for reaching out
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
              We've received your message and will be in touch soon to understand your needs better. 
              We look forward to exploring how we can support your community's well-being journey.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>
          Start a conversation
        </h2>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="organizationName" className={styles.formLabel}>
              Organization Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Your organization or institution name"
            />
            {errors.organizationName && (
              <div className={styles.formError}>{errors.organizationName}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contactPerson" className={styles.formLabel}>
              Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Your name"
            />
            {errors.contactPerson && (
              <div className={styles.formError}>{errors.contactPerson}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="your.email@organization.com"
            />
            {errors.email && (
              <div className={styles.formError}>{errors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="engagementType" className={styles.formLabel}>
              Type of Engagement
            </label>
            <select
              id="engagementType"
              name="engagementType"
              value={formData.engagementType}
              onChange={handleChange}
              className={styles.formSelect}
            >
              {engagementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.engagementType && (
              <div className={styles.formError}>{errors.engagementType}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.formLabel}>
              Tell us about your context and needs
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={styles.formTextarea}
              placeholder="Share some context about your organization, community, or event. What are you hoping to explore together? What would meaningful support look like for your group?"
            />
            {errors.message && (
              <div className={styles.formError}>{errors.message}</div>
            )}
          </div>

          {submitError && (
            <div className={styles.errorMessage}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Start a conversation'}
          </button>
        </form>
      </div>
    </section>
  );
};