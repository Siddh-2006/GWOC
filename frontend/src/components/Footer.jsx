import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-12 md:pt-16 lg:pt-20 pb-6 md:pb-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 lg:gap-12 mb-10 md:mb-16">
          {/* Brand section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="mb-4 md:mb-6">
              <Logo variant="white" className="h-12 md:h-16" />
            </div>
            <p className="text-purple-50 mb-6 md:mb-8 max-w-md leading-relaxed text-sm md:text-base font-light">
              MindSettler is a dedicated space for psycho-education and mental well-being, helping you navigate life's challenges with clarity and support.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              {[
                { icon: <Instagram size={20} strokeWidth={2} />, href: "https://www.instagram.com/mindsettlerbypb/", label: "Instagram" },
                { icon: <Mail size={20} strokeWidth={2} />, href: "mailto:contact@mindsettler.com", label: "Email" },
                { icon: <Phone size={20} strokeWidth={2} />, href: "tel:+1234567890", label: "Phone" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 md:p-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-gradient-to-br hover:from-secondary hover:to-pink-500 hover:border-transparent hover:shadow-lg hover:shadow-secondary/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="block w-4 h-4 md:w-5 md:h-5">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Learn Links */}
          <div className="col-span-1">
            <h4 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-10 md:after:w-12 after:h-0.5 md:after:h-1 after:bg-gradient-to-r after:from-secondary after:to-pink-400 after:rounded-full">
              Learn
            </h4>
            <ul className="space-y-2.5 md:space-y-3.5 text-purple-100 text-sm md:text-base">
              {[
                { name: 'Psycho-Education', path: '/psycho-education' },
                { name: 'Library', path: '/psycho-education/library' },
                { name: 'Resources', path: '/resources' },
                { name: 'FAQs', path: '/faqs' }
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="group inline-flex items-center gap-2 font-medium transition-all duration-300 hover:text-white hover:translate-x-1">
                    <span className="w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-5 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Links */}
          <div className="col-span-1">
            <h4 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-10 md:after:w-12 after:h-0.5 md:after:h-1 after:bg-gradient-to-r after:from-secondary after:to-pink-400 after:rounded-full">
              Explore
            </h4>
            <ul className="space-y-2.5 md:space-y-3.5 text-purple-100 text-sm md:text-base">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Corporate', path: '/corporate' },
                { name: 'Contact Us', path: '/contact' }
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="group inline-flex items-center gap-2 font-medium transition-all duration-300 hover:text-white hover:translate-x-1">
                    <span className="w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-5 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-1">
            <h4 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-white relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-10 md:after:w-12 after:h-0.5 md:after:h-1 after:bg-gradient-to-r after:from-secondary after:to-pink-400 after:rounded-full">
              Policies
            </h4>
            <ul className="space-y-2.5 md:space-y-3.5 text-purple-100 text-sm md:text-base">
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Non-Refund Policy', path: '/refund-policy' },
                { name: 'Confidentiality Policy', path: '/confidentiality' }
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="group inline-flex items-center gap-2 font-medium transition-all duration-300 hover:text-white hover:translate-x-1">
                    <span className="w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-5 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <p className="text-purple-200 text-xs md:text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} MindSettler by Parnika. Crafted with care for your well-being.
          </p>
          <div className="flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-white text-[10px] md:text-xs font-semibold tracking-wide">Always Safe & Confidential</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
