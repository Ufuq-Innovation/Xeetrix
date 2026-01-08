"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, Plus, Trash2, TrendingUp, Search, Activity, ShoppingBag, CreditCard, ArrowUpRight, PieChart as PieIcon
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export default function UnifiedDashboard() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);

  // --- POS Drawer States (Synchronized with Order Page) ---
  const [transactionType, setTransactionType] = useState("online");
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [paidAmount, setPaidAmount] = useState("");
  const [orderSource, setOrderSource] = useState("Facebook");
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, price: 0 });

  useEffect(() => { setMounted(true); }, []);

  const currency = useMemo(() => (typeof context?.currency === 'object' ? context?.currency.symbol : context?.currency) || "৳", [context?.currency]);

  // --- Data Fetching ---
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => fetch('/api/dashboard').then(res => res.json())
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()).then(d => d.products || [])
  });

  const stats = useMemo(() => ({
    totalSales: dashboardData?.summary?.totalSales ?? 0,
    netProfit: dashboardData?.summary?.netProfit ?? 0,
    totalDue: dashboardData?.summary?.totalDue ?? 0,
    totalExpense: dashboardData?.summary?.totalExpense ?? 0,
  }), [dashboardData]);

  // --- Calculations ---
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    return { subTotal, totalSell, dueAmount: totalSell - currentPaid, currentPaid };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  const createOrderMutation = useMutation({
    mutationFn: (newOrder) => fetch('/api/orders', { method: 'POST', body: JSON.stringify(newOrder), headers: { 'Content-Type': 'application/json' }}).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardStats', 'orders']);
      setShowOrderDrawer(false);
      toast.success("Order Processed!");
      setCart([]); setCustomerInfo({ name: '', phone: '', address: '' });
    }
  });

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto text-slate-200">
      {/* Header & KPI (Simplified for brevity, use your previous layout here) */}
      <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
            <Activity className="text-blue-600" size={32} /> {t('intelligence')}
          </h1>
          <button onClick={() => setShowOrderDrawer(true)} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all">
            {t('create_new_order')}
          </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Total Sales</p>
            <h3 className="text-4xl font-black italic">{currency}{stats.totalSales.toLocaleString()}</h3>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Net Profit</p>
            <h3 className="text-4xl font-black italic text-emerald-500">{currency}{stats.netProfit.toLocaleString()}</h3>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Total Due</p>
            <h3 className="text-4xl font-black italic text-red-500">{currency}{stats.totalDue.toLocaleString()}</h3>
        </div>
      </div>

      {/* POS Drawer (Integrated Powerful Form) */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowOrderDrawer(false)} />
          <div className="relative w-full max-w-xl bg-[#090E14] h-full shadow-2xl p-6 overflow-y-auto border-l border-white/5 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black italic uppercase text-white">Quick POS</h2>
              <button onClick={() => setShowOrderDrawer(false)} className="p-2 bg-white/5 rounded-xl text-red-500"><X /></button>
            </div>

            <div className="space-y-6">
               {/* Type Switch */}
               <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                 <button onClick={() => setTransactionType("online")} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ONLINE</button>
                 <button onClick={() => setTransactionType("offline")} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>OFFLINE</button>
               </div>

               {/* Customer Info */}
               <div className="grid grid-cols-2 gap-4">
                 <input className="px-4 py-3 bg-[#11161D] border border-white/5 rounded-xl text-xs font-bold" placeholder="Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                 <input className="px-4 py-3 bg-[#11161D] border border-white/5 rounded-xl text-xs font-bold" placeholder="Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
               </div>

               {/* Product Selection */}
               <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                 <select className="w-full px-4 py-3 bg-[#11161D] border border-white/5 rounded-xl text-xs font-bold" value={selectedProduct.id} onChange={e => {
                   const p = inventory.find(i => i._id === e.target.value);
                   if(p) addToCart(p);
                 }}>
                   <option value="">Add Product...</option>
                   {inventory.map(i => <option key={i._id} value={i._id}>{i.name} ({i.stock})</option>)}
                 </select>
                 
                 <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] font-bold uppercase">{item.name} x {item.qty}</span>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={14}/></button>
                      </div>
                    ))}
                 </div>
               </div>

               {/* Payment Info */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Discount</label>
                    <input type="number" className="w-full px-4 py-3 bg-[#11161D] border border-white/5 rounded-xl text-xs font-black" value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
                  </div>
                  {transactionType === "online" && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Courier</label>
                      <input type="number" className="w-full px-4 py-3 bg-[#11161D] border border-white/5 rounded-xl text-xs font-black" value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
                    </div>
                  )}
               </div>

               {/* Summary & Checkout */}
               <div className="mt-10 p-6 bg-blue-600 rounded-[2rem]">
                 <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black uppercase text-white/70">Total Payable</span>
                   <span className="text-3xl font-black italic text-white">{currency}{summary.totalSell.toLocaleString()}</span>
                 </div>
                 <button onClick={() => createOrderMutation.mutate({
                    transactionType, customerName: customerInfo.name, customerPhone: customerInfo.phone,
                    products: cart, totalSell: summary.totalSell, paymentStatus: transactionType === 'offline' ? 'Paid' : paymentStatus
                 })} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-xs">Complete Transaction</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function addToCart(p) {
    const exists = cart.find(i => i.id === p._id);
    if(exists) setCart(cart.map(i => i.id === p._id ? {...i, qty: i.qty + 1} : i));
    else setCart([...cart, { id: p._id, name: p.name, price: p.sellingPrice, qty: 1 }]);
  }
}