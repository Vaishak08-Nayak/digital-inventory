import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Package,
  Users,
  Printer,
  ShoppingBag,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales', {
        params: {
          timeframe,
          startDate: timeframe === 'custom' ? startDate : undefined,
          endDate: timeframe === 'custom' ? endDate : undefined,
        },
      });
      setReportData(res.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [timeframe]);

  const handleExportCsv = () => {
    const url = `/api/reports/export-csv?timeframe=${timeframe}${
      startDate ? `&startDate=${startDate}` : ''
    }${endDate ? `&endDate=${endDate}` : ''}`;
    window.open(url, '_blank');
  };

  const summary = reportData?.summary || { totalRevenue: 0, totalOrders: 0 };
  const bestSellers = reportData?.bestSellingProducts || [];
  const categories = reportData?.salesByCategory || [];
  const customerSales = reportData?.salesByCustomer || [];
  const transactions = reportData?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Sales & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store performance, best-selling provision staples, and customer lifetime expenditure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 btn-3d-secondary flex items-center gap-1.5 text-xs font-bold"
          >
            <Download className="w-4 h-4" /> Export CSV Data
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 btn-3d-primary flex items-center gap-1.5 text-xs font-bold"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Timeframe Bar */}
      <div className="card-3d p-4 bg-white dark:bg-[#151d30] flex flex-wrap items-center justify-between gap-3">
        <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center text-xs font-semibold">
          {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                timeframe === t
                  ? 'bg-white dark:bg-[#151d30] text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {timeframe === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            />
            <button onClick={loadReport} className="px-3 py-1.5 btn-3d-primary text-xs font-bold">
              Filter
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-3d p-5 bg-white dark:bg-[#151d30]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Period Revenue</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{summary.totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Excludes cancelled & returned orders</span>
        </div>

        <div className="card-3d p-5 bg-white dark:bg-[#151d30]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders Fulfilled</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{summary.totalOrders}</p>
          <span className="text-[11px] text-slate-400">Completed Kirana transactions</span>
        </div>

        <div className="card-3d p-5 bg-white dark:bg-[#151d30]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Order Value</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹
            {summary.totalOrders > 0
              ? (summary.totalRevenue / summary.totalOrders).toFixed(2)
              : '0.00'}
          </p>
          <span className="text-[11px] text-slate-400">Average basket spending</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="card-3d p-5 bg-white dark:bg-[#151d30]">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Top Performing Products (By Quantity)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Highest volume items sold</p>

          <div className="space-y-2.5">
            {bestSellers.length > 0 ? (
              bestSellers.map((prod: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      {prod.quantity} units sold
                    </span>
                    <span className="text-[10px] text-slate-400">₹{prod.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No sales data for this period.</p>
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="card-3d p-5 bg-white dark:bg-[#151d30]">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Sales by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Revenue distribution across provisions</p>

          <div className="space-y-2.5">
            {categories.length > 0 ? (
              categories.map((cat: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{cat.count} total items</span>
                  </div>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    ₹{cat.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No category sales recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Transactions Table */}
      <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          Complete Transaction Journal
        </h3>
        <p className="text-xs text-slate-500 mb-4">Audit records of every invoice generated</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Products Purchased</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {transactions.length > 0 ? (
                transactions.map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-indigo-600">{t.orderNumber}</td>
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3">
                      <p className="font-bold">{t.customerName}</p>
                      <p className="text-[11px] text-slate-400">{t.customerPhone}</p>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 max-w-sm truncate">{t.items}</td>
                    <td className="py-3 font-bold text-emerald-600">{t.status}</td>
                    <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                      ₹{t.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No transactions match criteria.
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
