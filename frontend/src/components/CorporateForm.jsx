import React, { useState } from 'react';
import { corporateService } from '../services/corporate.api';

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
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-16 shadow-xl my-16">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-medium mb-4">
              Thank you for reaching out
            </h3>
            <p className="text-lg leading-relaxed">
              We've received your message and will be in touch soon to understand your needs better. 
              We look forward to exploring how we can support your community's well-being journey.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-16 shadow-xl my-16">
        <h2 className="text-3xl font-medium text-slate-800 text-center mb-12">
          Start a conversation
        </h2>
        
        <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>
          <div className="mb-8">
            <label htmlFor="organizationName" className="block font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-sm"
              placeholder="Your organization or institution name"
            />
            {errors.organizationName && (
              <div className="text-red-500 text-sm mt-2">{errors.organizationName}</div>
            )}
          </div>

          <div className="mb-8">
            <label htmlFor="contactPerson" className="block font-medium text-gray-700 mb-2">
              Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-sm"
              placeholder="Your name"
            />
            {errors.contactPerson && (
              <div className="text-red-500 text-sm mt-2">{errors.contactPerson}</div>
            )}
          </div>

          <div className="mb-8">
            <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-sm"
              placeholder="your.email@organization.com"
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-2">{errors.email}</div>
            )}
          </div>

          <div className="mb-8">
            <label htmlFor="engagementType" className="block font-medium text-gray-700 mb-2">
              Type of Engagement
            </label>
            <select
              id="engagementType"
              name="engagementType"
              value={formData.engagementType}
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-sm"
            >
              {engagementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.engagementType && (
              <div className="text-red-500 text-sm mt-2">{errors.engagementType}</div>
            )}
          </div>

          <div className="mb-8">
            <label htmlFor="message" className="block font-medium text-gray-700 mb-2">
              Tell us about your context and needs
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-gray-50 resize-y focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-sm"
              placeholder="Share some context about your organization, community, or event. What are you hoping to explore together? What would meaningful support look like for your group?"
            />
            {errors.message && (
              <div className="text-red-500 text-sm mt-2">{errors.message}</div>
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border-l-4 border-red-500 mb-4">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 rounded-xl p-4 text-lg font-medium cursor-pointer transition-all duration-300 mt-4 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Start a conversation'}
          </button>
        </form>
      </div>
    </section>
  );
};