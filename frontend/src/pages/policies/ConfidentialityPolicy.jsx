import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const ConfidentialityPolicy = () => {
  return (
    <div className="py-20 px-6 sm:px-8 lg:px-10 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 mb-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl font-bold text-primary">Confidentiality Policy</h1>
        </div>

        <div className="prose prose-purple max-w-none space-y-6 text-gray-600">
          <p className="font-medium text-lg text-primary italic">
            "Your safety and privacy are the foundation of our work together."
          </p>
          <p>
            MindSettler is committed to maintaining the highest standards of confidentiality. This agreement ensures that the information shared during our psycho-education sessions remains private.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. The Promise of Privacy</h2>
            <p>
              Everything discussed within a session is confidential. We do not disclose that you are attending sessions or share the content of our discussions with anyone without your explicit written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Legal Exceptions</h2>
            <p>
              Confidentiality is a primary duty, but there are certain legal and ethical exceptions where disclosure may be required:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>If there is a clear and imminent danger to yourself or others.</li>
              <li>In cases involving the abuse or neglect of children, elderly, or vulnerable individuals.</li>
              <li>When required by a court order or legal summons.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Professional Supervision</h2>
            <p>
              To provide the best possible support, cases may be discussed anonymously with a professional supervisor or peer group. Your identity will never be revealed during these consultations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Digital Privacy</h2>
            <p>
              While we use secure platforms for online sessions, please be aware of the inherent risks of digital communication. We recommend using a private device and a secure internet connection for your sessions.
            </p>
          </section>

          <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-100 italic">
            "By booking a session with MindSettler, you acknowledge that you have read and understood this Confidentiality Policy."
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfidentialityPolicy;
