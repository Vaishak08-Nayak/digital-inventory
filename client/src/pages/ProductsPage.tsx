import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import {
  Package,
  Plus,
  Search,
  Barcode,
  Edit,
  Trash2,
  Upload,
  X,
  Filter,
  CheckCircle,
  Eye,
  IndianRupee,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'sellingPrice' | 'quantity' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    id: '',
    name: '',
    nameKn: '',
    brand: '',
    barcode: '',
    categoryName: 'Staples & Grains',
    groceryType: 'Grains',
    unitType: 'KG',
    isLooseItem: false,
    supplier: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    reorderLevel: '10',
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          search,
          category: categoryFilter || undefined,
          sortBy,
          sortOrder,
          limit: 100,
        },
      });
      setProducts(res.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
      return null;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseFloat(formData.quantity),
        reorderLevel: parseFloat(formData.reorderLevel),
      };

      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
        setNotification(`Product "${payload.name}" updated successfully.`);
      } else {
        await api.post('/products', payload);
        setNotification(`Product "${payload.name}" created successfully.`);
      }

      setShowAddModal(false);
      setEditProduct(null);
      setImageFile(null);
      resetForm();
      setTimeout(() => setNotification(''), 4000);
      loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      nameKn: '',
      brand: '',
      barcode: '',
      categoryName: 'Staples & Grains',
      groceryType: 'Grains',
      unitType: 'KG',
      isLooseItem: false,
      supplier: '',
      description: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      reorderLevel: '10',
      imageUrl: '',
    });
  };

  const handleMoveToBin = async (productId: string, name: string) => {
    if (!confirm(`Are you sure you want to move "${name}" to the Bin?`)) return;
    try {
      await api.delete(`/products/${productId}`);
      setNotification(`Moved "${name}" to Bin.`);
      setTimeout(() => setNotification(''), 4000);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to move to Bin.');
    }
  };

  const startEdit = (prod: Product) => {
    setEditProduct(prod);
    setFormData({
      id: prod.id,
      name: prod.name,
      nameKn: prod.nameKn || '',
      brand: prod.brand || '',
      barcode: prod.barcode || '',
      categoryName: prod.categoryName || 'Staples & Grains',
      groceryType: prod.groceryType || '',
      unitType: prod.unitType || 'KG',
      isLooseItem: prod.isLooseItem,
      supplier: prod.supplier || '',
      description: prod.description || '',
      purchasePrice: prod.purchasePrice.toString(),
      sellingPrice: prod.sellingPrice.toString(),
      quantity: prod.quantity.toString(),
      reorderLevel: prod.reorderLevel.toString(),
      imageUrl: prod.imageUrl || '',
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Store Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage products, localized Kannada titles, barcodes, suppliers, and retail pricing.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditProduct(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 btn-3d-primary flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" /> Add New Kirana Item
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-3d p-4 bg-white dark:bg-[#151d30] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, Kannada name, brand, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            <option value="Staples & Grains">Staples & Grains (ಧಾನ್ಯಗಳು)</option>
            <option value="Oils & Dairy">Oils & Dairy (ತುಪ್ಪ & ಎಣ್ಣೆ)</option>
            <option value="Spices & Masalas">Spices & Masalas (ಮಸಾಲೆ)</option>
            <option value="Beverages">Beverages (ಟೀ & ಕಾಫಿ)</option>
            <option value="Personal Care">Personal Care (ಸೋಪ್ & ಆರೈಕೆ)</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb as any);
              setSortOrder(so as any);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="createdAt-desc">Newest Added</option>
            <option value="sellingPrice-asc">Price: Low to High</option>
            <option value="sellingPrice-desc">Price: High to Low</option>
            <option value="quantity-asc">Quantity: Low to High</option>
            <option value="quantity-desc">Quantity: High to Low</option>
          </select>
        </div>
      </div>

      {/* 3D Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading Kirana products...
          </div>
        ) : products.length > 0 ? (
          products.map((prod) => (
            <div
              key={prod.id}
              className="card-3d card-3d-hover p-4 bg-white dark:bg-[#151d30] flex flex-col justify-between"
            >
              <div>
                {/* Category & Status Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {prod.categoryName || 'General'}
                  </span>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      prod.stockStatus === 'AVAILABLE'
                        ? 'bg-emerald-500'
                        : prod.stockStatus === 'LOW_STOCK'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    title={prod.stockStatus}
                  />
                </div>

                {/* Product Name (Bilingual) */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {prod.name}
                </h3>
                {prod.nameKn && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {prod.nameKn}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">RETAIL PRICE</span>
                    <span className="font-black text-base text-slate-900 dark:text-white">
                      ₹{prod.sellingPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400"> /{prod.unitType}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">STOCK</span>
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                      {prod.quantity} {prod.unitType}
                    </span>
                  </div>
                </div>

                {/* Barcode & Supplier */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono flex items-center gap-1">
                    <Barcode className="w-3 h-3 text-slate-400" />
                    {prod.barcode || 'N/A'}
                  </span>
                  <span className="truncate max-w-[120px]">{prod.brand || prod.supplier || 'Kirana'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 justify-end">
                <button
                  onClick={() => setViewProduct(prod)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => startEdit(prod)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  title="Edit Product"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveToBin(prod.id, prod.name)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                  title="Move to Bin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No products found matching your search.
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto card-3d p-6 bg-white dark:bg-[#151d30] custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editProduct ? 'Edit Product' : 'Add New Kirana Product'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sona Masuri Rice (Raw)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kannada Localized Name (ಕನ್ನಡ ಹೆಸರು)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ"
                    value={formData.nameKn}
                    onChange={(e) => setFormData({ ...formData, nameKn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Staples & Grains">Staples & Grains</option>
                    <option value="Oils & Dairy">Oils & Dairy</option>
                    <option value="Spices & Masalas">Spices & Masalas</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Barcode Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 890123456701"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Type *
                  </label>
                  <select
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="POUCH">POUCH</option>
                    <option value="PKT">PKT (Packets)</option>
                    <option value="PACK">PACK</option>
                    <option value="LTR">LTR (Litres)</option>
                    <option value="PCS">PCS (Pieces)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="48.00"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="58.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="250"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="50"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Mill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sri Lakshmi Rice Mill, Mandya"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Image Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 btn-3d-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 btn-3d-primary text-xs"
                >
                  {formLoading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md card-3d p-6 bg-white dark:bg-[#151d30]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Product Overview</h3>
              <button onClick={() => setViewProduct(null)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-base text-slate-900 dark:text-white">{viewProduct.name}</p>
                {viewProduct.nameKn && (
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{viewProduct.nameKn}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                  <span className="font-bold">{viewProduct.categoryName || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BARCODE</span>
                  <span className="font-mono font-bold">{viewProduct.barcode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COST PRICE</span>
                  <span className="font-bold">₹{viewProduct.purchasePrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SELLING PRICE</span>
                  <span className="font-bold text-emerald-600">₹{viewProduct.sellingPrice.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">SUPPLIER</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{viewProduct.supplier || 'N/A'}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">DESCRIPTION</span>
                <p className="text-slate-600 dark:text-slate-400">{viewProduct.description || 'No description.'}</p>
              </div>
            </div>

            <button
              onClick={() => setViewProduct(null)}
              className="w-full mt-4 py-2 btn-3d-secondary text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
