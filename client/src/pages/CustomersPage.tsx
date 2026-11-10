import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Customer } from '../types';
import { Users, Search, Plus, Phone, Mail, MapPin, ShoppingBag, Eye, X, CheckCircle } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { search, limit: 100 } });
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/customers', { name, phone, email: email || undefined, address: address || undefined });
      setFormSuccess(`Customer "${name}" registered successfully.`);
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setTimeout(() => setFormSuccess(''), 4000);
      loadCustomers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add customer');
    }
  };

  const handleViewCustomer = async (id: string) => {
    try {
      const res = await api.get(`/customers/${id}`);
      setViewCustomer(res.data.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load customer profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Customer Relationship Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your local neighborhood customer profiles, spending history, and favorite items.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 btn-3d-primary flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" /> Register New Customer
        </button>
      </div>

      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card-3d p-4 bg-white dark:bg-[#151d30]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer by name, phone number or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers List */}
      <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Address</th>
                <th className="pb-3">Total Orders</th>
                <th className="pb-3">Total Spend</th>
                <th className="pb-3">Last Purchase</th>
                <th className="pb-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">{c.phone}</td>
                    <td className="py-3.5 text-slate-500 max-w-xs truncate">{c.address || '—'}</td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">{c.totalOrders}</td>
                    <td className="py-3.5 font-black text-indigo-600 dark:text-indigo-400">
                      ₹{c.totalSpending.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                        title="View Profile & Purchase History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No customers registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md card-3d p-6 bg-white dark:bg-[#151d30]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Register New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Murthy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9448011223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="anand@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Delivery Address</label>
                <textarea
                  placeholder="House #, Street, Malleshwaram..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 btn-3d-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 btn-3d-primary font-bold">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile & Frequent Products Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg card-3d p-6 bg-white dark:bg-[#151d30] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{viewCustomer.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{viewCustomer.phone}</p>
              </div>
              <button onClick={() => setViewCustomer(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl mb-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL ORDERS</span>
                <span className="font-black text-sm">{viewCustomer.totalOrders}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL LIFETIME SPEND</span>
                <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                  ₹{viewCustomer.totalSpending.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Frequently Purchased Items */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Frequently Purchased Items
              </h4>
              {viewCustomer.frequentProducts && viewCustomer.frequentProducts.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {viewCustomer.frequentProducts.map((fp: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between"
                    >
                      <span className="font-bold">{fp.name}</span>
                      <span className="text-[11px] text-slate-500">Ordered {fp.count} times</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No order history yet.</p>
              )}
            </div>

            <button
              onClick={() => setViewCustomer(null)}
              className="w-full py-2 btn-3d-secondary text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
