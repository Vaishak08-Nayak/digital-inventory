import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Boxes,
  Package,
  Tags,
  ShoppingCart,
  Users,
  BarChart3,
  Percent,
  Bell,
  Trash2,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CommandPalette } from '../components/CommandPalette';

export const DashboardLayout: React.FC = () => {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [quickBarcode, setQuickBarcode] = useState('');
  const [barcodeSearchError, setBarcodeSearchError] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global shortcut for ⌘K or Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?unread=true');
        setUnreadNotifications(res.data?.unreadCount || 0);
      } catch {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleBarcodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBarcode.trim()) return;
    setBarcodeSearchError('');
    try {
      const res = await api.get(`/products/barcode/${encodeURIComponent(quickBarcode.trim())}`);
      if (res.data?.data) {
        navigate(`/products?search=${encodeURIComponent(quickBarcode.trim())}`);
        setQuickBarcode('');
      }
    } catch (err: any) {
      setBarcodeSearchError('No product found with this barcode');
      setTimeout(() => setBarcodeSearchError(''), 3000);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory Ledger', path: '/inventory', icon: Boxes },
    { name: 'Product Catalog', path: '/products', icon: Package },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Orders / POS', path: '/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Sales Reports', path: '/reports', icon: BarChart3 },
    { name: 'Offers & Promos', path: '/offers', icon: Percent },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
    { name: 'Bin Archive', path: '/bin', icon: Trash2 },
    { name: 'Business Profile', path: '/business-profile', icon: Store },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080a] text-slate-100 selection:bg-rose-500/30 selection:text-white">
      {/* Global Interactive Command Launcher Palette */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Modern Developer-Tool Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#0a0d14] border-r border-slate-800/80 shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-30 transition-all">
        {/* Brand Header with Warm Glowing Emblem */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-[0_0_18px_rgba(244,63,94,0.45)] text-white font-black text-lg">
              KC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight text-white truncate">
                  {business?.name || 'Kirana Core'}
                </h1>
              </div>
              <p className="text-[11px] font-mono font-medium text-rose-400 truncate">
                ಡಿಜಿಟಲ್ ಕಿರಾಣಿ • {business?.location?.split(',')[2] || 'Karnataka'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launcher Trigger in Sidebar */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#121723] hover:bg-[#182030] border border-slate-800 text-xs text-slate-400 hover:text-white transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Quick Launcher</span>
            </div>
            <span className="keycap-badge text-[9px]">⌘K</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${isActive
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)] translate-x-1 font-bold'
                    : 'text-slate-400 hover:bg-[#141a27] hover:text-slate-200 hover:translate-x-0.5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500 text-slate-950 rounded-full shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#080b11]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600/20 to-amber-500/20 text-rose-400 font-bold flex items-center justify-center border border-rose-500/30 text-xs font-mono">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <span className="inline-block text-[10px] font-mono font-bold text-rose-400">
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/landing"
                title="View Hero Landing Page"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 px-6 bg-[#0a0d14]/85 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSearch} className="relative hidden sm:block w-72 md:w-80">
              <input
                type="text"
                placeholder="Scan / query barcode (e.g. 8901030384012)..."
                value={quickBarcode}
                onChange={(e) => setQuickBarcode(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl bg-[#121622] border border-slate-800 focus:outline-none focus:border-rose-500 font-mono text-white placeholder-slate-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              {barcodeSearchError && (
                <span className="absolute left-0 -bottom-4 text-[10px] text-rose-400 font-medium">
                  {barcodeSearchError}
                </span>
              )}
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Launcher Pill */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131722] hover:bg-[#1a2131] border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[11px] font-medium">Commands</span>
              <span className="keycap-badge text-[9px] py-0 px-1">⌘K</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl bg-[#121722] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Landing Hero View Link */}
            <Link
              to="/landing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400 hover:text-white hover:border-rose-500 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Aurora Hero</span>
            </Link>

            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121722] border border-slate-800 text-xs font-mono font-semibold text-amber-400">
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>INR (₹)</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-50 bg-black/70 backdrop-blur-sm flex">
            <div className="w-72 bg-[#0a0d14] border-r border-slate-800 h-full p-4 overflow-y-auto space-y-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#131722] border border-slate-800 text-xs text-white mb-2"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-rose-500" />
                  Quick Launcher
                </span>
                <span className="keycap-badge text-[10px]">⌘K</span>
              </button>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${isActive
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500 text-slate-950 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-rose-400 font-semibold text-xs rounded-xl hover:bg-rose-950/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#07080a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
