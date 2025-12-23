import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="py-20 px-6 sm:px-8 lg:px-10 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 mb-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold text-primary">Non-Refund Policy</h1>
        </div>

        <div className="prose prose-purple max-w-none space-y-6 text-gray-600">
          <p>
            MindSettler provides dedicated professional guidance and psycho-education. To maintain the quality of our services and respect the artist's/counselor's time, we adhere to a strict non-refund policy.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Session Fees</h2>
            <p>
              All fees paid for sessions (online or offline) are non-refundable. Once a booking is requested and confirmed via manual payment (UPI/Cash), the transaction is considered final.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Rescheduling</h2>
            <p>
              We understand that unforeseen circumstances may arise. You may reschedule your session at least 24 hours in advance without any additional charges. Rescheduling within 24 hours of the appointment may incur a fee or forfeiture of the session.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. No-Show Policy</h2>
            <p>
              If a user fails to attend their scheduled session without prior notice, the session will be considered completed, and no refund or free reschedule will be provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Cancellation by MindSettler</h2>
            <p>
              In the rare event that MindSettler needs to cancel a session, a full reschedule or credit will be offered to the user.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy;
