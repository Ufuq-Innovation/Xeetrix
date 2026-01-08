"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  X, Plus, Trash2, Eye, TrendingUp, 
  PieChart as PieIcon, Activity, ShoppingBag, CreditCard, Wallet
} from "lucide-react";

export default function UnifiedDashboard() {
  const { lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // --- UI States ---
  const [mounted, setMounted] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);

  // --- Order Form States ---
  const [transactionType, setTransactionType] = useState("online"); 
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [paidAmount, setPaidAmount] = useState(""); 
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });

  useEffect(() => { setMounted(true); }, []);

  const currency = useMemo(() => (typeof ctxCurrency === 'object' ? ctxCurrency.symbol : ctxCurrency) || "৳", [ctxCurrency]);

  // --- Data Fetching ---
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory'], queryFn: async () => {
    const res = await fetch('/api/inventory');
    const d = await res.json(); return d.success ? d.products : [];
  }});

  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: async () => {
    const res = await fetch('/api/orders');
    const d = await res.json(); return d.success ? d.orders : [];
  }});

  const { data: financeData = { expenses: [] } } = useQuery({ queryKey: ['finance'], queryFn: async () => {
    const res = await fetch('/api/finance');
    return res.json();
  }});

  // --- Analytics Logic ---
  const { analytics, chartData, expensePieData } = useMemo(() => {
    const totalSales = orders.reduce((acc, o) => acc + (o.totalSell || 0), 0);
    const totalProfit = orders.reduce((acc, o) => acc + (o.netProfit || 0), 0);
    const totalDue = orders.reduce((acc, o) => acc + (o.dueAmount || 0), 0);
    const cData = orders.slice(-7).map(order => ({
      name: new Date(order.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' }),
      sales: order.totalSell || 0,
      profit: order.netProfit || 0
    }));
    const cats = {};
    financeData.expenses.forEach(exp => {
      const catName = t(exp.category.toLowerCase());
      cats[catName] = (cats[catName] || 0) + Number(exp.amount);
    });
    const pData = Object.keys(cats).map(cat => ({ name: cat, value: cats[cat] }));
    return { analytics: { totalSales, totalProfit, totalDue }, chartData: cData, expensePieData: pData };
  }, [orders, financeData, lang, t]);

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#22c55e'];

  // --- Form Logic ---
  const orderSummary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    const currentPaid = transactionType === "offline" ? totalSell : (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? Number(paidAmount) || 0 : 0));
    return { subTotal, totalSell, netProfit: (subTotal - disc) - totalCost, dueAmount: totalSell - currentPaid, currentPaid };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setShowOrderDrawer(false);
      setCart([]); setCustomerInfo({ name: '', phone: '', address: '' }); setPaidAmount("");
      toast.success("Order Processed Successfully");
    }
  });

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-200">
      
      {/* 1. Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-blue-500" size={36} /> Intelligence
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Business Control Room</p>
        </div>
        <button 
          onClick={() => setShowOrderDrawer(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-2xl shadow-blue-600/20 transition-transform active:scale-95"
        >
          <Plus size={20} /> Create Order
        </button>
      </div>

      {/* 2. KPI Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><ShoppingBag size={24}/></div>
             <span className="text-[10px] font-black text-slate-500 uppercase">Revenue</span>
          </div>
          <h3 className="text-4xl font-black italic">{currency}{analytics.totalSales.toLocaleString()}</h3>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><CreditCard size={24}/></div>
             <span className="text-[10px] font-black text-slate-500 uppercase">Net Profit</span>
          </div>
          <h3 className="text-4xl font-black italic text-emerald-500">{currency}{analytics.totalProfit.toLocaleString()}</h3>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-red-500/10 shadow-xl border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><Wallet size={24}/></div>
             <span className="text-[10px] font-black text-slate-500 uppercase">Total Due</span>
          </div>
          <h3 className="text-4xl font-black italic text-red-500">{currency}{analytics.totalDue.toLocaleString()}</h3>
        </div>
      </div>

      {/* 3. Visual Charts (Area & Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-8">
            <TrendingUp size={18} className="text-blue-500" /> Sales Trend
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090E14', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={4} />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={0} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-pink-500" /> Expense Structure
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensePieData} innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value">
                  {expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {expensePieData.map((exp, i) => (
              <div key={i} className="flex justify-between items-center text-[11px] font-black uppercase">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}/> {exp.name}
                </span>
                <span className="text-white">{currency}{exp.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Order Entry Drawer (Separated for focus) */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderDrawer(false)} />
          <div className="relative w-full max-w-2xl bg-[#090E14] h-full shadow-2xl border-l border-white/10 p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic uppercase italic">New Transaction</h2>
              <button onClick={() => setShowOrderDrawer(false)} className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-red-500 transition-all"><X size={24}/></button>
            </div>

            <div className="space-y-8">
              {/* Type Switcher */}
              <div className="flex p-1 bg-black/40 rounded-[1.5rem] border border-white/5">
                <button onClick={() => setTransactionType("online")} className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>ONLINE</button>
                <button onClick={() => setTransactionType("offline")} className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>OFFLINE</button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <input className="col-span-2 px-6 py-5 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none focus:border-blue-500/50 transition-all" placeholder="Customer Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                <input className="col-span-2 px-6 py-5 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                {transactionType === "online" && (
                  <textarea className="col-span-2 px-6 py-5 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none min-h-[100px]" placeholder="Shipping Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                )}
              </div>

              {/* Partial Payment Logic - Inside Drawer */}
              {transactionType === "online" && (
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Payment Method</label>
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-6 py-4 bg-[#11161D] border border-white/10 rounded-xl text-sm font-bold">
                      <option value="COD">Cash on Delivery</option>
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial">Partial Payment</option>
                    </select>
                  </div>
                  {paymentStatus === "Partial" && (
                    <div className="col-span-2 md:col-span-1 space-y-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-[10px] font-black text-yellow-500 uppercase">Paid / Advance Amount</label>
                      <input type="number" className="w-full px-6 py-4 bg-[#11161D] border border-yellow-500/30 rounded-xl text-sm font-black text-yellow-500" placeholder="0.00" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {/* Cart Section */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select className="flex-1 px-6 py-4 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" value={selectedProduct.id} onChange={e => {
                    const p = inventory.find(i => i._id === e.target.value);
                    if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                  }}>
                    <option value="">Select Product...</option>
                    {inventory.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <button onClick={() => { if(selectedProduct.id) {setCart([...cart, {...selectedProduct}]); setSelectedProduct({id:''})} }} className="px-6 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all"><Plus/></button>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <span className="text-xs font-black uppercase tracking-tighter">{item.name} <span className="text-blue-500 ml-2">x{item.qty}</span></span>
                      <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary in Drawer */}
              <div className="bg-blue-600/10 p-8 rounded-[2.5rem] border border-blue-500/20">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Grand Total</p>
                    <p className="text-4xl font-black italic">{currency}{orderSummary.totalSell.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Due Amount</p>
                    <p className="text-2xl font-black">{currency}{orderSummary.dueAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => createOrderMutation.mutate({
                  transactionType, paymentStatus: transactionType === 'offline' ? 'Paid' : paymentStatus,
                  customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                  products: cart, totalSell: orderSummary.totalSell, netProfit: orderSummary.netProfit, dueAmount: orderSummary.dueAmount, paidAmount: orderSummary.currentPaid
                })}
                disabled={cart.length === 0}
                className="w-full py-6 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]"
              >
                Complete Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}