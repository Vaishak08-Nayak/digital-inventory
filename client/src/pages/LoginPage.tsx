import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Store, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string) => {
    setEmail(fillEmail);
    setPassword('Password@123');
  };

  return (
    <div className="aurora-canvas min-h-screen flex items-center justify-center p-4 relative">
      {/* Living Animated Aurora Background Blades */}
      <div className="aurora-blades-wrapper">
        <div className="aurora-blade-crimson" />
        <div className="aurora-blade-coral" />
        <div className="aurora-blade-amber" />
      </div>

      {/* SVG Grain Overlay */}
      <div className="svg-grain-overlay" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/landing" className="inline-block group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.5)] mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-8 h-8" />
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Kirana Core Console
          </h1>
          <p className="text-xs font-mono text-rose-400 mt-1">
            ಕರ್ನಾಟಕ ಕಿರಾಣಿ ಮತ್ತು ಜನರಲ್ ಪ್ರಾವಿಷನ್ ಸ್ಟೋರ್ಸ್
          </p>
        </div>

        {/* 3D Glassy Form Card */}
        <div className="glass-panel-dark p-8 border border-rose-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Account Authentication</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sign in to your Kirana store console</p>
            </div>
            <Link
              to="/landing"
              className="text-[11px] font-mono font-semibold text-rose-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Hero View
            </Link>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@kirana.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-[#090d16] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-rose-400 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-xl bg-[#090d16] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="keycap-btn-primary w-full py-3 text-xs mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating Terminal...' : 'Sign In to Kirana POS'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800/90">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('owner@kirana.com')}
                className="py-1.5 px-2 text-xs font-mono font-semibold rounded-lg bg-[#141a27] hover:bg-rose-950/40 text-rose-300 border border-rose-500/30 text-center transition-all cursor-pointer"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('staff@kirana.com')}
                className="py-1.5 px-2 text-xs font-mono font-semibold rounded-lg bg-[#141a27] hover:bg-amber-950/40 text-amber-300 border border-amber-500/30 text-center transition-all cursor-pointer"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('customer@kirana.com')}
                className="py-1.5 px-2 text-xs font-mono font-semibold rounded-lg bg-[#141a27] hover:bg-coral-950/40 text-slate-200 border border-slate-700 text-center transition-all cursor-pointer"
              >
                Customer
              </button>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have a registered store?{' '}
            <Link to="/register-owner" className="font-bold text-rose-400 hover:underline">
              Register Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
