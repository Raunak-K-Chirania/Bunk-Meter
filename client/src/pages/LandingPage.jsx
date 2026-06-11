import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  FiArrowRight, FiCheck, FiStar, FiTrendingUp, FiShield,
  FiBarChart2, FiBell, FiBook, FiZap, FiUsers, FiAward
} from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import LandingNavbar from '../components/layout/LandingNavbar';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

const InView = ({ children, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const features = [
  { icon: FiTrendingUp, title: 'Smart Bunk Calculator', desc: 'Know exactly how many classes you can skip without falling below 75%.', color: '#6366f1' },
  { icon: FiBarChart2, title: 'Visual Analytics', desc: 'Beautiful charts showing your attendance trends across all subjects.', color: '#8b5cf6' },
  { icon: FiBell, title: 'Smart Alerts', desc: 'Get notified before your attendance drops below the danger zone.', color: '#06b6d4' },
  { icon: FiShield, title: 'Secure & Private', desc: 'Your data is encrypted and only visible to you.', color: '#10b981' },
  { icon: FiZap, title: 'Instant Updates', desc: 'Mark attendance with one tap. Dashboard updates in real-time.', color: '#f59e0b' },
  { icon: FiBook, title: 'Multi-Subject Tracking', desc: 'Track unlimited subjects with individual stats for each.', color: '#ec4899' },
];

const stats = [
  { value: '10K+', label: 'Students Tracking', icon: FiUsers },
  { value: '95%', label: 'Accuracy Rate', icon: FiAward },
  { value: '500K+', label: 'Classes Tracked', icon: FiBook },
  { value: '4.9★', label: 'Student Rating', icon: FiStar },
];

const testimonials = [
  { name: 'Priya Sharma', course: 'B.Tech CSE, IIT Delhi', text: 'BunkMeter literally saved my semester! I knew exactly how many classes I could skip for my trip. 100% recommend!', avatar: 'P' },
  { name: 'Rahul Mehta', course: 'MBA, IIM Ahmedabad', text: 'The analytics are incredible. I can see trends and plan my week without worrying about attendance shortfall.', avatar: 'R' },
  { name: 'Anjali Singh', course: 'B.Com, DU', text: 'Finally an app that understands student life! The safe bunk calculator is pure genius.', avatar: 'A' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />
          <div className="absolute -bottom-20 left-40 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-100" />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm font-medium text-indigo-300 mb-8"
          >
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Smart Attendance Tracking for Students
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight font-outfit"
          >
            Never Worry About
            <br />
            <span className="gradient-text">Attendance</span>
            <br />
            Again.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track your attendance, calculate safe bunks, get alerts before it's too late — 
            all in one beautiful dashboard built for students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
              Start Tracking Free
              <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              <RiGraduationCapLine />
              Already a student?
            </Link>
          </motion.div>

          {/* Floating cards preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mt-20 max-w-4xl mx-auto"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Overall', value: '82%', color: '#10b981' },
                  { label: 'Safe Bunks', value: '12', color: '#6366f1' },
                  { label: 'Attended', value: '148', color: '#06b6d4' },
                  { label: 'Missed', value: '32', color: '#f59e0b' },
                ].map((item) => (
                  <div key={item.label} className="glass rounded-xl p-3 text-center">
                    <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                    <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Data Structures', pct: 92, color: '#10b981' },
                  { name: 'Operating Systems', pct: 78, color: '#6366f1' },
                  { name: 'DBMS', pct: 65, color: '#f59e0b' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <p className="text-sm text-slate-300 w-40 truncate">{s.name}</p>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                        className="h-2 rounded-full"
                        style={{ background: s.color }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-6 -right-6 glass-card rounded-xl px-4 py-3 border border-indigo-500/30 hidden md:block"
            >
              <p className="text-xs text-slate-400">Safe Bunks</p>
              <p className="text-2xl font-bold text-indigo-400">12 🎉</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1 }}
              className="absolute -bottom-6 -left-6 glass-card rounded-xl px-4 py-3 border border-emerald-500/30 hidden md:block"
            >
              <p className="text-xs text-slate-400">Attendance</p>
              <p className="text-2xl font-bold text-emerald-400">82% ✓</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="glass-card rounded-2xl p-6 text-center group hover:-translate-y-1 transition-transform"
              >
                <Icon size={24} className="text-indigo-400 mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">{value}</p>
                <p className="text-slate-400 text-sm">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <InView className="text-center mb-16">
            <p className="text-indigo-400 font-semibold mb-3 tracking-widest text-sm uppercase">Why BunkMeter?</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A complete attendance management system designed specifically for students.</p>
          </InView>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 group cursor-default relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 20% 20%, ${color}10, transparent 60%)` }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 relative">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed relative">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <InView className="text-center mb-16">
            <p className="text-cyan-400 font-semibold mb-3 tracking-widest text-sm uppercase">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          </InView>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up in seconds with your name and email. No credit card required.', color: '#6366f1' },
              { step: '02', title: 'Add Your Subjects', desc: 'Enter your subjects and current attendance counts to get started instantly.', color: '#8b5cf6' },
              { step: '03', title: 'Mark Daily Attendance', desc: 'Tap "Attended" or "Missed" after each class. It takes 2 seconds.', color: '#06b6d4' },
              { step: '04', title: 'Stay Safe & Informed', desc: 'See how many classes you can bunk and get alerts before it\'s too late.', color: '#10b981' },
            ].map(({ step, title, desc, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex items-start gap-6 glass-card rounded-2xl p-6 group hover:-translate-y-1 transition-transform"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xl"
                  style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                >
                  {step}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <InView className="text-center mb-16">
            <p className="text-purple-400 font-semibold mb-3 tracking-widest text-sm uppercase">Student Reviews</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Loved by Students</h2>
          </InView>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map(({ name, course, text, avatar }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 relative"
              >
                <div className="flex text-amber-400 gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <FiStar key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{course}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <InView>
          <div className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-3xl" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-600 rounded-full blur-3xl opacity-10" />
            <div className="relative z-10">
              <RiGraduationCapLine size={48} className="text-indigo-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Start?</h2>
              <p className="text-slate-400 mb-8 text-lg">Join 10,000+ students tracking their attendance smarter.</p>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
                Get Started for Free
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </InView>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <RiGraduationCapLine className="text-white text-sm" />
          </div>
          <span className="font-bold text-white">BunkMeter</span>
        </div>
        <p className="text-slate-500 text-sm">© 2026 BunkMeter. Built for students, by students. 🎓</p>
      </footer>
    </div>
  );
};

export default LandingPage;
