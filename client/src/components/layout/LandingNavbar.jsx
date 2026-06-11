import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiMoon, FiSun, FiBell, FiUser, FiLogOut,
  FiHome, FiBook, FiBarChart2, FiBookOpen
} from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const links = ['Features', 'How It Works', 'Stats', 'Testimonials'];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);

    // Active section tracking
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -40% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    links.forEach((link) => {
      const id = link.toLowerCase().replace(/\s+/g, '-');
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const getHref = (link) => `#${link.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-2xl py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <RiGraduationCapLine className="text-white text-lg" />
            </div>
            <span className="font-bold text-white text-lg font-outfit">BunkMeter</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const href = getHref(link);
              const isActive = activeSection === href.substring(1);
              return (
                <a
                  key={link}
                  href={href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative group ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg glass text-white"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => {
                const href = getHref(link);
                const isActive = activeSection === href.substring(1);
                return (
                  <a
                    key={link}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 rounded-lg transition-all ${
                      isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link}
                  </a>
                );
              })}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center py-2 text-slate-300">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center text-sm py-2">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default LandingNavbar;
