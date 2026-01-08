"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  X, Plus, Trash2, TrendingUp, Search, 
  PieChart as PieIcon, Activity, ShoppingBag, CreditCard, ArrowUpRight
} from "lucide-react";

export default function UnifiedDashboard() {
  const { lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  
  // Cart & Product Search States
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState("online");

  useEffect(() => { setMounted(true); }, []);

  const currency = useMemo(() => (typeof ctxCurrency === 'object' ? ctxCurrency.symbol : ctxCurrency) || "৳", [ctxCurrency]);

  // --- API Data Fetching ---
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => fetch('/api/dashboard').then(res => res.json())
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()).then(d => d.products || [])
  });

  // --- Safe Stats Logic (Error handling fix) ---
  const stats = useMemo(() => ({
    totalSales: dashboardData?.summary?.totalSales ?? 0,
    netProfit: dashboardData?.summary?.netProfit ?? 0,
    totalDue: dashboardData?.summary?.totalDue ?? 0,
    totalExpense: dashboardData?.summary?.totalExpense ?? 0,
  }), [dashboardData]);

  // --- Search & Cart Logic ---
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product._id);
    if (exists) {
      setCart(cart.map(item => item.id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { id: product._id, name: product.name, price: product.sellingPrice, qty: 1 }]);
    }
    setSearchQuery("");
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const COLORS = ['#3b82f6', '#ec4899', '#eab308'];

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Activity className="text-white" size={32} />
            </div>
            {t('intelligence')}
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 ml-1">
            {t('live_business_control_room')}
          </p>
        </div>
        <button 
          onClick={() => setShowOrderDrawer(true)}
          className="w-full md:w-auto bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          {t('create_new_order')}
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: t('total_revenue'), value: stats.totalSales, color: 'text-white', icon: ShoppingBag },
          { label: t('net_profit'), value: stats.netProfit, color: 'text-emerald-400', icon: TrendingUp },
          { label: t('total_due'), value: stats.totalDue, color: 'text-red-400', icon: CreditCard },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <kpi.icon className="absolute right-[-20px] bottom-[-20px] size-32 text-white/5" />
            <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">{kpi.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold opacity-50">{currency}</span>
              <h3 className={`text-5xl font-black italic tracking-tighter ${kpi.color}`}>
                {(kpi.value ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
              <ArrowUpRight size={14} /> 12% FROM LAST WEEK
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-[#11161D] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 mb-10">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {t('sales_performance')}
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.salesTrend || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="_id" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090E14', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#colorSales)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#11161D] p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 mb-8">
            <PieIcon size={18} className="text-pink-500" /> {t('expense_distribution')}
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name: 'Expenses', value: stats.totalExpense || 1}]} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                   <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
             <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('total_expenses')}</span>
                <span className="font-black text-xl">{currency}{(stats.totalExpense ?? 0).toLocaleString()}</span>
             </div>
          </div>
        </div>
      </div>

      {/* POS Drawer */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowOrderDrawer(false)} />
          <div className="relative w-full max-w-2xl bg-[#090E14] h-full shadow-2xl p-6 md:p-12 overflow-y-auto border-l border-white/5 animate-in slide-in-from-right duration-300">
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{t('new_pos_order')}</h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase mt-1 tracking-widest">{t('transaction_mode')}</p>
              </div>
              <button onClick={() => setShowOrderDrawer(false)} className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all">
                <X size={28}/>
              </button>
            </div>

            <div className="space-y-10">
              {/* Product Search */}
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  className="w-full px-16 py-6 bg-[#11161D] border border-white/5 rounded-3xl text-sm font-bold outline-none focus:border-blue-500/50 transition-all" 
                  placeholder={t('search_products_to_add')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <div className="absolute top-full left-0 w-full bg-[#1a2230] mt-4 rounded-3xl border border-white/10 overflow-hidden z-50 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                    {filteredProducts.map(p => (
                      <button key={p._id} onClick={() => addToCart(p)} className="w-full flex items-center justify-between p-5 hover:bg-blue-600 rounded-2xl transition-all group">
                        <div>
                          <p className="font-black text-sm uppercase text-white">{p.name}</p>
                          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Stock: {p.stock}</p>
                        </div>
                        <span className="font-black text-blue-500 group-hover:text-white">{currency}{p.sellingPrice}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-slate-400 py-12">{t('cart_empty')}</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="font-black text-white uppercase">{item.name}</p>
                        <p className="text-sm text-slate-400">{item.qty} x {currency}{item.price}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Summary */}
              <div className="space-y-4 border-t border-white/10 pt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-bold">{currency}{cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full py-6 bg-black text-white hover:bg-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95">
                {t('complete_transaction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}