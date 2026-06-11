import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiArrowRight, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { RiGraduationCapLine } from 'react-icons/ri';
import { AuthContext } from '../context/AuthContext';
import { toast } from '../components/common/Toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const res = await register(form.name, form.email, form.password);
    setLoading(false);
    if (res.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-float-delayed" />

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center"
        >
          <h2 className="text-5xl font-bold text-white mb-4 font-outfit">Join 10K+ Students</h2>
          <p className="text-purple-200 text-xl mb-12">Start managing your attendance the smart way</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500K+', label: 'Classes Tracked' },
              { value: '95%', label: 'Success Rate' },
              { value: 'Free', label: 'Forever' },
            ].map(({ value, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass rounded-2xl p-5 border border-white/10"
              >
                <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
                <p className="text-slate-400 text-xs">{label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5 }}
            className="glass rounded-xl p-4 border border-purple-500/20 text-sm text-slate-300 italic"
          >
            "BunkMeter made my college life so much easier. I finally stopped worrying about attendance!" — Raunak, Centurion University of Technology and Management
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

          <h2 className="text-3xl font-bold text-white mb-2">Create your account 🎓</h2>
          <p className="text-slate-400 mb-8">Start tracking smarter. It's completely free.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-field pl-10"
                  placeholder="230301120XXX@centurionuniv.edu.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="input-field pl-10 pr-12"
                  placeholder="Min. 6 characters"
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
              {/* Strength indicator */}
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${form.password.length > i * 2
                        ? form.password.length >= 8 ? 'bg-emerald-500' : 'bg-amber-500'
                        : 'bg-slate-700'
                        }`}
                    />
                  ))}
                </div>
              )}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight />
                </>
              )}
            </motion.button>

            <p className="text-slate-500 text-xs text-center">
              By signing up, you agree to track your attendance responsibly. 😄
            </p>
          </form>

          <p className="mt-6 text-slate-400 text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign in →
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

export default Register;
