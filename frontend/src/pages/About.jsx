import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

const About = () => {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">About MindSettler</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A platform born from a passion for psycho-education and a commitment to mental well-being for all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="aspect-square bg-purple-100 rounded-[4rem] rotate-3 overflow-hidden">
              <img 
                src="/assets/pranika.jpg" 
                alt="Parnika - Founder of MindSettler" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Our Brand</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              MindSettler is more than just a counseling service; it's a movement toward mental clarity. We believe that understanding the "why" behind our thoughts is the first step toward settling them.
            </p>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Founded by Parnika, MindSettler focuses on bridging the gap between clinical psychology and everyday understanding, providing tools that are accessible, human, and effective.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="text-primary" />
                </div>
                <h4 className="font-bold mb-2">Our Mission</h4>
                <p className="text-sm text-gray-500">To make therapy less intimidating and more educational.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                  <Eye className="text-secondary" />
                </div>
                <h4 className="font-bold mb-2">Our Vision</h4>
                <p className="text-sm text-gray-500">A world where mental wellness is a standard part of life.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
