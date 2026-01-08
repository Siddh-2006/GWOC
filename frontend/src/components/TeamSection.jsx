import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronRight, MessageSquare, Linkedin, Twitter } from 'lucide-react';

const team = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Clinical Psychologist",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&h=800&auto=format&fit=crop",
    bio: "I believe that every individual has the capacity for growth. My approach focuses on bridging the gap between clinical expertise and human compassion.",
    tags: ["CBT", "Trauma"],
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "James Wilson",
    role: "Mindfulness Coach",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&h=800&auto=format&fit=crop",
    bio: "Mindfulness isn't just a practice; it's a way of living. I help corporate leaders find balance in high-pressure environments.",
    tags: ["Mindfulness", "Stress"],
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Elena Rodriguez",
    role: "Family Counselor",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&h=800&auto=format&fit=crop",
    bio: "Stronger families build stronger communities. I am dedicated to helping families navigate transitions with empathy and clarity.",
    tags: ["Family", "Relationships"],
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "David Chen",
    role: "Behavioral Analyst",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=800&auto=format&fit=crop",
    bio: "Data-driven therapy that respects the human element. My goal is to help you decipher patterns and reclaim your narrative.",
    tags: ["Behavioral", "Data"],
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "Maya Patel",
    role: "Wellness Advocate",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=800&auto=format&fit=crop",
    bio: "Wellness is a right, not a privilege. I focus on community-based support and accessible mental health solutions.",
    tags: ["Advocacy", "Community"],
    linkedin: "#",
    twitter: "#"
  }
];

const TeamCard = ({ member }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 w-72 h-[450px] cursor-pointer perspective-1000 mx-4"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full transition-all duration-700 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg shadow-purple-100/50 border-4 border-purple-200">
            <img
              src={member.image}
              alt={member.name}
              className={`w-full h-full object-cover transition-all duration-700 ${isFlipped ? 'grayscale-0' : 'grayscale'}`}
            />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-pink-300 font-semibold uppercase tracking-widest text-[10px]">{member.role}</p>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full rounded-[2rem] bg-white p-8 flex flex-col justify-between shadow-xl shadow-purple-100/50 border-4 border-purple-200">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-6">
                <MessageSquare className="text-secondary" size={20} />
              </div>
              <p className="text-base font-medium text-gray-800 leading-relaxed mb-6 italic line-clamp-6">
                "{member.bio}"
              </p>
              <div className="flex flex-wrap gap-2">
                {member.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-pink-50 text-secondary text-[10px] font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex gap-3">
                <a href={member.linkedin} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <Linkedin size={14} />
                </a>
                <a href={member.twitter} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <Twitter size={14} />
                </a>
              </div>
              <button className="text-primary font-bold text-sm flex items-center gap-1 group">
                Reach out <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TeamSection = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate team for seamless marquee
  const extendedTeam = [...team, ...team];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/bg-img-2.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Meet Our Experts</span>
        <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6">Guidance from <span className="text-secondary italic">Trustworthy</span> Minds</h2>
        <p className="text-gray-500 text-xl leading-relaxed max-w-2xl mx-auto">
          Our specialists are here to navigate the complexities of life with you, providing evidence-based, human-centric support.
        </p>
      </div>

      {/* Marquee Container */}
      <div
        className="flex overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex flex-nowrap"
          animate={{ x: isPaused ? 0 : "-50%" }}
          initial={{ x: 0 }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            paused: isPaused
          }}
          style={{ width: "fit-content" }}
        >
          {extendedTeam.map((member, i) => (
            <TeamCard key={i} member={member} />
          ))}
        </motion.div>
      </div>

      <div className="mt-20 text-center">
        {/* <motion.button
          whileHover={{ x: 5 }}
          className="inline-flex items-center gap-2 text-primary font-bold border-b-2 border-primary pb-1 group"
        >
          Explore all profiles <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button> */}
      </div>

    </section>
  );
};

export default TeamSection;
