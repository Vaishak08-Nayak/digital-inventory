import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Trash2, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const BinPage: React.FC = () => {
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const loadBin = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bin');
      setArchivedProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBin();
  }, []);

  const handleRestore = async (id: string, name: string) => {
    setActionError('');
    try {
      await api.post(`/bin/${id}/restore`);
      setActionSuccess(`Restored "${name}" back into active store inventory.`);
      setTimeout(() => setActionSuccess(''), 4000);
      loadBin();
    } catch (err: any) {
      setActionError(err.message || 'Failed to restore item');
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY delete "${name}"? This cannot be undone. Products with prior sales orders will be protected.`
      )
    )
      return;

    setActionError('');
    try {
      const res = await api.delete(`/bin/${id}`);
      setActionSuccess(res.data?.message || 'Product permanently deleted.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadBin();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Inventory Bin & Archive
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archived and out-of-stock items safely quarantined without losing historical sales ledgers.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Info notice about history preservation */}
      <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-300">
        <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
        <p>
          <strong>Accounting Protection Rule:</strong> Items stored in the Bin are hidden from customer order screens but remain linked to previous receipts so your revenue calculations, GST reports, and customer order histories remain 100% accurate.
        </p>
      </div>

      {/* Bin Items Table */}
      <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Archived Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Last Recorded Stock</th>
                <th className="pb-3">Selling Price</th>
                <th className="pb-3">Archived At</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading bin contents...
                  </td>
                </tr>
              ) : archivedProducts.length > 0 ? (
                archivedProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                      {prod.nameKn && (
                        <p className="text-[11px] font-semibold text-slate-400">{prod.nameKn}</p>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-500">{prod.categoryName || 'General'}</td>
                    <td className="py-3.5 font-bold text-rose-600">
                      {prod.quantity} {prod.unitType}
                    </td>
                    <td className="py-3.5 font-bold">₹{prod.sellingPrice.toFixed(2)}</td>
                    <td className="py-3.5 text-slate-400">
                      {prod.archivedAt ? new Date(prod.archivedAt).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleRestore(prod.id, prod.name)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200 text-xs inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(prod.id, prod.name)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-200 text-xs inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Bin is empty. No archived products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
