import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Lock, MapPin, ArrowRight, Store, Sparkles } from 'lucide-react';

export const RegisterCustomerPage: React.FC = () => {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerCustomer(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Customer registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aurora-canvas min-h-screen flex items-center justify-center p-4 relative text-slate-100">
      {/* Living Animated Aurora Background Blades */}
      <div className="aurora-blades-wrapper">
        <div className="aurora-blade-crimson" />
        <div className="aurora-blade-coral" />
        <div className="aurora-blade-amber" />
      </div>

      {/* SVG Grain Overlay */}
      <div className="svg-grain-overlay" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link to="/landing" className="inline-block group">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <User className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-xl font-bold text-white">Customer Account Registration</h2>
          <p className="text-xs font-mono text-rose-400 mt-1">
            Browse localized Karnataka provisions and track grocery orders.
          </p>
        </div>

        <div className="glass-panel-dark p-8 border border-rose-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {error && <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ananya Rao"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. ananya@kirana.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 99001 77889"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Delivery Address</label>
              <input
                type="text"
                placeholder="e.g. 3rd Floor, Shanthi Nilaya, Rajajinagar, Bengaluru"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="keycap-btn-primary w-full py-2.5 text-xs mt-3 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Register Customer Account'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-rose-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCustomerPage;
