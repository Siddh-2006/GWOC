import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Loader2 } from 'lucide-react';
import contactAPI from '../services/contact.api.js';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await contactAPI.submitContactForm(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError({
        message: err.message || 'Failed to send message. Please try again.',
        details: err.details
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <div className="py-20 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto pt-32">
      <div className="text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-primary mb-6"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Have questions about our sessions or corporate services? We're here to guide you on your journey to well-being.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-primary">Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We look forward to hearing from you. Whether you prefer email, phone, or visiting us in person, we're ready to connect.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-primary text-lg">Email Us</h4>
                <p className="text-gray-500">contact@mindsettler.com</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-primary text-lg">Call Us</h4>
                <p className="text-gray-500">+91 123 456 7890</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-primary text-lg">Our Studio</h4>
                <p className="text-gray-500">MindSettler Studio, Surat, Gujarat, India</p>
              </div>
            </div>
          </div>

          <div className="p-8 glass-card border-none bg-primary text-white space-y-4">
            <h4 className="font-bold text-xl flex items-center gap-2">
              <Instagram size={20} className="text-secondary" />
              Follow Our Journey
            </h4>
            <p className="text-purple-100/70 text-sm">
              Stay updated with mental wellness tips and mindful practices.
            </p>
            <a
              href="https://www.instagram.com/mindsettlerbypb/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-2 text-secondary font-bold hover:underline"
            >
              @mindsettlerbypb
            </a>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {submitted ? (
            <div className="glass-card p-12 text-center space-y-6 flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Send size={40} />
              </div>
              <h2 className="text-3xl font-bold text-primary">Message Sent!</h2>
              <p className="text-gray-600 max-w-sm">
                Thank you for reaching out. We've received your message and will get back to you within 24-48 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary font-bold underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="glass-card p-8 md:p-12">
              <h3 className="text-2xl font-bold text-primary mb-8">Send a Message</h3>

              {error && error.message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <p className="font-bold mb-1">{error.message}</p>
                  {error.details && (
                    <ul className="text-xs list-disc list-inside opacity-80">
                      {error.details.map((err, idx) => (
                        <li key={idx}>{err.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                  <textarea
                    required
                    minLength={10}
                    rows="5"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Write your message here (min. 10 characters)..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
