import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Shield, UserPlus, Bell, Lock, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, business } = useAuth();

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState('');
  const [staffError, setStaffError] = useState('');

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffLoading(true);
    try {
      await api.post('/business/staff', {
        name: staffName,
        email: staffEmail,
        phone: staffPhone || undefined,
        password: staffPassword,
        role: 'STAFF',
      });
      setStaffSuccess(`Staff member ${staffName} added successfully.`);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffPassword('');
      setTimeout(() => setStaffSuccess(''), 4000);
    } catch (err: any) {
      setStaffError(err.message || 'Failed to add staff member.');
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          Store Settings & Staff Permissions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-based access control, staff member invitations, and alert preferences.
        </p>
      </div>

      {staffSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{staffSuccess}</span>
        </div>
      )}

      {staffError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-semibold text-rose-700">
          {staffError}
        </div>
      )}

      {/* Staff Invitation Card (Owner only) */}
      {user?.role === 'OWNER' && (
        <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Shop Staff Account
              </h3>
              <p className="text-xs text-slate-500">
                Staff can record sales, scan barcodes, and manage orders without accessing owner-only settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Gowda"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Staff Login Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. suresh@kirana.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98450 54321"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Set login password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={staffLoading}
              className="px-5 py-2 btn-3d-primary text-xs font-bold"
            >
              {staffLoading ? 'Registering Staff...' : 'Create Staff Login'}
            </button>
          </form>
        </div>
      )}

      {/* Security & Access Overview */}
      <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Active Security & Data Isolation
            </h3>
            <p className="text-xs text-slate-500">Security configuration enforced on every API request</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-slate-900 dark:text-white">Authentication Mode</span>
            <span className="text-slate-500">HTTP-Only SameSite Secure Cookies + JWT</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-slate-900 dark:text-white">Password Hash Standard</span>
            <span className="text-slate-500">Bcrypt (Salt rounds 10) / Argon2id compatible</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-slate-900 dark:text-white">Multi-Tenant Isolation</span>
            <span className="text-slate-500">Strict Scoping by Business UUID on every query</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-slate-900 dark:text-white">Database Concurrency</span>
            <span className="text-slate-500">Prisma Interactive ACID Transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
