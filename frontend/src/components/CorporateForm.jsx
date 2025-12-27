import React, { useState } from 'react';
import { corporateService } from '../services/corporate.api';
import { Send, Loader2 } from 'lucide-react';

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
        <div className="glass-card rounded-3xl p-16 shadow-xl my-16">
          <div className="bg-purple-100 text-primary p-12 rounded-2xl text-center border border-purple-200">
            <h3 className="text-3xl font-bold mb-6">
              Thank you for reaching out
            </h3>
            <p className="text-lg leading-relaxed text-gray-700 max-w-2xl mx-auto">
              We've received your message and will be in touch soon to understand your needs better.
              We look forward to exploring how we can support your community's well-being journey.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 px-6 max-w-5xl mx-auto">
      <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 md:p-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] my-16 border border-white/50 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-[#1a2b4b] via-purple-800 to-[#1a2b4b] bg-clip-text text-transparent">
              Start a Conversation
            </span>
          </h2>
          <p className="text-center text-slate-500 mb-16 text-lg max-w-2xl mx-auto">
            Ready to explore how we can support your organization? Share a few details, and we'll start exploring the possibilities together.
          </p>

          <form className="max-w-3xl mx-auto space-y-8" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="organizationName" className="block font-bold text-slate-700 text-sm tracking-wide uppercase">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 outline-none text-slate-700"
                  placeholder="Organization name"
                />
                {errors.organizationName && (
                  <div className="text-rose-500 text-sm pl-2 font-medium">{errors.organizationName}</div>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="contactPerson" className="block font-bold text-slate-700 text-sm tracking-wide uppercase">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 outline-none text-slate-700"
                  placeholder="Your full name"
                />
                {errors.contactPerson && (
                  <div className="text-rose-500 text-sm pl-2 font-medium">{errors.contactPerson}</div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="email" className="block font-bold text-slate-700 text-sm tracking-wide uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 outline-none text-slate-700"
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <div className="text-rose-500 text-sm pl-2 font-medium">{errors.email}</div>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="engagementType" className="block font-bold text-slate-700 text-sm tracking-wide uppercase">
                  Interest Area
                </label>
                <div className="relative">
                  <select
                    id="engagementType"
                    name="engagementType"
                    value={formData.engagementType}
                    onChange={handleChange}
                    className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 outline-none text-slate-700 appearance-none cursor-pointer"
                  >
                    {engagementTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.engagementType && (
                  <div className="text-rose-500 text-sm pl-2 font-medium">{errors.engagementType}</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="message" className="block font-bold text-slate-700 text-sm tracking-wide uppercase">
                Context & Needs
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full min-h-[160px] p-6 border border-slate-200 rounded-2xl bg-slate-50/50 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50 transition-all duration-300 outline-none text-slate-700 resize-y leading-relaxed"
                placeholder="Tell us a bit about your organization and what you're hoping to achieve..."
              />
              {errors.message && (
                <div className="text-rose-500 text-sm pl-2 font-medium">{errors.message}</div>
              )}
            </div>

            {submitError && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#1a2b4b] to-[#2a4b7c] hover:from-[#2a4b7c] hover:to-[#3a6b9c] text-white p-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Start a Conversation
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};