"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, History, Search, Trash2, ShoppingBag, 
  User, Phone, Package, Hash, Percent, Truck, 
  CheckCircle, Filter, ChevronRight
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // ১. স্টেট এবং মাউন্ট হ্যান্ডলিং
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => setMounted(true), []);

  const lang = context?.lang || "en";
  const currency = useMemo(() => {
    const curr = context?.currency;
    if (curr && typeof curr === 'object') return curr.symbol || "৳";
    return curr || "৳";
  }, [context?.currency]);

  const initialFormState = {
    customerName: '',
    customerPhone: '',
    productId: '',
    productName: '',
    quantity: 1,
    costPrice: 0,
    sellingPrice: 0,
    discount: 0,
    courierCost: 100,
    otherExpense: 0,
  };
  const [formData, setFormData] = useState(initialFormState);

  /* ===================== DATA FETCHING ===================== */
  const { data: inventory = [], isLoading: invLoading } = useQuery({
    queryKey: ['inventory', lang],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', lang],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      return data.success ? data.orders : [];
    }
  });

  /* ===================== MUTATIONS ===================== */
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
      queryClient.invalidateQueries(['orders', 'inventory', 'dashboardStats']);
      setFormData(initialFormState);
      toast.success(t('order_successful_alert'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders', 'dashboardStats']);
      toast.success(t('order_deleted'));
    }
  });

  /* ===================== LOGIC ===================== */
  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const product = inventory.find(p => p._id === selectedId);
    if (product) {
      setFormData({ 
        ...formData, 
        productId: selectedId, 
        productName: product.name,
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0
      });
    }
  };

  const preview = useMemo(() => {
    const totalSell = (formData.sellingPrice - formData.discount) * formData.quantity;
    const totalCost = formData.costPrice * formData.quantity;
    const netProfit = totalSell - totalCost - formData.courierCost - formData.otherExpense;
    return { totalSell, totalCost, netProfit };
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inventory.find(p => p._id === formData.productId)?.stock < formData.quantity) {
      toast.error(t('insufficient_stock_alert'));
      return;
    }
    createOrderMutation.mutate({ ...formData, netProfit: preview.netProfit });
  };

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerPhone?.includes(searchTerm)
  );

  if (!mounted) return null;

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-7xl mx-auto transition-all duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-inner">
            <ShoppingBag size={30} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tighter">
              {t('order_management')}
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide">{t('manage_orders_and_customers')}</p>
          </div>
        </div>
        <div className="bg-[#11161D] px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="text-right border-r border-white/10 pr-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('total_orders')}</p>
            <p className="text-xl font-black text-white">{orders.length}</p>
          </div>
          <Clock className="text-blue-500 opacity-50" size={20} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-10">
            <PlusCircle className="text-blue-500" size={22} />
            <h2 className="text-lg font-black text-white uppercase italic tracking-widest">{t('create_new_order')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('customer_name')} *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input required className="w-full pl-12 pr-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                    placeholder={t('customer_name')} value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('phone_number')} *</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input required className="w-full pl-12 pr-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                    placeholder="01XXXXXXXXX" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('product')} *</label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <select required className="w-full pl-12 pr-10 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none appearance-none focus:ring-2 focus:ring-blue-500/40 transition-all" 
                  value={formData.productId} onChange={handleProductChange}>
                  <option value="">{t('select_a_product')}</option>
                  {inventory.map(item => (
                    <option key={item._id} value={item._id}>{item.name} ({t('stock')}: {item.stock})</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 rotate-90" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('quantity')}</label>
                <input type="number" min="1" className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/40 transition-all" 
                  value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('discount')}</label>
                <input type="number" className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/40 transition-all" 
                  value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('courier_cost')}</label>
                <input type="number" className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/40 transition-all" 
                  value={formData.courierCost} onChange={e => setFormData({...formData, courierCost: Number(e.target.value)})} />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={createOrderMutation.isPending} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50">
                  {createOrderMutation.isPending ? t('syncing') : t('confirm_order')}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#11161D] to-[#1a2230] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-white opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
              <ShoppingBag size={150} />
            </div>
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 italic">{t('order_preview')}</h3>
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-bold uppercase">{t('total_sales')}</span>
                <span className="text-white font-mono font-black">{currency} {preview.totalSell.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-red-500/80">
                <span className="text-slate-500 text-sm font-bold uppercase">{t('total_cost')}</span>
                <span className="font-mono font-black">-{currency} {preview.totalCost.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5 my-2"></div>
              <div className="pt-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('net_profit')}</p>
                <div className={`text-4xl font-black italic tracking-tighter ${preview.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {currency} {preview.netProfit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <History size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('order_stats')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-500 uppercase">{t('pending_orders')}</p>
                <p className="text-xl font-black text-white">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-500 uppercase">{t('completed')}</p>
                <p className="text-xl font-black text-green-500">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <History size={24} className="text-blue-500" />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t('order_history')}</h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input placeholder={t('search_orders')} className="pl-12 pr-6 py-3.5 bg-[#11161D] border border-white/5 rounded-2xl text-sm text-white outline-none w-full md:w-80 focus:border-blue-500/50 transition-all shadow-lg" 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-white/5">
                  <th className="p-6">{t('customer')}</th>
                  <th className="p-6">{t('product')}</th>
                  <th className="p-6 text-right">{t('amount')}</th>
                  <th className="p-6 text-right">{t('net_profit')}</th>
                  <th className="p-6 text-center">{t('status')}</th>
                  <th className="p-6 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ordersLoading ? (
                  <tr><td colSpan="6" className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">{t('syncing')}...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="p-20 text-center text-slate-600 italic font-medium">{t('no_orders_found')}</td></tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                      <td className="p-6">
                        <div className="font-black text-slate-200 group-hover:text-blue-400 transition-colors">{o.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{o.customerPhone}</div>
                      </td>
                      <td className="p-6 text-sm text-slate-400 font-medium">
                        {o.productName} <span className="text-blue-500/50 ml-1">× {o.quantity}</span>
                      </td>
                      <td className="p-6 text-right font-mono font-black text-white">
                        {currency} {((o.sellingPrice - o.discount) * o.quantity).toLocaleString()}
                      </td>
                      <td className={`p-6 text-right font-black font-mono ${o.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {currency} {o.netProfit?.toLocaleString()}
                      </td>
                      <td className="p-6 text-center">
                        <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-tighter border border-blue-500/20">
                          {t(o.status || 'pending')}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => deleteMutation.mutate(o._id)} className="p-3 bg-red-500/5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}