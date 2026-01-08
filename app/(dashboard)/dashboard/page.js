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
  X, Plus, Trash2, Globe, Store, Eye, TrendingUp, 
  PieChart as PieIcon, BarChart3, ShoppingBag, CreditCard, Activity
} from "lucide-react";

export default function UnifiedDashboard() {
  const { lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // --- States ---
  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online"); 
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [paidAmount, setPaidAmount] = useState(""); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  const [filters, setFilters] = useState({ search: '', type: 'all' });

  useEffect(() => {
    setMounted(true);
    setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
  }, [transactionType]);

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

  // --- Analytics & Charts Logic (Merged from your ReportsPage) ---
  const { analytics, chartData, expensePieData } = useMemo(() => {
    // Basic Stats
    const totalSales = orders.reduce((acc, o) => acc + (o.totalSell || 0), 0);
    const totalProfit = orders.reduce((acc, o) => acc + (o.netProfit || 0), 0);
    const totalDue = orders.reduce((acc, o) => acc + (o.dueAmount || 0), 0);

    // Area Chart Data
    const cData = orders.slice(-7).map(order => ({
      name: new Date(order.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' }),
      sales: order.totalSell || 0,
      profit: order.netProfit || 0
    }));

    // Pie Chart Data
    const cats = {};
    financeData.expenses.forEach(exp => {
      const catName = t(exp.category.toLowerCase());
      cats[catName] = (cats[catName] || 0) + Number(exp.amount);
    });
    const pData = Object.keys(cats).map(cat => ({ name: cat, value: cats[cat] }));

    return { analytics: { totalSales, totalProfit, totalDue, count: orders.length }, chartData: cData, expensePieData: pData };
  }, [orders, financeData, lang, t]);

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#22c55e'];

  // --- Order Calculations ---
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
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      setLastSavedOrder({ ...data.order, orderSummary, customerInfo, cart });
      setShowReceipt(true);
      setCart([]); setCustomerInfo({ name: '', phone: '', address: '' }); setPaidAmount("");
      toast.success("Transaction Completed");
    }
  });

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto text-slate-200">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-blue-500" size={36} /> Control Room
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Real-time Business Intelligence</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-[#11161D] px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase">Cash Flow</p>
              <p className="text-xl font-black text-emerald-500">{currency} {analytics.totalSales.toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* 2. Visual Analytics (Merged from ReportsPage) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" /> Sales vs Profit
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090E14', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#colorSales)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <PieIcon size={18} className="text-pink-500" /> Expenses
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expensePieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {expensePieData.map((exp, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}/> {exp.name}</span>
                <span>{currency}{exp.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Transaction Hub (Order Section) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-[#11161D] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
          <div className="flex justify-between mb-8">
            <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
              <button onClick={() => setTransactionType("online")} className={`px-8 py-2 rounded-xl text-[10px] font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ONLINE</button>
              <button onClick={() => setTransactionType("offline")} className={`px-8 py-2 rounded-xl text-[10px] font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>OFFLINE</button>
            </div>
            <span className="font-mono text-xs font-black text-blue-500 uppercase tracking-widest">{orderId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="w-full px-6 py-4 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" placeholder="Customer Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
            <input className="w-full px-6 py-4 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
            
            {transactionType === "online" && (
              <>
                <textarea className="md:col-span-2 w-full px-6 py-4 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none min-h-[80px]" placeholder="Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-6 py-4 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold">
                  <option value="COD">Cash on Delivery</option>
                  <option value="Paid">Fully Paid</option>
                  <option value="Partial">Partial</option>
                </select>
                {paymentStatus === "Partial" && (
                  <input type="number" placeholder="Paid Amount" className="w-full px-6 py-4 bg-[#1a2230] border border-yellow-500/20 rounded-2xl text-sm font-black text-yellow-500" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                )}
              </>
            )}
          </div>

          {/* Product Selection */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
             <select className="md:col-span-2 px-6 py-4 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" value={selectedProduct.id} onChange={e => {
                const p = inventory.find(i => i._id === e.target.value);
                if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
             }}>
               <option value="">Choose Product</option>
               {inventory.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
             </select>
             <button onClick={() => { if(selectedProduct.id) {setCart([...cart, {...selectedProduct}]); setSelectedProduct({id:''})} }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs">Add to Cart</button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {cart.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-[10px] font-black uppercase">{item.name} x{item.qty}</span>
                <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500"><X size={14}/></button>
              </div>
            ))}
          </div>

          <button onClick={() => createOrderMutation.mutate({
            orderId, transactionType, paymentStatus: transactionType === 'offline' ? 'Paid' : paymentStatus,
            customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
            products: cart, totalSell: orderSummary.totalSell, netProfit: orderSummary.netProfit, dueAmount: orderSummary.dueAmount, paidAmount: orderSummary.currentPaid
          })} className="w-full mt-10 py-6 bg-blue-600 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.01] transition-all">Complete Transaction</button>
        </div>

        {/* Right Sidebar: Quick Summary */}
        <div className="space-y-6">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <h4 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest">Live Summary</h4>
            <div className="space-y-4">
               <div className="flex justify-between text-sm font-bold"><span>Total Items</span><span>{cart.length}</span></div>
               <div className="flex justify-between text-sm font-bold"><span>Tax/Courier</span><span>{currency}{expenses.courier || 0}</span></div>
               <div className="h-px bg-white/5 my-4" />
               <div className="flex justify-between items-end">
                 <div><p className="text-[9px] font-black text-slate-500 uppercase">Grand Total</p><p className="text-3xl font-black italic">{currency}{orderSummary.totalSell}</p></div>
               </div>
               <div className="pt-4 flex gap-4">
                  <div className="flex-1"><p className="text-[9px] font-black text-emerald-500 uppercase">Paid</p><p className="text-lg font-black">{currency}{orderSummary.currentPaid}</p></div>
                  <div className="flex-1 text-right"><p className="text-[9px] font-black text-red-500 uppercase">Due</p><p className="text-lg font-black">{currency}{orderSummary.dueAmount}</p></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}