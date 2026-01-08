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
  X, Plus, Trash2, TrendingUp, 
  PieChart as PieIcon, Activity, ShoppingBag, CreditCard, Wallet
} from "lucide-react";

export default function UnifiedDashboard() {
  const { lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common"); // translation হুক ব্যবহার হচ্ছে
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

    // Mock/Real Expense Data logic
    const pData = [
      { name: t('marketing'), value: 400 },
      { name: t('courier'), value: 300 },
      { name: t('salary'), value: 300 },
    ];

    return { analytics: { totalSales, totalProfit, totalDue }, chartData: cData, expensePieData: pData };
  }, [orders, lang, t]);

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#22c55e'];

  // --- Summary Logic ---
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
      toast.success(t('order_success'));
    }
  });

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-200">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-blue-500" size={36} /> {t('intelligence')}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t('control_room_desc')}</p>
        </div>
        <button 
          onClick={() => setShowOrderDrawer(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-2xl transition-transform active:scale-95"
        >
          <Plus size={20} /> {t('create_order')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{t('revenue')}</p>
          <h3 className="text-4xl font-black italic">{currency}{analytics.totalSales.toLocaleString()}</h3>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{t('net_profit')}</p>
          <h3 className="text-4xl font-black italic text-emerald-500">{currency}{analytics.totalProfit.toLocaleString()}</h3>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border-l-4 border-l-red-500 border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{t('total_due')}</p>
          <h3 className="text-4xl font-black italic text-red-500">{currency}{analytics.totalDue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-8">
            <TrendingUp size={18} className="text-blue-500" /> {t('sales_trend')}
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090E14', border: 'none', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-pink-500" /> {t('expense_structure')}
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
        </div>
      </div>

      {/* Order Entry Drawer */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderDrawer(false)} />
          <div className="relative w-full max-w-2xl bg-[#090E14] h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic uppercase">{t('new_transaction')}</h2>
              <button onClick={() => setShowOrderDrawer(false)} className="p-3 bg-white/5 rounded-full text-red-500"><X size={24}/></button>
            </div>

            <div className="space-y-8">
              {/* Type Switcher */}
              <div className="flex p-1 bg-black/40 rounded-[1.5rem] border border-white/5">
                <button onClick={() => setTransactionType("online")} className={`flex-1 py-4 rounded-xl text-[10px] font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t('online')}</button>
                <button onClick={() => setTransactionType("offline")} className={`flex-1 py-4 rounded-xl text-[10px] font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>{t('offline')}</button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <input className="col-span-2 px-6 py-5 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" placeholder={t('customer_phone')} value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                <input className="col-span-2 px-6 py-5 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none" placeholder={t('customer_name')} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                {transactionType === "online" && (
                  <textarea className="col-span-2 px-6 py-5 bg-[#1a2230] border border-white/5 rounded-2xl text-sm font-bold outline-none min-h-[100px]" placeholder={t('shipping_address')} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                )}
              </div>

              {/* Payment Status with Partial Logic */}
              {transactionType === "online" && (
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-3xl">
                  <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">{t('payment_method')}</label>
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-6 py-4 bg-[#11161D] border border-white/10 rounded-xl text-sm font-bold">
                      <option value="COD">{t('cod')}</option>
                      <option value="Paid">{t('fully_paid')}</option>
                      <option value="Partial">{t('partial_payment')}</option>
                    </select>
                  </div>
                  {paymentStatus === "Partial" && (
                    <div className="col-span-2 md:col-span-1 space-y-2 animate-in fade-in">
                      <label className="text-[10px] font-black text-yellow-500 uppercase">{t('paid_amount')}</label>
                      <input type="number" className="w-full px-6 py-4 bg-[#11161D] border border-yellow-500/30 rounded-xl text-sm font-black text-yellow-500" placeholder="0.00" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {/* Summary & Submit */}
              <div className="bg-blue-600/10 p-8 rounded-[2.5rem] border border-blue-500/20">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('grand_total')}</p>
                    <p className="text-4xl font-black italic">{currency}{orderSummary.totalSell.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{t('due_amount')}</p>
                    <p className="text-2xl font-black">{currency}{orderSummary.dueAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => createOrderMutation.mutate({ items: cart, customer: customerInfo, transactionType, paymentStatus, paidAmount: Number(paidAmount) || 0, ...orderSummary })}
                className="w-full py-6 bg-blue-600 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]"
              >
                {t('complete_transaction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}