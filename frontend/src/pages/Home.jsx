import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Journey from '../features/journey/Journey';

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-secondary uppercase bg-secondary/10 rounded-full">
                Welcome to MindSettler
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-primary leading-tight mb-6">
                Understand Your Mind, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-pink-400">
                  Navigate Your Journey.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                A safe and confidential space for psycho-education and mental well-being support. Guided sessions tailored to your unique path.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/booking" className="btn-primary flex items-center justify-center space-x-2 px-8 py-4">
                  <span>Start Your Journey</span>
                  <ArrowRight size={20} />
                </Link>
                <Link to="/about" className="flex items-center justify-center space-x-2 text-primary font-semibold hover:text-secondary transition-colors px-6">
                  <span>Learn Our Approach</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Storytelling */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Heart className="text-secondary" size={32} />,
                title: "Calm & Reassuring",
                desc: "Every interaction is designed to feel human and emotionally supportive."
              },
              {
                icon: <Shield className="text-secondary" size={32} />,
                title: "Safe & Confidential",
                desc: "Your privacy is our priority. We provide a workspace built on trust."
              },
              {
                icon: <Sparkles className="text-secondary" size={32} />,
                title: "Structured Guidance",
                desc: "Not just talk therapy, but a structured roadmap for your mental wellness."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-purple-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-purple-100"
              >
                <div className="mb-6 p-3 bg-white w-fit rounded-2xl shadow-sm">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-primary">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <Journey />

      {/* Call to Action */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-card p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-6 text-primary">Ready to take the first step?</h2>
              <p className="text-xl text-gray-600 mb-10">Book your 60-minute introductory session and begin your journey towards clarity.</p>
              <Link to="/booking" className="btn-secondary px-10 py-4 text-lg">
                View Available Slots
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
