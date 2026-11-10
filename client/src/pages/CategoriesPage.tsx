import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tags, Plus, Package, Layers, X, Check } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [nameKn, setNameKn] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📦');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      await api.post('/categories', { name, nameKn, description, icon });
      setSuccess(`Category "${name}" created.`);
      setShowAddModal(false);
      setName('');
      setNameKn('');
      setDescription('');
      setTimeout(() => setSuccess(''), 3500);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Kirana Product Categories
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Organize inventory by localized grocery categories with bilingual Kannada classification.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="keycap-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs font-mono font-semibold text-emerald-300">
          {success}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="card-3d card-3d-hover p-5 bg-[#0a0d14] border border-slate-800">
              <div className="flex items-start justify-between">
                <div className="text-3xl mb-3">{cat.icon || '📦'}</div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950/40 text-rose-400 border border-rose-900/60">
                  {cat.itemsCount || 0} SKUs
                </span>
              </div>

              <h3 className="font-bold text-base text-white">{cat.name}</h3>
              {cat.nameKn && (
                <p className="text-xs font-semibold text-rose-400 mt-0.5">
                  {cat.nameKn}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-2">{cat.description || 'General grocery department.'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel-dark w-full max-w-md p-6 border border-rose-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Kirana Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && <div className="mt-3 p-2 rounded bg-rose-950/40 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleCreateCategory} className="space-y-3.5 mt-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Snacks & Namkeen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b12] border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kannada Name (ಕನ್ನಡ ಹೆಸರು)</label>
                <input
                  type="text"
                  placeholder="e.g. ತಿಂಡಿ ತಿನಿಸುಗಳು"
                  value={nameKn}
                  onChange={(e) => setNameKn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b12] border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Emoji Icon</label>
                <input
                  type="text"
                  placeholder="e.g. 🍪"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b12] border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of items included"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080b12] border border-slate-800 text-white focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-3d-secondary px-3 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="keycap-btn-primary px-4 py-2 text-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
