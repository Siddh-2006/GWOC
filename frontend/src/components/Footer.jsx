import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-5">
            <Logo variant="invert" className="h-16 mb-8" />
            <p className="text-purple-100/80 mb-8 max-w-sm leading-relaxed text-lg">
              MindSettler is a dedicated space for psycho-education and mental well-being, helping you navigate life's challenges with clarity and support.
            </p>
            <div className="flex space-x-5">
              {[
                { icon: <Instagram size={22} />, href: "https://www.instagram.com/mindsettlerbypb/" },
                { icon: <Mail size={22} />, href: "mailto:contact@mindsettler.com" },
                { icon: <Phone size={22} />, href: "tel:+1234567890" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-secondary hover:border-secondary hover:-translate-y-1 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-xl font-bold mb-8 text-white relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-secondary after:rounded-full">
              Explore
            </h4>
            <ul className="space-y-5 text-purple-100/70">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Your Journey', path: '/journey' },
                { name: 'Corporate Services', path: '/corporate' },
                { name: 'Book a Session', path: '/booking' }
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="link-underline pb-1 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-1 md:col-span-4">
            <h4 className="text-xl font-bold mb-8 text-white relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-secondary after:rounded-full">
              Policies
            </h4>
            <ul className="space-y-5 text-purple-100/70">
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Non-Refund Policy', path: '/refund-policy' },
                { name: 'Confidentiality Policy', path: '/confidentiality' }
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="link-underline pb-1 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-purple-200/50 text-sm font-medium">
            © {new Date().getFullYear()} MindSettler by Parnika. Crafted with care for your well-being.
          </p>
          <div className="flex items-center gap-2 text-purple-200/50 text-xs tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Always Safe & Confidential
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
