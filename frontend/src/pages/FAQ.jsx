import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is a psycho-education session?",
      a: "It's a structured session where we help you understand mental health concepts, how your brain processes emotions, and provide tools for self-management. It's about guidance and awareness."
    },
    {
      q: "How long is each session?",
      a: "Standard sessions at MindSettler last for 60 minutes. This allows enough time for both discussion and practical guidance."
    },
    {
      q: "How do I make a payment?",
      a: "We currently accept payments via UPI ID or cash at our studio. Once you request a slot, our team will share the payment details for confirmation."
    },
    {
      q: "Is my data confidential?",
      a: "Absolutely. We follow a strict Confidentiality Policy. Every session is conducted in a safe, private environment (online or offline)."
    },
    {
      q: "Can I cancel or reschedule?",
      a: "We have a Non-Refund Policy, but you can reschedule your session if you inform us at least 24 hours in advance, subject to availability."
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Common Questions</h1>
          <p className="text-gray-500">Everything you need to know about starting your journey.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-purple-100 rounded-2xl overflow-hidden hover:border-purple-200 transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left p-6 flex justify-between items-center bg-white"
              >
                <span className="font-bold text-primary">{faq.q}</span>
                {openIndex === i ? <ChevronUp className="text-secondary" /> : <ChevronDown className="text-gray-400" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-purple-50 bg-purple-50/20">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
