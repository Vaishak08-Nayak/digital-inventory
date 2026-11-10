import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Offer } from '../types';
import { Percent, Plus, Calendar, Tag, CheckCircle, X } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eligibleCategories, setEligibleCategories] = useState('Staples & Grains, Oils & Dairy');

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      setOffers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const catList = eligibleCategories.split(',').map((c) => c.trim()).filter(Boolean);
      await api.post('/offers', {
        title,
        description: description || undefined,
        discountType,
        discountValue: parseFloat(discountValue),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        eligibleCategories: catList,
      });

      setFormSuccess('Offer created and dispatched to eligible customer notification queues!');
      setShowModal(false);
      setTitle('');
      setDescription('');
      setDiscountValue('');
      setStartDate('');
      setEndDate('');
      setTimeout(() => setFormSuccess(''), 5000);
      loadOffers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create offer');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Discounts & Promotional Offers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create festival deals, category discounts, and notify opted-in customers automatically.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 btn-3d-primary flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" /> Create Store Offer
        </button>
      </div>

      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-400 text-xs">Loading offers...</div>
        ) : offers.length > 0 ? (
          offers.map((off) => (
            <div
              key={off.id}
              className="card-3d card-3d-hover p-5 bg-white dark:bg-[#151d30] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {off.discountType === 'PERCENTAGE' ? `${off.discountValue}% OFF` : `₹${off.discountValue} FLAT OFF`}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    off.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {off.isActive ? 'Active' : 'Expired'}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">{off.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{off.description || 'Valid on all eligible items'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  Valid:{' '}
                  <strong>{new Date(off.startDate).toLocaleDateString('en-IN')}</strong> to{' '}
                  <strong>{new Date(off.endDate).toLocaleDateString('en-IN')}</strong>
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {off.eligibleCategories?.length || 0} categories
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-400 text-xs">
            No active promotional offers. Click "Create Store Offer" to launch a campaign.
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md card-3d p-6 bg-white dark:bg-[#151d30]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Kirana Offer</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleCreateOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ugadi Festival Special Discount"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description / Banner Text</label>
                <textarea
                  rows={2}
                  placeholder="Flat discount on staples, Nandini ghee and masalas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 10 or 50"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Eligible Categories (comma separated)</label>
                <input
                  type="text"
                  value={eligibleCategories}
                  onChange={(e) => setEligibleCategories(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 btn-3d-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 btn-3d-primary font-bold"
                >
                  {formLoading ? 'Publishing...' : 'Launch Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
