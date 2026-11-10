import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Order, Customer } from '../types';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Search,
  Printer,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // POS / New Order Drawer / State
  const [showPOS, setShowPOS] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posCustomerAddress, setPosCustomerAddress] = useState('');
  const [posDeliveryDeadline, setPosDeliveryDeadline] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [posDiscount, setPosDiscount] = useState('0');
  const [posNotes, setPosNotes] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posError, setPosError] = useState('');

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, custRes] = await Promise.all([
        api.get('/orders', { params: { status: statusFilter || undefined, search } }),
        api.get('/products', { params: { limit: 100 } }),
        api.get('/customers', { params: { limit: 100 } }),
      ]);
      setOrders(ordRes.data.data);
      setProducts(prodRes.data.data);
      setCustomers(custRes.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity + 1 > product.quantity) {
        alert(`Cannot add more than available stock (${product.quantity} ${product.unitType})`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      if (product.quantity <= 0) {
        alert('Product is Out of Stock.');
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId: string, qty: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (qty <= 0) {
      setCart(cart.filter((i) => i.product.id !== productId));
    } else if (qty > item.product.quantity) {
      alert(`Only ${item.product.quantity} ${item.product.unitType} available in stock.`);
    } else {
      setCart(cart.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const discountVal = Math.min(subtotal, Math.max(0, parseFloat(posDiscount) || 0));
  const finalTotal = Math.max(0, subtotal - discountVal);

  const handlePOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setPosError('Please add at least one product to the cart.');
      return;
    }
    setPosError('');
    setPosLoading(true);

    try {
      const payload = {
        customerName: posCustomerName || 'Walk-in Customer',
        customerPhone: posCustomerPhone || undefined,
        customerAddress: posCustomerAddress || undefined,
        items: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
          unitPrice: c.product.sellingPrice,
        })),
        discountAmount: discountVal,
        paymentMethod: posPaymentMethod,
        deliveryDeadline: posDeliveryDeadline ? new Date(posDeliveryDeadline).toISOString() : undefined,
        deliveryAddress: posCustomerAddress || undefined,
        notes: posNotes || undefined,
      };

      const res = await api.post('/orders', payload);
      const createdOrder = res.data.data;

      // Celebrate sale!
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      // Open receipt modal
      setReceiptOrder(createdOrder);

      // Reset cart and fields
      setCart([]);
      setPosCustomerName('');
      setPosCustomerPhone('');
      setPosCustomerAddress('');
      setPosDeliveryDeadline('');
      setPosDiscount('0');
      setPosNotes('');
      setShowPOS(false);

      loadData();
    } catch (err: any) {
      setPosError(err.message || 'Order creation failed.');
    } finally {
      setPosLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Sales & Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Kirana POS terminal, multi-product order creation, and delivery deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowPOS(true)}
          className="px-4 py-2.5 btn-3d-primary flex items-center gap-2 text-xs"
        >
          <ShoppingCart className="w-4 h-4" /> Open POS Billing Terminal
        </button>
      </div>

      {/* Orders Filter */}
      <div className="card-3d p-4 bg-white dark:bg-[#151d30] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders by order number, customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled (Restored)</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="card-3d p-6 bg-white dark:bg-[#151d30]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer Details</th>
                <th className="pb-3">Items Summary</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Delivery Deadline</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading shop orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {ord.customer?.name || 'Walk-in'}
                        </p>
                        <p className="text-[11px] text-slate-400">{ord.customer?.phone || 'Direct Checkout'}</p>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {ord.items.map((it) => `${it.productName} (${it.quantity})`).join(', ')}
                    </td>
                    <td className="py-3.5 font-black text-slate-900 dark:text-white">
                      ₹{ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {ord.payments?.[0]?.method || 'CASH'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY_FOR_DELIVERY">READY FOR DELIVERY</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED (Restores Stock)</option>
                        <option value="RETURNED">RETURNED</option>
                      </select>
                    </td>
                    <td className="py-3.5">
                      {ord.deliveryDeadline && ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' ? (
                        <div
                          className={`flex items-center gap-1 font-semibold text-[11px] ${
                            ord.isOverdue ? 'text-red-500 font-bold' : 'text-slate-500'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {ord.isOverdue
                              ? `Overdue (${Math.abs(ord.remainingMinutes || 0)}m ago)`
                              : `${ord.remainingMinutes}m remaining`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setReceiptOrder(ord)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                        title="Print / View Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No sales orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Billing Terminal Modal / Fullscreen Drawer */}
      {showPOS && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-5xl h-[92vh] card-3d bg-white dark:bg-[#151d30] flex flex-col overflow-hidden shadow-2xl">
            {/* POS Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  POS
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Kirana Fast Billing Terminal
                  </h3>
                  <p className="text-[11px] text-slate-500">Add products, calculate discounts, and print bills</p>
                </div>
              </div>
              <button onClick={() => setShowPOS(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {posError && (
              <div className="mx-4 mt-3 p-3 bg-red-50 text-red-600 text-xs rounded-xl font-semibold">
                {posError}
              </div>
            )}

            {/* POS Body Grid: Product Picker (Left) & Cart / Bill Summary (Right) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Product Picker */}
              <div className="flex-1 p-4 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  1. Select Kirana Items (Click to add)
                </span>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1 custom-scrollbar">
                  {products
                    .filter((p) => !p.isArchived)
                    .map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => addToCart(prod)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-900/60 text-left transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {prod.name}
                          </p>
                          {prod.nameKn && (
                            <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                              {prod.nameKn}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900 dark:text-white">
                            ₹{prod.sellingPrice.toFixed(2)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              prod.quantity > 0 ? 'text-slate-400' : 'text-rose-500'
                            }`}
                          >
                            {prod.quantity > 0 ? `${prod.quantity} ${prod.unitType}` : 'Out of Stock'}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Cart & Customer Checkout */}
              <div className="w-full md:w-96 p-4 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  2. Cart & Customer Details ({cart.length} items)
                </span>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            ₹{item.product.sellingPrice} × {item.quantity} = ₹
                            {(item.product.sellingPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max={item.product.quantity}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartQty(item.product.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-14 px-1.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, 0)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Cart is empty. Click any product on the left to add.
                    </div>
                  )}
                </div>

                {/* Customer & Billing Form */}
                <form onSubmit={handlePOSSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (e.g. 9880098800)"
                      value={posCustomerPhone}
                      onChange={(e) => setPosCustomerPhone(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={posDiscount}
                        onChange={(e) => setPosDiscount(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                        Payment Method
                      </label>
                      <select
                        value={posPaymentMethod}
                        onChange={(e) => setPosPaymentMethod(e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="CASH">Cash (ನಗದು)</option>
                        <option value="UPI">UPI (GPay/PhonePe)</option>
                        <option value="CARD">Card / POS</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                      Delivery Deadline (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={posDeliveryDeadline}
                      onChange={(e) => setPosDeliveryDeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Calculations */}
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount</span>
                        <span>- ₹{discountVal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1 border-t border-indigo-200/80 dark:border-indigo-800">
                      <span>Final Payable</span>
                      <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={posLoading || cart.length === 0}
                    className="w-full py-2.5 btn-3d-primary text-xs font-bold disabled:opacity-50"
                  >
                    {posLoading ? 'Completing Sale...' : `Complete Sale (₹${finalTotal.toFixed(2)})`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Receipt Printable Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm card-3d p-6 bg-white dark:bg-[#151d30] font-mono text-xs">
            <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h2 className="font-black text-base uppercase text-slate-900 dark:text-white">
                Sri Manjunatha Provision Store
              </h2>
              <p className="text-[11px] text-slate-500">14th Cross, Malleshwaram, Bengaluru</p>
              <p className="text-[11px] text-slate-500">Phone: +91 98450 12345</p>
              <p className="mt-2 text-[11px] font-bold text-indigo-600">INVOICE: {receiptOrder.orderNumber}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(receiptOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-[11px]">
                <strong>Customer:</strong> {receiptOrder.customer?.name || 'Walk-in'}
              </p>
              {receiptOrder.customer?.phone && (
                <p className="text-[11px]">
                  <strong>Phone:</strong> {receiptOrder.customer.phone}
                </p>
              )}
            </div>

            <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
              {receiptOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.productName} × {it.quantity}
                  </span>
                  <span>₹{it.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="py-3 space-y-1 font-bold">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{receiptOrder.subtotal.toFixed(2)}</span>
              </div>
              {receiptOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>- ₹{receiptOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-900 dark:text-white pt-1">
                <span>TOTAL AMOUNT</span>
                <span>₹{receiptOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-slate-400">
              <p>Thank you for shopping at Sri Manjunatha Kirana!</p>
              <p>ಧನ್ಯವಾದಗಳು, ಮತ್ತೆ ಬನ್ನಿ</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 btn-3d-primary flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" /> Print Bill
              </button>
              <button
                onClick={() => setReceiptOrder(null)}
                className="flex-1 py-2 btn-3d-secondary text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
