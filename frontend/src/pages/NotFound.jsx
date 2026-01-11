import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#FFF5F8] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-primary/10">

      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/assets/notfound_journey_bg.png"
            alt="Ethereal Misty Path"
            className="w-full h-full object-cover opacity-60 mix-blend-soft-light"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F8]/40 via-transparent to-[#FFF5F8]" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-[#FFD1E3]/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -80, 0],
            y: [0, 80, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#B19EEF]/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: ['-20%', '20%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-40 mix-blend-overlay"
        />
      </div>

      <div className="max-w-3xl w-full text-center relative z-10 flex flex-col items-center">

        {/* 404 Header Area */}
        <div className="relative w-full h-48 md:h-64 mb-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center"
          >
            <span className="text-[10rem] md:text-[14rem] font-serif italic text-primary/10 tracking-tighter leading-none select-none">
              404
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-6 mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-serif text-gray-900 tracking-tight leading-snug">
            Lost in Reflection?
          </h1>
          <div className="w-12 h-0.5 bg-primary/20 mx-auto rounded-full" />
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-xl mx-auto leading-relaxed italic">
            Even the most careful explorers lose their way.
            This page seems to have drifted into the quiet spaces of our mind.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 items-center"
        >
          <Link
            to="/"
            className="px-12 py-5 bg-[#3F2965] text-white font-serif rounded-full shadow-2xl shadow-purple-900/10 hover:bg-[#5A408E] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 text-sm tracking-widest uppercase"
          >
            <Home size={18} />
            Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-10 py-5 bg-white/50 backdrop-blur-md border border-[#3F2965]/10 text-[#3F2965] font-serif rounded-full hover:bg-white transition-all duration-300 flex items-center gap-3 group text-sm tracking-widest uppercase"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
        </motion.div>

        <div className="mt-20 w-1 h-20 bg-gradient-to-b from-[#3F2965]/20 (to-transparent) rounded-full opacity-30" />
      </div>


      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
    </div>
  );
};

export default NotFound;
