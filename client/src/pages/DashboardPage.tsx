import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Eye,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/reports/dashboard?timeframe=${timeframe}`);
      setData(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeframe]);

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    allOrdersCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Store Performance Ledger
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time Kirana analytics, inventory indicators, and active orders pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Filter Pills */}
          <div className="p-1 rounded-xl bg-[#0c1018] border border-slate-800 flex items-center text-xs font-mono">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${timeframe === t
                    ? 'bg-rose-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="keycap-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Sale / POS
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {/* Modern Developer-Tool Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="card-3d card-3d-hover p-5 relative overflow-hidden bg-gradient-to-br from-[#0e131e] to-[#121826]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm border border-rose-500/20">
              ₹
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-white mt-3">
            ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Net settled sales in {timeframe}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card-3d card-3d-hover p-5 relative overflow-hidden bg-gradient-to-br from-[#0e131e] to-[#121826]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Orders Processed
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-white mt-3">{stats.totalOrders}</p>
          <p className="text-xs font-mono text-slate-400 mt-2">
            {stats.allOrdersCount} lifetime store orders
          </p>
        </div>

        {/* Total Products */}
        <div className="card-3d card-3d-hover p-5 relative overflow-hidden bg-gradient-to-br from-[#0e131e] to-[#121826]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Active Inventory
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-white mt-3">{stats.totalProducts}</p>
          <p className="text-xs font-mono text-slate-400 mt-2">
            Catalogued SKUs in Kirana ledger
          </p>
        </div>

        {/* Stock Availability Breakdown: Green / Amber / Rose */}
        <div className="card-3d card-3d-hover p-5 relative overflow-hidden bg-[#0d111a]">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Stock Availability
          </span>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
            {/* Green: Available */}
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1 animate-pulse" />
              <p className="text-base font-black font-mono text-emerald-300">
                {stats.availableProducts}
              </p>
              <span className="text-[9px] font-bold text-emerald-400 uppercase">Available</span>
            </div>

            {/* Amber: Low Stock */}
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/60 text-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 mx-auto mb-1" />
              <p className="text-base font-black font-mono text-amber-300">
                {stats.lowStockProducts}
              </p>
              <span className="text-[9px] font-bold text-amber-400 uppercase">Low</span>
            </div>

            {/* Rose: Out of Stock */}
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/60 text-center">
              <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto mb-1" />
              <p className="text-base font-black font-mono text-rose-300">
                {stats.outOfStockProducts}
              </p>
              <span className="text-[9px] font-bold text-rose-400 uppercase">Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Out-of-Stock Alert Banner with Direct Action */}
      {stats.outOfStockProducts > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-transparent border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-200">
                Attention: {stats.outOfStockProducts} Product(s) Depleted
              </h4>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Customers cannot order items with zero stock. Replenish immediately or move to Bin.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/inventory?stockStatus=OUT_OF_STOCK')}
            className="keycap-btn-primary text-xs py-1.5 px-3 self-start sm:self-auto cursor-pointer"
          >
            Review Out-of-Stock SKUs
          </button>
        </div>
      )}

      {/* Sales Trend Recharts Area Chart */}
      <div className="card-3d p-6 bg-[#0a0d14] border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-white">
              Sales Performance & Revenue Trend
            </h3>
            <p className="text-xs font-mono text-slate-400">Live ledger sales flow ({timeframe})</p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/60">
            INR (₹)
          </span>
        </div>

        <div className="h-64 w-full">
          {data?.salesChart && data.salesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="warmRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" opacity={0.6} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0a0d14',
                    borderRadius: '10px',
                    color: '#fff',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#warmRevenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
              No sales recorded for this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card-3d p-6 bg-[#0a0d14] border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-white">Recent Store Orders</h3>
            <p className="text-xs font-mono text-slate-400">Live order pipeline with delivery deadlines & remaining time</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs font-mono font-bold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Remaining Time</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-bold text-rose-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-white font-sans">
                          {ord.customer?.name || 'Walk-in Customer'}
                        </p>
                        <p className="text-[10px] text-slate-400">{ord.customer?.phone || 'Direct Sale'}</p>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">
                      {ord.items?.length || 0} items
                    </td>
                    <td className="py-3 font-bold text-white">
                      ₹{ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${ord.status === 'DELIVERED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : ord.status === 'CANCELLED'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {ord.deliveryDeadline && ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' ? (
                        <div
                          className={`flex items-center gap-1.5 text-[11px] ${ord.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {ord.isOverdue
                              ? `Overdue (${Math.abs(ord.remainingMinutes)}m ago)`
                              : `${ord.remainingMinutes}m left`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/orders?orderId=${ord.id}`)}
                        className="p-1.5 rounded-lg border border-slate-700 hover:bg-white/10 text-slate-300 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 text-xs font-mono">
                    No orders recorded yet. Click "New Sale" to create your first order.
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

export default DashboardPage;
