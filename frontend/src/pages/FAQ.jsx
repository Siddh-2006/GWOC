import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, CreditCard, Clock, Shield, Calendar, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    {
      q: "What is a psycho-education session?",
      a: "It's a structured session where we help you understand mental health concepts, how your brain processes emotions, and provide tools for self-management. It's about guidance and awareness.",
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      q: "How can the AI Assistant help me?",
      a: "Our AI Assistant is your 24/7 companion. It can help you find available slots, answer questions about our services, and provide immediate support for common queries.",
      icon: <MessageCircle className="w-5 h-5 text-pink-500" />
    },
    {
      q: "How long is each session?",
      a: "Standard sessions at MindSettler last for 60 minutes. This allows enough time for both discussion and practical guidance.",
      icon: <Clock className="w-5 h-5" />
    },
    {
      q: "How do I make a payment?",
      a: "For online sessions, payment is required online prior to the session. For offline (in-studio) sessions, you can choose to make the payment online or pay in cash at our studio.",
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      q: "Is my data confidential?",
      a: "Absolutely. We follow a strict Confidentiality Policy. Every session is conducted in a safe, private environment (online or offline).",
      icon: <Shield className="w-5 h-5" />
    },
    {
      q: "Can I cancel or reschedule?",
      a: "We have a Non-Refund Policy, but you can reschedule your session if you inform us at least 24 hours in advance, subject to availability.",
      icon: <Calendar className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen py-24 px-4 bg-aurora-light relative overflow-hidden">
      {/* Decorative background elements can go here if needed */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-secondary font-bold uppercase tracking-wider mb-2 text-sm">Support Center</h2>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Frequently Asked <span className="text-secondary">Questions</span></h1>
            <p className="text-primary/70 text-lg max-w-2xl mx-auto">
              Everything you need to know about our services, payment policies, and how we can assist you on your journey.
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card overflow-hidden group border border-white/40 hover:border-secondary/30 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${openIndex === i ? 'bg-secondary text-white' : 'bg-primary/5 text-primary'} transition-colors duration-300`}>
                    {faq.icon}
                  </div>
                  <span className="font-bold text-lg text-primary">{faq.q}</span>
                </div>
                <div className={`transform transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                  {openIndex === i ? <ChevronUp className="text-secondary" /> : <ChevronDown className="text-gray-400 group-hover:text-secondary" />}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-2 pl-[5.5rem] text-primary/80 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-primary/60">Still have questions?</p>
          <button
            onClick={() => navigate('/contact')}
            className="mt-4 btn-secondary"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
