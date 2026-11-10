import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, User, Mail, Phone, Lock, MapPin, Tag, Briefcase, ArrowRight, Check, Sparkles } from 'lucide-react';

export const RegisterOwnerPage: React.FC = () => {
  const { registerOwner } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    category: 'Kirana & General Stores',
    businessType: 'Retail Provision Store',
    description: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: 'One number', valid: /[0-9]/.test(formData.password) },
    { label: 'One special symbol', valid: /[^a-zA-Z0-9]/.test(formData.password) },
  ];

  const isPasswordValid = passwordRules.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerOwner(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aurora-canvas min-h-screen flex items-center justify-center p-4 py-12 relative text-slate-100">
      {/* Living Animated Aurora Background Blades */}
      <div className="aurora-blades-wrapper">
        <div className="aurora-blade-crimson" />
        <div className="aurora-blade-coral" />
        <div className="aurora-blade-amber" />
      </div>

      {/* SVG Grain Overlay */}
      <div className="svg-grain-overlay" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <Link to="/landing" className="inline-block group">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white">Register Kirana Provision Store</h1>
          <p className="text-xs font-mono text-rose-400 mt-1">
            Setup digital inventory ledger, staff access, barcode checkout, and sales reporting.
          </p>
        </div>

        <div className="glass-panel-dark p-8 border border-rose-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Owner Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Shankar Gowda"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Store / Kirana Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Sri Manjunatha Provisions"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                  />
                  <Store className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Store Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. store@manjunathakirana.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Contact Mobile Phone *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Store Location / Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. 12th Cross, Rajajinagar 4th Block, Bengaluru, Karnataka"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white"
                >
                  <option value="Kirana & General Stores">Kirana & General Stores (ಕಿರಾಣಿ)</option>
                  <option value="Grains & Pulses Wholesale">Grains & Pulses Wholesale</option>
                  <option value="Organic & Daily Provisions">Organic & Daily Provisions</option>
                  <option value="Supermarket / Mini-Mart">Supermarket / Mini-Mart</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white"
                >
                  <option value="Retail Provision Store">Retail Provision Store</option>
                  <option value="Wholesale & Semi-Wholesale">Wholesale & Semi-Wholesale</option>
                  <option value="Kirana + Home Delivery">Kirana + Home Delivery</option>
                </select>
              </div>
            </div>

            {/* Password Field with Security Validator */}
            <div className="pt-2">
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">
                Account Master Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create secure admin password"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a0e18] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono">
                {passwordRules.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 text-[10px] p-1.5 rounded-lg border ${
                      r.valid
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 font-semibold'
                        : 'bg-[#0b0f19] text-slate-500 border-slate-800'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${r.valid ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="keycap-btn-primary w-full py-3 text-xs mt-3 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Initializing Store...' : 'Complete Registration & Launch Console'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-rose-400 hover:underline">
              Sign In to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterOwnerPage;
