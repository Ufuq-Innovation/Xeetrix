"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, ShoppingBag, Clock, X, Plus, Filter,
  Search, Trash2, History, Calendar, Globe, Store, CreditCard, ChevronDown
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // --- ১. নিউ স্টেটস (Type, Platform, Payment) ---
  const [transactionType, setTransactionType] = useState("online"); // 'online' or 'offline'
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paymentStatus, setPaymentStatus] = useState("COD");

  // ইউনিক আইডি জেনারেশন (Type এর উপর ভিত্তি করে)
  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${new Date().getFullYear()}-${randomStr}`;
  };

  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  const [filters, setFilters] = useState({ id: "", customer: "", date: "" });

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
  }, [transactionType]); // Type চেঞ্জ হলে আইডি অটো চেঞ্জ হবে

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

  // কাস্টমার অটো-সাজেশন লজিক
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
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0; // অফলাইনে কুরিয়ার কস্ট ০
    const totalSell = subTotal - disc;
    return { subTotal, totalSell, netProfit: totalSell - totalCost - cour };
  }, [cart, expenses, transactionType]);

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
      queryClient.invalidateQueries(['dashboardStats']);
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      setExpenses({ discount: '', courier: '' });
      setOrderId(generateId(transactionType));
      toast.success(transactionType === "online" ? t('order_successful_alert') : "Sale Recorded Successfully");
    }
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = (o.orderId + (o.customerName || "") + (o.customerPhone || "")).toLowerCase().includes(searchTerm.toLowerCase());
      const matchId = o.orderId?.toLowerCase().includes(filters.id.toLowerCase());
      const matchCustomer = o.customerName?.toLowerCase().includes(filters.customer.toLowerCase());
      const matchDate = o.createdAt?.includes(filters.date);
      return matchSearch && matchId && matchCustomer && matchDate;
    });
  }, [orders, searchTerm, filters]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-7xl mx-auto bg-transparent text-slate-200">
      
      {/* --- ২. নিউ মোড সুইচ (Online/Offline) --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-[#11161D] rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setTransactionType("online")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Globe size={14} /> ONLINE
            </button>
            <button 
              onClick={() => setTransactionType("offline")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Store size={14} /> OFFLINE
            </button>
          </div>
          <div>
             <h1 className="text-2xl font-black italic tracking-tighter uppercase">{transactionType === 'online' ? 'Order Panel' : 'POS Panel'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#11161D] px-6 py-3 rounded-2xl border border-white/5">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Today's Total</p>
              <p className="text-lg font-black font-mono">{currency} {summary.totalSell.toLocaleString()}</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-8 md:p-10 shadow-2xl relative">
            
            {/* ID & Date Header */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${transactionType === 'online' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                  <span className="font-mono text-sm font-black tracking-widest">ID: {orderId}</span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Calendar size={14} className="text-slate-500" />
                    <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none uppercase cursor-pointer" />
                </div>
            </div>

            <div className="space-y-8">
              {/* --- ৩. কন্ডিশনাল ড্রপডাউন (Online Only) --- */}
              {transactionType === "online" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-500/70 uppercase ml-1">Order Source / Platform</label>
                    <div className="relative">
                      <select 
                        value={orderSource} onChange={e => setOrderSource(e.target.value)}
                        className="w-full appearance-none px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        {["Facebook", "Website", "TikTok", "Instagram", "WhatsApp", "Other"].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-500/70 uppercase ml-1">Payment Status</label>
                    <div className="relative">
                      <select 
                        value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                        className="w-full appearance-none px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value="COD">Cash On Delivery (COD)</option>
                        <option value="Paid">Fully Paid</option>
                        <option value="Partial">Partial Payment</option>
                      </select>
                      <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info with Auto-fill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative" ref={suggestionRef}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Customer Name</label>
                  <input className="w-full px-6 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                    placeholder="Search or Enter Name" value={customerInfo.name} onFocus={() => setShowSuggestions(true)}
                    onChange={e => { setCustomerInfo({...customerInfo, name: e.target.value}); setShowSuggestions(true); }} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Contact Phone</label>
                  <input className="w-full px-6 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                    placeholder="01XXXXXXXXX" value={customerInfo.phone} onFocus={() => setShowSuggestions(true)}
                    onChange={e => { setCustomerInfo({...customerInfo, phone: e.target.value}); setShowSuggestions(true); }} />
                </div>

                {/* Suggestions List */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-[100%] left-0 w-full z-50 mt-2 bg-[#1a2230]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="px-6 py-3 border-b border-white/5 text-[9px] font-black text-slate-500">FREQUENT CUSTOMERS</div>
                    {filteredSuggestions.map((c, i) => (
                      <div key={i} onClick={() => { setCustomerInfo(c); setShowSuggestions(false); }} className="px-6 py-4 hover:bg-blue-600/20 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group">
                        <div><p className="text-sm font-black text-white">{c.name}</p><p className="text-[10px] text-slate-500 font-mono tracking-widest">{c.phone}</p></div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-all"><Plus size={14} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Selection Hub */}
              <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7">
                    <select className="w-full px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500/50"
                      value={selectedProduct.id} onChange={e => {
                        const p = inventory.find(i => i._id === e.target.value);
                        if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                      }}>
                      <option value="">Select Product from Inventory</option>
                      {inventory.map(item => (
                        <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} (Stock: {item.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <input type="number" className="w-full px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black text-white outline-none" 
                      placeholder="Qty" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2">
                    <button onClick={() => {
                       if (!selectedProduct.id) return toast.error("Select a product first");
                       setCart([...cart, {...selectedProduct}]);
                       setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
                    }} className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/10"><Plus size={24} /></button>
                  </div>
                </div>
                
                {/* Visual Cart Items */}
                <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                  {cart.length === 0 && <p className="text-center py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-2 border-dashed border-white/5 rounded-3xl italic">No Items in Cart</p>}
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#1a2230] p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-xs">#{idx+1}</div>
                        <div><p className="text-sm font-black text-white uppercase">{item.name}</p><p className="text-[10px] text-slate-500 font-mono tracking-widest">{currency}{item.price} x {item.qty}</p></div>
                      </div>
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="w-8 h-8 rounded-lg bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Inputs */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Discount Amount</label>
                  <input type="number" placeholder="0.00" className="w-full px-6 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white font-mono outline-none" 
                    value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
                </div>
                <div className={`space-y-2 transition-opacity duration-300 ${transactionType === 'offline' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Courier Charge</label>
                  <input type="number" placeholder="0.00" className="w-full px-6 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white font-mono outline-none" 
                    value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
                </div>
              </div>

              <button 
                onClick={() => createOrderMutation.mutate({ 
                  orderId, orderDate, transactionType, orderSource, paymentStatus,
                  customerName: customerInfo.name, customerPhone: customerInfo.phone, 
                  products: cart, discount: Number(expenses.discount), 
                  courier: Number(expenses.courier), totalSell: summary.totalSell, 
                  netProfit: summary.netProfit 
                })}
                disabled={createOrderMutation.isPending || cart.length === 0} 
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] ${transactionType === 'online' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'} text-white`}
              >
                {createOrderMutation.isPending ? 'Syncing...' : (transactionType === 'online' ? 'Confirm Online Order' : 'Record Offline Sale')}
              </button>
            </div>
          </div>
        </div>

        {/* --- ৪. মডার্ন ক্যালকুলেটর প্রিভিউ --- */}
        <div className="h-fit lg:sticky lg:top-6">
          <div className="bg-[#11161D] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 transition-colors ${transactionType === 'online' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 tracking-widest uppercase">
                <span>SUBTOTAL</span>
                <span className="font-mono">{currency} {summary.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-red-500/80 tracking-widest uppercase">
                <span>TOTAL DISCOUNT</span>
                <span className="font-mono">-{currency} {(Number(expenses.discount) || 0).toLocaleString()}</span>
              </div>
              {transactionType === 'online' && (
                <div className="flex justify-between items-center text-[10px] font-black text-blue-500/80 tracking-widest uppercase">
                  <span>COURIER COST</span>
                  <span className="font-mono">+{currency} {(Number(expenses.courier) || 0).toLocaleString()}</span>
                </div>
              )}
              
              <div className="h-px bg-white/5 my-4"></div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Net Revenue</p>
                <div className="text-5xl font-black italic tracking-tighter text-white font-mono leading-none">
                   {currency} {summary.totalSell.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1 mt-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Projected Profit</p>
                <div className={`text-4xl font-black italic tracking-tighter font-mono ${summary.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                   {currency} {summary.netProfit.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><PlusCircle size={14} className="text-blue-500" /></div>
                   <p className="text-[10px] font-bold text-slate-400">Inventory will auto-adjust upon confirmation</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Section Table (Keep same advanced logic but updated styling) */}
      {/* ... History Table Part (Simplified for brevity) ... */}
    </div>
  );
}