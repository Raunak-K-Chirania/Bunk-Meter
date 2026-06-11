import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiArrowRight, FiLoader } from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import { AuthContext } from '../context/AuthContext';
import { toast } from '../components/common/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex-col items-center justify-center p-12 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-float-delayed" />

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-white/20 shadow-2xl">
            <RiGraduationCapLine size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 font-outfit">BunkMeter</h1>
          <p className="text-indigo-200 text-xl mb-12">Your smart attendance companion</p>

          {/* Feature list */}
          <div className="space-y-4 text-left">
            {[
              'Track attendance across all subjects',
              'Calculate safe bunks instantly',
              'Get alerted before going below 75%',
              'Beautiful analytics & insights',
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-500/50 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                </div>
                <span className="text-indigo-100 text-sm">{feat}</span>
              </motion.div>
            ))}
          </div>

          {/* Floating card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="mt-12 glass rounded-2xl p-5 border border-white/10 text-left"
          >
            <p className="text-slate-400 text-xs mb-1">Today's Safe Bunks</p>
            <p className="text-4xl font-bold text-indigo-400">12 🎉</p>
            <p className="text-slate-500 text-xs mt-2">Across 6 subjects</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <RiGraduationCapLine className="text-white" size={20} />
            </div>
            <span className="font-bold text-white text-xl">BunkMeter</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h2>
          <p className="text-slate-400 mb-8">Sign in to continue tracking your attendance.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="230301120XXX@centurionuniv.edu.in"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-slate-400 text-sm text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create one free →
            </Link>
          </p>

          <p className="mt-4 text-slate-400 text-sm text-center">
            <Link to="/" className="text-slate-500 hover:text-slate-400 transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
