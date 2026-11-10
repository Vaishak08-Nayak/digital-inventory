import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, InventoryTransaction } from '../types';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  History,
  X,
  CheckCircle,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [stockInModal, setStockInModal] = useState<Product | null>(null);
  const [adjustModal, setAdjustModal] = useState<Product | null>(null);

  // Form states
  const [stockInQty, setStockInQty] = useState('');
  const [stockInCost, setStockInCost] = useState('');
  const [stockInNotes, setStockInNotes] = useState('');

  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const res = await api.get('/products', {
          params: { search, stockStatus: statusFilter || undefined, limit: 100 },
        });
        setProducts(res.data.data);
      } else {
        const res = await api.get('/inventory/transactions', { params: { limit: 100 } });
        setTransactions(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInModal) return;
    const qty = parseFloat(stockInQty);
    if (isNaN(qty) || qty <= 0) {
      setActionError('Quantity must be greater than zero.');
      return;
    }
    setActionError('');
    setModalLoading(true);
    try {
      await api.post('/inventory/stock-in', {
        productId: stockInModal.id,
        quantity: qty,
        costPrice: stockInCost ? parseFloat(stockInCost) : undefined,
        notes: stockInNotes || undefined,
      });
      setActionSuccess(`Successfully replenished ${qty} ${stockInModal.unitType} for ${stockInModal.name}`);
      setStockInModal(null);
      setStockInQty('');
      setStockInCost('');
      setStockInNotes('');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Stock-in failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;
    const delta = parseFloat(adjustDelta);
    if (isNaN(delta) || delta === 0) {
      setActionError('Adjustment delta cannot be 0.');
      return;
    }
    if (!adjustReason.trim()) {
      setActionError('Reason is required for manual stock adjustment.');
      return;
    }
    setActionError('');
    setModalLoading(true);
    try {
      await api.post('/inventory/adjust', {
        productId: adjustModal.id,
        quantityDelta: delta,
        reason: adjustReason.trim(),
      });
      setActionSuccess(`Successfully adjusted stock for ${adjustModal.name}`);
      setAdjustModal(null);
      setAdjustDelta('');
      setAdjustReason('');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Adjustment failed');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Inventory & Stock Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time stock levels, record replenishments, and audit every quantity change.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'stock'
                  ? 'bg-white dark:bg-[#151d30] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Stock Management
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-[#151d30] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Audit Transactions Log
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {activeTab === 'stock' ? (
        <>
          {/* Filters Bar */}
          <div className="card-3d p-4 bg-white dark:bg-[#151d30] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                placeholder="Search by product name, Kannada name, barcode, brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Stock Statuses</option>
                <option value="AVAILABLE">Available (In-Stock)</option>
                <option value="LOW_STOCK">Low Stock (Below Threshold)</option>
                <option value="OUT_OF_STOCK">Out of Stock (Zero)</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Barcode</th>
                    <th className="pb-3">Current Qty</th>
                    <th className="pb-3">Reorder Alert</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Loading inventory records...
                      </td>
                    </tr>
                  ) : products.length > 0 ? (
                    products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{prod.name}</p>
                            {prod.nameKn && (
                              <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                {prod.nameKn}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500">{prod.categoryName || 'General'}</td>
                        <td className="py-3.5 font-mono text-[11px] text-slate-400">{prod.barcode || '—'}</td>
                        <td className="py-3.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {prod.quantity}
                          </span>{' '}
                          <span className="text-[11px] text-slate-400 font-bold">{prod.unitType}</span>
                        </td>
                        <td className="py-3.5 text-slate-500">
                          {prod.reorderLevel} {prod.unitType}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                              prod.stockStatus === 'AVAILABLE'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : prod.stockStatus === 'LOW_STOCK'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                prod.stockStatus === 'AVAILABLE'
                                  ? 'bg-emerald-500'
                                  : prod.stockStatus === 'LOW_STOCK'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {prod.stockStatus === 'AVAILABLE'
                              ? 'Stock-in'
                              : prod.stockStatus === 'LOW_STOCK'
                              ? 'Low Stock'
                              : 'Stock-out'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setStockInModal(prod);
                              setStockInCost(prod.purchasePrice.toString());
                              setActionError('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all"
                          >
                            + Stock-In
                          </button>
                          <button
                            onClick={() => {
                              setAdjustModal(prod);
                              setActionError('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No products match the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Inventory Transactions Audit Log */
        <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Complete Inventory Audit History
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Immutable log of all stock purchases, customer sales, adjustments, and returns.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Quantity Delta</th>
                  <th className="pb-3">Stock Progression</th>
                  <th className="pb-3">Reference / Notes</th>
                  <th className="pb-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {new Date(txn.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {txn.product?.name || 'Item'}
                        {txn.product?.nameKn && (
                          <span className="block text-[11px] font-medium text-slate-400">
                            {txn.product.nameKn}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                            txn.type === 'STOCK_IN'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : txn.type === 'SALE'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : txn.type === 'RETURN'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3 font-black text-xs">
                        <span className={txn.quantityDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {txn.quantityDelta > 0 ? `+${txn.quantityDelta}` : txn.quantityDelta}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {txn.previousQuantity} → <strong className="text-slate-900 dark:text-white">{txn.newQuantity}</strong>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {txn.notes || txn.referenceId || '—'}
                      </td>
                      <td className="py-3 text-slate-500">{txn.performedBy?.name || 'System / Owner'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No inventory transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock-In Modal */}
      {stockInModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md card-3d p-6 bg-white dark:bg-[#151d30]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Replenish Stock</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {stockInModal.name} ({stockInModal.nameKn})
                </p>
              </div>
              <button
                onClick={() => setStockInModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">{actionError}</div>}

            <form onSubmit={handleStockInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity to Add ({stockInModal.unitType}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 50"
                  value={stockInQty}
                  onChange={(e) => setStockInQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase / Cost Price (₹ per {stockInModal.unitType})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 48.00"
                  value={stockInCost}
                  onChange={(e) => setStockInCost(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Invoice Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. APMC Mandya batch #882"
                  value={stockInNotes}
                  onChange={(e) => setStockInNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockInModal(null)}
                  className="flex-1 py-2 btn-3d-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2 btn-3d-primary text-xs"
                >
                  {modalLoading ? 'Updating...' : 'Confirm Stock-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md card-3d p-6 bg-white dark:bg-[#151d30]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Adjust Stock Quantity</h3>
                <p className="text-xs text-slate-500">
                  Current Stock: <strong className="text-slate-900 dark:text-white">{adjustModal.quantity} {adjustModal.unitType}</strong>
                </p>
              </div>
              <button
                onClick={() => setAdjustModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">{actionError}</div>}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Delta (+ to add, - to subtract) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. -2 for damage, or 5 for recount"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">
                  Resulting Stock:{' '}
                  {adjustDelta && !isNaN(parseFloat(adjustDelta))
                    ? Math.max(0, adjustModal.quantity + parseFloat(adjustDelta))
                    : adjustModal.quantity}{' '}
                  {adjustModal.unitType}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken pouch spill, physical inventory recount"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModal(null)}
                  className="flex-1 py-2 btn-3d-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2 btn-3d-primary text-xs"
                >
                  {modalLoading ? 'Saving...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
