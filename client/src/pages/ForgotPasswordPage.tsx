import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, ArrowLeft, CheckCircle2, Store } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data?.message || 'Password reset instructions dispatched.');
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Request failed.');
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
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Recover Access</h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Enter your registered store email to receive password reset link.
            </p>
          </div>

          {message ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3 font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-emerald-300">{message}</p>
              {resetToken && (
                <div className="p-2 rounded bg-black/50 border border-slate-800 text-[10px] text-slate-400 break-all text-left">
                  <span className="text-rose-400 font-bold block mb-1">Dev Reset Token:</span>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="text-amber-400 hover:underline block"
                  >
                    Click to proceed with token &rarr;
                  </Link>
                </div>
              )}
              <Link to="/login" className="inline-block text-xs font-bold text-rose-400 hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">{error}</div>}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-400 mb-1">Store Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@kirana.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#090d16] border border-slate-800 focus:outline-none focus:border-rose-500 text-white placeholder-slate-500 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="keycap-btn-primary w-full py-2.5 text-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Dispatching...' : 'Send Reset Instructions'}
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-rose-400 hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
