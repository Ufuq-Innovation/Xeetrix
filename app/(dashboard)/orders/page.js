"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, History, Search, Trash2, ShoppingBag, 
  User, Phone, Package, Hash, Percent, Truck, 
  CheckCircle, Clock, Square, CheckSquare, Filter
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // ১. স্টেট এবং সেফটি হ্যান্ডলিং
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  
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
    paymentStatus: 'Pending'
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
    createOrderMutation.mutate({ ...formData, netProfit: preview.netProfit });
  };

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerPhone?.includes(searchTerm)
  );

  if (!mounted) return null;

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">
              {t('order_control_center')}
            </h1>
            <p className="text-slate-500 text-sm font-medium">{t('manage_orders_and_customers')}</p>
          </div>
        </div>
      </header>

      {/* SECTION 1: Dynamic Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#11161D] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
          <h2 className="text-lg font-black text-white uppercase italic mb-8 flex items-center gap-3">
            <PlusCircle size={20} className="text-blue-500" />
            {t('new_order_entry')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('customer_name')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input required className="w-full pl-12 pr-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40" 
                    value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('phone_number')}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input required className="w-full pl-12 pr-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40" 
                    value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('select_product')}</label>
              <select required className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none appearance-none" 
                value={formData.productId} onChange={handleProductChange}>
                <option value="">{t('choose_from_inventory')}</option>
                {inventory.map(item => (
                  <option key={item._id} value={item._id}>{item.name} ({t('stock')}: {item.stock})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">{t('qty')}</label>
                <input type="number" className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white" 
                  value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">{t('discount')}</label>
                <input type="number" className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white" 
                  value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">{t('courier')}</label>
                <input type="number" className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white" 
                  value={formData.courierCost} onChange={e => setFormData({...formData, courierCost: Number(e.target.value)})} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95">
                  {t('confirm')}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="bg-gradient-to-br from-[#11161D] to-blue-900/10 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
          <h3 className="text-white font-black italic uppercase tracking-widest text-sm">{t('order_summary')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400 text-xs uppercase font-bold">{t('total_revenue')}</span>
              <span className="text-white font-mono">{currency} {preview.totalSell.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400 text-xs uppercase font-bold">{t('product_cost')}</span>
              <span className="text-red-500 font-mono">-{currency} {preview.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-blue-400 font-black uppercase italic">{t('estimated_profit')}</span>
              <div className={`text-3xl font-black tabular-nums ${preview.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {currency} {preview.netProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Integrated History Table */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
            <History size={20} className="text-blue-500" />
            {t('order_history')}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input placeholder={t('search_orders')} className="pl-10 pr-4 py-3 bg-[#11161D] border border-white/5 rounded-xl text-sm text-white outline-none w-64 focus:border-blue-500/50" 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button className="p-3 bg-[#11161D] border border-white/5 rounded-xl text-slate-400"><Filter size={18} /></button>
          </div>
        </div>

        <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                  <th className="p-6">#</th>
                  <th className="p-6">{t('customer')}</th>
                  <th className="p-6">{t('product')}</th>
                  <th className="p-6 text-right">{t('amount')}</th>
                  <th className="p-6 text-right">{t('profit')}</th>
                  <th className="p-6 text-center">{t('status')}</th>
                  <th className="p-6 text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((o, idx) => (
                  <tr key={o._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-xs text-slate-600 font-mono">{idx + 1}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-200">{o.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{o.customerPhone}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm text-slate-300">{o.productName}</div>
                      <div className="text-[10px] text-blue-500 font-bold">QTY: {o.quantity}</div>
                    </td>
                    <td className="p-6 text-right font-mono text-white">
                      {currency} {((o.sellingPrice - o.discount) * o.quantity).toLocaleString()}
                    </td>
                    <td className={`p-6 text-right font-bold font-mono ${o.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {currency} {o.netProfit?.toLocaleString()}
                    </td>
                    <td className="p-6 text-center">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase">
                        {t(o.status || 'pending')}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => deleteMutation.mutate(o._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
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