"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toPng } from 'html-to-image';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  X, Plus, Trash2, TrendingUp, Search, 
  PieChart as PieIcon, Activity, ShoppingBag, CreditCard, ArrowUpRight,
  Globe, Store, Printer, Download, Eye, Truck, CheckCircle2, Clock, Image as ImageIcon, Wallet
} from "lucide-react";

export default function UnifiedDashboard() {
  const { theme, lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const receiptRef = useRef(null);
  
  const [mounted, setMounted] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  
  // POS Drawer States (from order page)
  const [transactionType, setTransactionType] = useState("online");
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paidAmount, setPaidAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });

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

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  // --- Safe Stats Logic ---
  const stats = useMemo(() => ({
    totalSales: dashboardData?.summary?.totalSales ?? 0,
    netProfit: dashboardData?.summary?.netProfit ?? 0,
    totalDue: dashboardData?.summary?.totalDue ?? 0,
    totalExpense: dashboardData?.summary?.totalExpense ?? 0,
  }), [dashboardData]);

  // --- POS Drawer Functions ---
  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  useEffect(() => {
    if (showOrderDrawer) {
      setOrderId(generateId(transactionType));
      if (transactionType === "offline") {
        setPaymentStatus("Paid");
      } else {
        setPaymentStatus("COD");
      }
    }
  }, [showOrderDrawer, transactionType]);

  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    const isConfirmedSell = (transactionType === "offline") || (paymentStatus === "Paid");
    const netProfit = isConfirmedSell ? ((subTotal - disc) - totalCost) : 0;

    return { 
      subTotal, totalSell, netProfit, 
      dueAmount: (totalSell - currentPaid), 
      currentPaid, isConfirmedSell 
    };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  const downloadReceiptImage = async () => {
    if (receiptRef.current === null) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `INV-${lastSavedOrder?.orderId || 'POS'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t("notifications.image_downloaded"));
    } catch (err) {
      toast.error(t("notifications.export_failed"));
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
      setLastSavedOrder({ ...data.order });
      setShowReceipt(true);
      resetForm();
      toast.success(t("notifications.transaction_success"));
    }
  });

  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setExpenses({ discount: '', courier: '' });
    setPaidAmount("");
    setOrderId(generateId(transactionType));
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product._id);
    if (exists) {
      setCart(cart.map(item => item.id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { id: product._id, name: product.name, price: product.sellingPrice, qty: 1, cost: product.costPrice || 0 }]);
    }
    setSearchQuery("");
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const COLORS = ['#3b82f6', '#ec4899', '#eab308'];

  if (!mounted) return null;

  return (
    <div className={`p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto text-slate-200 ${theme === 'dark' ? 'bg-[#090E14]' : 'bg-gray-50'}`}>
      
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

      {/* KPI Section - Updated with gradient design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: t('total_revenue'), value: stats.totalSales, color: 'from-blue-500/10 to-blue-900/5', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10', icon: ShoppingBag },
          { label: t('net_profit'), value: stats.netProfit, color: 'from-emerald-500/10 to-emerald-900/5', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10', icon: TrendingUp },
          { label: t('total_due'), value: stats.totalDue, color: 'from-red-500/10 to-red-900/5', border: 'border-red-500/20', shadow: 'shadow-red-500/10', icon: CreditCard },
        ].map((kpi, i) => (
          <div key={i} className={`bg-gradient-to-br ${kpi.color} p-6 rounded-3xl border ${kpi.border} shadow-lg ${kpi.shadow} transition-all hover:shadow-blue-500/20 hover:border-blue-500/30 group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${kpi.color.includes('blue') ? 'bg-blue-500/20' : kpi.color.includes('emerald') ? 'bg-emerald-500/20' : 'bg-red-500/20'} rounded-2xl`}>
                <kpi.icon className={kpi.color.includes('blue') ? 'text-blue-500' : kpi.color.includes('emerald') ? 'text-emerald-500' : 'text-red-500'} size={24} />
              </div>
              <span className="text-[10px] font-bold px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full">
                {i === 0 ? t('revenue') : i === 1 ? t('profit') : t('due')}
              </span>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              {kpi.label}
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold opacity-50">{currency}</span>
              <p className="text-4xl font-black italic text-white">
                {(kpi.value ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500">
                12% {t('from_last_week')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 p-6 rounded-3xl border border-blue-500/20 shadow-lg shadow-blue-500/10 transition-all hover:shadow-blue-500/20 hover:border-blue-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <ShoppingBag className="text-blue-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full">
              {t('today')}
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {t('total_orders')}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-4xl font-black italic text-white">
              {(dashboardData?.summary?.totalOrders ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">
              +{(dashboardData?.trends?.orderGrowth ?? 0)}% {t('from_last_month')}
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 p-6 rounded-3xl border border-purple-500/20 shadow-lg shadow-purple-500/10 transition-all hover:shadow-purple-500/20 hover:border-purple-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl">
              <CreditCard className="text-purple-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full">
              {t('avg')}
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {t('average_order_value')}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-4xl font-black italic text-white">
              {(dashboardData?.summary?.averageOrderValue ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold text-blue-500">
              {t('per_transaction')}
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 p-6 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10 transition-all hover:shadow-emerald-500/20 hover:border-emerald-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full">
              {t('rate')}
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {t('conversion_rate')}
          </h4>
          <p className="text-4xl font-black italic text-white">
            {(dashboardData?.summary?.conversionRate ?? 0).toFixed(1)}%
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">
              {(dashboardData?.trends?.conversionChange ?? 0) > 0 ? '+' : ''}
              {(dashboardData?.trends?.conversionChange ?? 0)}% {t('trend')}
            </span>
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-900/5 p-6 rounded-3xl border border-amber-500/20 shadow-lg shadow-amber-500/10 transition-all hover:shadow-amber-500/20 hover:border-amber-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-2xl">
              <CreditCard className="text-amber-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full">
              {t('available')}
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {t('cash_in_hand')}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-4xl font-black italic text-white">
              {(dashboardData?.summary?.cashInHand ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-amber-500">
              {t('real_time_balance')}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('pending_orders')}
            </h4>
            <span className="text-[10px] font-bold px-3 py-1 bg-red-500/20 text-red-500 rounded-full">
              {(dashboardData?.statusCounts?.pending ?? 0)}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">{t('cod_pending')}</span>
              <span className="font-bold text-white">
                {currency}{(dashboardData?.summary?.codPending ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">{t('processing')}</span>
              <span className="font-bold text-blue-500">
                {(dashboardData?.statusCounts?.processing ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 p-6 rounded-3xl border border-white/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
            {t('quick_stats')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                {t('products')}
              </p>
              <p className="text-2xl font-black text-white">
                {(dashboardData?.summary?.totalProducts ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                {t('customers')}
              </p>
              <p className="text-2xl font-black text-white">
                {(dashboardData?.summary?.totalCustomers ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                {t('low_stock')}
              </p>
              <p className="text-2xl font-black text-amber-500">
                {(dashboardData?.alerts?.lowStockCount ?? 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                {t('returns')}
              </p>
              <p className="text-2xl font-black text-red-500">
                {(dashboardData?.statusCounts?.returned ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('recent_activity')}
            </h4>
            <span className="text-[10px] font-bold text-blue-500">
              {t('live')}
            </span>
          </div>
          <div className="space-y-4">
            {(dashboardData?.recentActivity || []).slice(0, 3).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-blue-500/20' : idx === 1 ? 'bg-emerald-500/20' : 'bg-purple-500/20'}`}>
                  <ShoppingBag size={16} className={idx === 0 ? 'text-blue-500' : idx === 1 ? 'text-emerald-500' : 'text-purple-500'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.description}</p>
                  <p className="text-[10px] font-bold text-slate-400">{activity.time}</p>
                </div>
                <span className="text-xs font-bold text-slate-300">
                  {currency}{activity.amount?.toLocaleString()}
                </span>
              </div>
            ))}
            {(dashboardData?.recentActivity || []).length === 0 && (
              <p className="text-center text-slate-400 py-4">{t('no_recent_activity')}</p>
            )}
          </div>
        </div>
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

      {/* POS Drawer - From Order Page */}
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
              {/* Transaction Type */}
              <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5 w-full max-w-xs">
                <button 
                  onClick={() => setTransactionType("online")} 
                  className={`flex-1 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t("order.type_online")}
                </button>
                <button 
                  onClick={() => setTransactionType("offline")} 
                  className={`flex-1 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t("order.type_offline")}
                </button>
              </div>

              <div className="font-mono text-sm font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 inline-block">
                {orderId}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" 
                  placeholder={t("customer.phone")} 
                  value={customerInfo.phone} 
                  onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                />
                <input 
                  className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" 
                  placeholder={t("customer.name")} 
                  value={customerInfo.name} 
                  onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                />
                
                {transactionType === "online" && (
                  <>
                    <textarea 
                      className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px] focus:border-blue-500 transition-all placeholder:text-slate-600" 
                      placeholder={t("customer.address")} 
                      value={customerInfo.address} 
                      onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">{t("order.platform")}</label>
                      <select 
                        value={orderSource} 
                        onChange={e => setOrderSource(e.target.value)} 
                        className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Facebook">Facebook</option>
                        <option value="Website">Website</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Whatsapp">Whatsapp</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">{t("order.payment_status")}</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                          value={paymentStatus} 
                          onChange={e => setPaymentStatus(e.target.value)} 
                          className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="COD">{t("order.cod")}</option>
                          <option value="Paid">{t("order.paid")}</option>
                          <option value="Partial">{t("order.partial")}</option>
                        </select>
                        {paymentStatus === "Partial" && (
                          <div className="relative flex-1 animate-in slide-in-from-right-2 duration-300">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                            <input 
                              type="number" 
                              className="w-full px-12 py-4 bg-[#1a2230] border border-emerald-500/30 rounded-2xl text-sm font-black outline-none focus:border-emerald-500 transition-all" 
                              placeholder={t("order.paid_amount")} 
                              value={paidAmount} 
                              onChange={e => setPaidAmount(e.target.value)} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Product Selection */}
              <div className="mt-8 p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <select 
                    className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                    value={selectedProduct.id} 
                    onChange={e => {
                      const p = inventory.find(i => i._id === e.target.value);
                      if(p) setSelectedProduct({ 
                        id: p._id, 
                        name: p.name, 
                        qty: 1, 
                        stock: p.stock, 
                        price: p.sellingPrice, 
                        cost: p.costPrice || 0 
                      });
                    }}
                  >
                    <option value="">{t("inventory.select_product")}</option>
                    {inventory.map(item => (
                      <option key={item._id} value={item._id} disabled={item.stock <= 0}>
                        {item.name} ({item.stock})
                      </option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    className="w-full md:w-24 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none focus:border-blue-500 transition-all" 
                    value={selectedProduct.qty} 
                    onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} 
                  />
                  <button 
                    onClick={() => { 
                      if (!selectedProduct.id) return; 
                      setCart([...cart, {...selectedProduct}]); 
                      setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 }); 
                    }} 
                    className="px-10 py-4 bg-blue-600 rounded-2xl text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Plus />
                  </button>
                </div>
                
                {/* Cart Items */}
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-center text-slate-400 py-12">{t('cart_empty')}</p>
                  ) : (
                    cart.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                          <p className="font-black text-white uppercase">{item.name}</p>
                          <p className="text-sm text-slate-400">{item.qty} x {currency}{item.price}</p>
                        </div>
                        <button 
                          onClick={() => setCart(cart.filter((_, idx) => idx !== i))} 
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Expenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                  <input 
                    type="number" 
                    placeholder={t("order.discount")} 
                    className="px-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" 
                    value={expenses.discount} 
                    onChange={e => setExpenses({...expenses, discount: e.target.value})} 
                  />
                  {transactionType === "online" && (
                    <input 
                      type="number" 
                      placeholder={t("order.courier")} 
                      className="px-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" 
                      value={expenses.courier} 
                      onChange={e => setExpenses({...expenses, courier: e.target.value})} 
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={() => createOrderMutation.mutate({ 
                  orderId, 
                  transactionType, 
                  orderSource, 
                  paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                  customerName: customerInfo.name, 
                  customerPhone: customerInfo.phone, 
                  customerAddress: customerInfo.address,
                  products: cart, 
                  discount: Number(expenses.discount), 
                  courier: Number(expenses.courier),
                  totalSell: summary.totalSell, 
                  netProfit: summary.netProfit, 
                  dueAmount: summary.dueAmount, 
                  paidAmount: summary.currentPaid,
                  isConfirmedSell: summary.isConfirmedSell
                })} 
                className={`w-full mt-8 py-6 rounded-3xl font-black uppercase shadow-2xl active:scale-95 transition-all ${transactionType === 'offline' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}
              >
                {transactionType === 'offline' ? t("order.confirm_sale") : t("order.create_order")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden text-slate-900 shadow-2xl">
            <div ref={receiptRef} className="p-8 bg-white">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6 uppercase">
                <h2 className="text-xl font-black italic tracking-tighter text-blue-600">Xeetrix Control Room</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{lastSavedOrder?.orderId || 'N/A'}</p>
              </div>
              <div className="space-y-2 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-700">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>{t("summary.subtotal")}</span>
                  <span>{currency}{(Number(lastSavedOrder?.totalSell) - (Number(lastSavedOrder?.courier) || 0) + (Number(lastSavedOrder?.discount) || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-red-500">
                  <span>{t("order.discount")}</span>
                  <span>-{currency}{(Number(lastSavedOrder?.discount) || 0).toLocaleString()}</span>
                </div>
                {lastSavedOrder?.transactionType === "online" && (
                  <div className="flex justify-between text-[11px] font-bold text-blue-500">
                    <span>{t("order.courier")}</span>
                    <span>+{currency}{(Number(lastSavedOrder?.courier) || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between font-black text-2xl tracking-tighter text-slate-900">
                  <span>{t("summary.total")}</span>
                  <span>{currency}{(Number(lastSavedOrder?.totalSell) || 0).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-center text-[8px] font-black text-slate-300 uppercase italic">{t("receipt.verified")}</p>
            </div>
            <div className="p-6 bg-slate-100 grid grid-cols-2 gap-3 border-t border-slate-200">
              <button onClick={() => window.print()} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all">
                <Printer size={14}/> {t("receipt.print")}
              </button>
              <button onClick={downloadReceiptImage} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all">
                <ImageIcon size={14}/> {t("receipt.save_image")}
              </button>
              <button onClick={() => setShowReceipt(false)} className="col-span-2 py-3 bg-white border border-slate-300 rounded-2xl font-black uppercase text-[10px] text-slate-500">
                {t("receipt.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}