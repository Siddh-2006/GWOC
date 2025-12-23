import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="py-20 px-6 sm:px-8 lg:px-10 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 mb-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-bold text-primary">Privacy Policy</h1>
        </div>

        <div className="prose prose-purple max-w-none space-y-6 text-gray-600">
          <p>
            At MindSettler, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website and services.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Information Collection</h2>
            <p>
              We collect information that you provide to us directly, such as your name, email address, phone number, and any notes provided during the booking process. We use this information to facilitate your sessions and communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Use of Information</h2>
            <p>
              Your information is used solely for the purpose of identifying you, contacting you regarding your appointments, and providing personalized psycho-education guidance. We do not sell or share your data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data from unauthorized access, loss, or disclosure. All personal records related to sessions are kept strictly confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Cookies</h2>
            <p>
              Our website may use basic cookies to enhance your browsing experience and analyze site traffic anonymously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">5. Your Rights</h2>
            <p>
              You have the right to access, update, or request the deletion of your personal information at any time. Please contact us if you wish to exercise these rights.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
