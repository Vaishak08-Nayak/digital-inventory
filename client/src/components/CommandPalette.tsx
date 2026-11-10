import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Search,
  ShoppingCart,
  Boxes,
  Package,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  Command,
  X,
  AlertTriangle,
  Tag,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadQuickItems();
    }
  }, [isOpen]);

  const loadQuickItems = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 8 } });
      setProducts(res.data.data || []);
    } catch {
      // silent
    }
  };

  const navActions = [
    { title: 'Open POS / New Sale', path: '/orders', icon: ShoppingCart, tag: 'Sale' },
    { title: 'View Inventory & Stock Adjust', path: '/inventory', icon: Boxes, tag: 'Stock' },
    { title: 'Product Catalog & Barcodes', path: '/products', icon: Package, tag: 'Catalog' },
    { title: 'Sales Performance & Analytics', path: '/reports', icon: BarChart3, tag: 'Report' },
    { title: 'Customer Ledger & Accounts', path: '/customers', icon: Users, tag: 'CRM' },
    { title: 'Store Settings & Staff', path: '/settings', icon: Settings, tag: 'Config' },
  ];

  const filteredNav = navActions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.barcode && p.barcode.includes(query)) ||
      (p.nameKn && p.nameKn.includes(query))
  );

  const totalItems = filteredNav.length + filteredProducts.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalItems]);

  const executeSelected = () => {
    if (selectedIndex < filteredNav.length) {
      const act = filteredNav[selectedIndex];
      if (act) {
        navigate(act.path);
        onClose();
      }
    } else {
      const prodIndex = selectedIndex - filteredNav.length;
      const prod = filteredProducts[prodIndex];
      if (prod) {
        navigate(`/products?search=${encodeURIComponent(prod.name)}`);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md transition-all">
      <div
        className="glass-launcher-mockup w-full max-w-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Launcher Top Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-rose-500/20 bg-[#0a0d14]/90">
          <Search className="w-5 h-5 text-rose-500 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, product barcode, or SKU query..."
            className="flex-1 bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <span className="keycap-badge">ESC</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {/* Quick Actions Header */}
          {filteredNav.length > 0 && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick Navigation & Commands</span>
              <span className="font-mono text-[9px] text-rose-400">⌘1-6</span>
            </div>
          )}

          {filteredNav.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected ? 'active-launcher-row text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-[#151c29] text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182132] text-slate-400 border border-slate-700/60">
                    {item.tag}
                  </span>
                  {isSelected && <span className="keycap-badge">↵ Jump</span>}
                </div>
              </div>
            );
          })}

          {/* Product SKUs header */}
          {filteredProducts.length > 0 && (
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Matching Inventory SKUs</span>
              <span className="font-mono text-[9px] text-amber-400">Barcode Index</span>
            </div>
          )}

          {filteredProducts.map((p, pIdx) => {
            const actualIdx = filteredNav.length + pIdx;
            const isSelected = selectedIndex === actualIdx;
            return (
              <div
                key={p.id}
                onClick={() => {
                  navigate(`/products?search=${encodeURIComponent(p.name)}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(actualIdx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isSelected ? 'active-launcher-row text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#151c29] text-slate-400'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {p.nameKn && <span className="text-xs text-rose-400/80">{p.nameKn}</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Barcode: {p.barcode || 'N/A'} • Stock: {p.quantity} {p.unitType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    ₹{p.sellingPrice.toFixed(2)}
                  </span>
                  {isSelected && <span className="keycap-badge">↵ View</span>}
                </div>
              </div>
            );
          })}

          {totalItems === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commands or inventory SKUs found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-[#080b12] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <span className="keycap-badge mr-1">↑↓</span>Navigate
            </span>
            <span>
              <span className="keycap-badge mr-1">↵</span>Select
            </span>
            <span>
              <span className="keycap-badge mr-1">Esc</span>Close
            </span>
          </div>
          <span className="text-rose-400/80">KIRANA TERMINAL v2.4</span>
        </div>
      </div>
    </div>
  );
};

