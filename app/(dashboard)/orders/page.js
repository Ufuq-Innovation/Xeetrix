"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, ShoppingBag, Clock, X, Plus, Filter,
  Search, Trash2, History, Calendar, ArrowUpDown
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // ১. ইউনিক অর্ডার আইডি জেনারেশন
  const generateOrderId = () => {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${new Date().getFullYear()}-${randomStr}`;
  };

  // States
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  
  // খরচ এখন খালি থাকবে যেন প্লেসহোল্ডার দেখা যায়
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });

  // কলাম ফিল্টার স্টেট (Google Sheet Style)
  const [filters, setFilters] = useState({ id: "", customer: "", date: "" });

  useEffect(() => {
    setMounted(true);
    setOrderId(generateOrderId());
  }, []);

  const currency = useMemo(() => {
    const curr = context?.currency;
    return (typeof curr === 'object' ? curr.symbol : curr) || "৳";
  }, [context?.currency]);

  // Data Fetching
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      return data.success ? data.orders : [];
    }
  });

  // ২. কাস্টমার অটো-সাজেশন
  const previousCustomers = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      if (o.customerPhone && !map.has(o.customerPhone)) {
        map.set(o.customerPhone, { name: o.customerName, phone: o.customerPhone });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const filteredSuggestions = useMemo(() => {
    const s = (customerInfo.phone || customerInfo.name || "").toLowerCase();
    if (!s || s.length < 2) return [];
    return previousCustomers.filter(c => c.phone.includes(s) || c.name.toLowerCase().includes(s)).slice(0, 5);
  }, [customerInfo, previousCustomers]);

  // ক্যালকুলেশন
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = Number(expenses.courier) || 0;
    const totalSell = subTotal - disc;
    return { subTotal, totalSell, netProfit: totalSell - totalCost - cour };
  }, [cart, expenses]);

  // অর্ডার সেভ মিউটেশন
  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      // ফুল ফর্ম রিসেট
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      setExpenses({ discount: '', courier: '' });
      setOrderId(generateOrderId());
      setOrderDate(new Date().toISOString().split('T')[0]);
      toast.success(t('order_successful_alert'));
    }
  });

  // ৩. অ্যাডভান্সড ফিল্টারিং লজিক (Table Filtering)
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = (o.orderId + o.customerName + o.customerPhone).toLowerCase().includes(searchTerm.toLowerCase());
      const matchId = o.orderId?.toLowerCase().includes(filters.id.toLowerCase());
      const matchCustomer = o.customerName?.toLowerCase().includes(filters.customer.toLowerCase());
      const matchDate = o.createdAt?.includes(filters.date);
      return matchSearch && matchId && matchCustomer && matchDate;
    });
  }, [orders, searchTerm, filters]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-xl">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter">
              {t('order_management')}
            </h1>
            <p className="text-slate-500 text-xs font-medium tracking-wide">Business Control Room • 2026</p>
          </div>
        </div>
        <div className="bg-[#11161D] px-5 py-2.5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="text-right border-r border-white/10 pr-4">
            <p className="text-[8px] font-bold text-slate-500 uppercase">{t('total_orders')}</p>
            <p className="text-xl font-black text-white">{orders.length}</p>
          </div>
          <Clock className="text-blue-500 opacity-50" size={20} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Bar with ID & Date */}
            <div className="absolute top-0 right-0 flex border-b border-l border-white/5 rounded-bl-3xl overflow-hidden">
               <div className="px-4 py-2 bg-blue-600/10 border-r border-white/5">
                  <span className="text-[10px] font-black text-blue-500 font-mono">#{orderId}</span>
               </div>
               <div className="px-4 py-2 bg-white/5 flex items-center gap-2">
                  <Calendar size={12} className="text-slate-500" />
                  <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} 
                    className="bg-transparent text-[10px] font-bold text-slate-300 outline-none uppercase cursor-pointer" />
               </div>
            </div>

            <div className="flex items-center gap-3 mb-10 mt-4 md:mt-0">
              <PlusCircle className="text-blue-500" size={20} />
              <h2 className="text-sm font-black text-white uppercase italic tracking-widest">{t('create_new_order')}</h2>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative" ref={suggestionRef}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('customer_name')}</label>
                  <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40" 
                    placeholder={t('customer_name')} value={customerInfo.name} onFocus={() => setShowSuggestions(true)}
                    onChange={e => { setCustomerInfo({...customerInfo, name: e.target.value}); setShowSuggestions(true); }} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('phone_number')}</label>
                  <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40" 
                    placeholder="01XXXXXXXXX" value={customerInfo.phone} onFocus={() => setShowSuggestions(true)}
                    onChange={e => { setCustomerInfo({...customerInfo, phone: e.target.value}); setShowSuggestions(true); }} />
                </div>

                {/* Suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-[100%] left-0 w-full z-50 mt-2 bg-[#1a2230] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    {filteredSuggestions.map((c, i) => (
                      <div key={i} onClick={() => { setCustomerInfo(c); setShowSuggestions(false); }} className="px-6 py-4 hover:bg-blue-600/20 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group">
                        <div><p className="text-sm font-bold text-white">{c.name}</p><p className="text-[10px] text-slate-500">{c.phone}</p></div>
                        <Plus size={14} className="text-blue-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Selector */}
              <div className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="px-4 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none"
                    value={selectedProduct.id} onChange={e => {
                      const p = inventory.find(i => i._id === e.target.value);
                      if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                    }}>
                    <option value="">{t('select_a_product')}</option>
                    {inventory.map(item => (
                      <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({t('stock')}: {item.stock})</option>
                    ))}
                  </select>
                  <input type="number" className="px-4 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none" 
                    placeholder={t('quantity')} value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Math.min(Number(e.target.value), selectedProduct.stock)})} />
                  <button onClick={() => {
                     if (!selectedProduct.id) return toast.error(t('select_a_product'));
                     const existing = cart.find(i => i.id === selectedProduct.id);
                     if ((existing?.qty || 0) + selectedProduct.qty > selectedProduct.stock) return toast.error(t('insufficient_stock_alert'));
                     setCart(existing ? cart.map(i => i.id === selectedProduct.id ? {...i, qty: i.qty + selectedProduct.qty} : i) : [...cart, {...selectedProduct}]);
                     setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
                  }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-3 flex items-center justify-center gap-2 transition-all"><Plus size={18} /> {t('add')}</button>
                </div>
                
                {/* Cart Preview */}
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                      <span className="text-sm font-bold text-white">{item.name} <span className="text-slate-500 ml-2 font-mono italic">x{item.qty}</span></span>
                      <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-slate-600 group-hover:text-red-500 transition-colors"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses - Clear Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('discount')}</label>
                  <input type="number" placeholder="0" className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none" 
                    value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('courier_cost')}</label>
                  <input type="number" placeholder="0" className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none" 
                    value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
                </div>
              </div>

              <button 
                onClick={() => createOrderMutation.mutate({ orderId, orderDate, customerName: customerInfo.name, customerPhone: customerInfo.phone, products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier), totalSell: summary.totalSell, netProfit: summary.netProfit })}
                disabled={createOrderMutation.isPending || cart.length === 0} 
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-blue-500/30 shadow-lg transition-all active:scale-[0.98]"
              >
                {createOrderMutation.isPending ? t('syncing') : t('confirm_order')}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="h-fit lg:sticky lg:top-6">
          <div className="bg-gradient-to-br from-[#11161D] to-[#1a2230] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-0"></div>
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-8 italic">{t('order_preview')}</h3>
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between text-xs font-bold"><span className="text-slate-500 uppercase">{t('total_sales')}</span><span className="text-white font-mono">{currency} {summary.totalSell.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-bold text-red-400"><span className="text-slate-500 uppercase">{t('discount')}</span><span>-{currency} {(Number(expenses.discount) || 0).toLocaleString()}</span></div>
              <div className="h-px bg-white/5"></div>
              <div><p className="text-[10px] font-black text-slate-500 uppercase mb-2">{t('net_profit')}</p><div className={`text-5xl font-black italic tracking-tighter ${summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{currency} {summary.netProfit.toLocaleString()}</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table with Google Sheet Filtering */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3"><History size={24} className="text-blue-500" /><h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t('order_history')}</h2></div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500" size={16} />
            <input placeholder={t('search_orders')} className="w-full pl-12 pr-6 py-3.5 bg-[#11161D] border border-white/5 rounded-2xl text-sm text-white outline-none focus:border-blue-500/50 transition-all shadow-xl" 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                  <th className="p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">ID <ArrowUpDown size={10} /></div>
                      <input placeholder="Filter ID" className="bg-[#1a2230] p-1.5 rounded-md border border-white/5 font-normal text-[9px] outline-none focus:border-blue-500/50" 
                        value={filters.id} onChange={e => setFilters({...filters, id: e.target.value})} />
                    </div>
                  </th>
                  <th className="p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">{t('customer')} <ArrowUpDown size={10} /></div>
                      <input placeholder="Filter Name" className="bg-[#1a2230] p-1.5 rounded-md border border-white/5 font-normal text-[9px] outline-none" 
                        value={filters.customer} onChange={e => setFilters({...filters, customer: e.target.value})} />
                    </div>
                  </th>
                  <th className="p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">Date <ArrowUpDown size={10} /></div>
                      <input type="date" className="bg-[#1a2230] p-1.5 rounded-md border border-white/5 font-normal text-[9px] outline-none cursor-pointer" 
                        value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
                    </div>
                  </th>
                  <th className="p-6">{t('product')}</th>
                  <th className="p-6 text-right">{t('amount')}</th>
                  <th className="p-6 text-right">{t('net_profit')}</th>
                  <th className="p-6 text-right"><Filter size={14} className="ml-auto opacity-20" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ordersLoading ? (
                  <tr><td colSpan="7" className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase">{t('syncing')}...</td></tr>
                ) : filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-white/[0.01] transition-colors border-b border-white/5">
                    <td className="p-6 font-mono text-[10px] font-black text-blue-500/80">#{o.orderId || 'N/A'}</td>
                    <td className="p-6"><div className="font-black text-slate-200 uppercase">{o.customerName}</div><div className="text-[10px] text-slate-500 font-mono italic">{o.customerPhone}</div></td>
                    <td className="p-6 text-[10px] font-bold text-slate-400 uppercase">{o.orderDate || o.createdAt?.split('T')[0]}</td>
                    <td className="p-6"><div className="flex flex-col gap-1">{o.products?.map((p, idx) => (<span key={idx} className="text-[11px] text-slate-400">• {p.name} <span className="text-blue-500/50 font-black">x{p.qty}</span></span>))}</div></td>
                    <td className="p-6 text-right font-mono font-black text-white text-sm">{currency} {(o.totalSell || 0).toLocaleString()}</td>
                    <td className={`p-6 text-right font-black font-mono text-sm ${o.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{currency} {o.netProfit?.toLocaleString()}</td>
                    <td className="p-6 text-right"><button onClick={() => deleteMutation.mutate(o._id)} className="p-3 bg-red-500/5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}