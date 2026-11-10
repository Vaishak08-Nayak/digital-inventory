import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage(res.data?.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
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
        <div className="glass-panel-dark p-8 border border-rose-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <h2 className="text-xl font-bold text-center text-white mb-2">Set New Password</h2>
          <p className="text-xs font-mono text-slate-400 text-center mb-6">Create a new secure password for your store account.</p>

          {message ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-emerald-300">{message}</p>
              <p className="text-[11px] text-slate-400 mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {error && <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg">{error}</div>}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="keycap-btn-primary w-full py-2.5 text-xs mt-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Log In'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
