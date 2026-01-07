"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; 
import { toast } from 'sonner';
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Trash2, Clock, User, Package, DollarSign, Truck, Percent, Hash, CheckCircle } from 'lucide-react';

export default function OrdersPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
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
  });

  // 1. Fetch Inventory Data
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory', lang],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  // 2. Fetch Recent Orders History
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', lang],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      return data.success ? data.orders : [];
    }
  });

  // 3. Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (!res.ok) throw new Error('Order failed');
      return res.json();
    },
    onMutate: () => {
      toast.loading(t('order_processing'), { id: 'order' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders', 'dashboardStats', 'inventory']);
      toast.success(t('order_successful_alert'), { id: 'order', duration: 3000 });
      setFormData({
        customerName: '', customerPhone: '', productId: '', productName: '',
        quantity: 1, costPrice: 0, sellingPrice: 0, discount: 0,
        courierCost: 100, otherExpense: 0,
      });
    },
    onError: () => {
      toast.error(t('order_failed'), { id: 'order' });
    },
  });

  // 4. Delete Order Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onMutate: () => {
      toast.loading(t('deleting_order'), { id: 'delete-order' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders', 'dashboardStats']);
      toast.success(t('order_deleted'), { id: 'delete-order' });
    },
    onError: () => {
      toast.error(t('delete_failed'), { id: 'delete-order' });
    },
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.productId) {
      toast.error(t('fill_required_fields'));
      return;
    }
    const product = inventory.find(p => p._id === formData.productId);
    if (product && product.stock < formData.quantity) {
      toast.error(t('insufficient_stock_alert'));
      return;
    }
    const totalSell = (formData.sellingPrice - formData.discount) * formData.quantity;
    const totalCost = formData.costPrice * formData.quantity;
    const netProfit = totalSell - totalCost - formData.courierCost - formData.otherExpense;
    createOrderMutation.mutate({ ...formData, netProfit });
  };

  const confirmDeleteOrder = (id) => {
    toast.warning(t('confirm_delete'), {
      action: {
        label: t('delete'),
        onClick: () => deleteOrderMutation.mutate(id)
      },
      duration: 5000,
    });
  };

  const preview = (() => {
    const totalSell = (formData.sellingPrice - formData.discount) * formData.quantity;
    const totalCost = formData.costPrice * formData.quantity;
    const netProfit = totalSell - totalCost - formData.courierCost - formData.otherExpense;
    return {
      totalSell, totalCost, netProfit,
      profitPercentage: totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0
    };
  })();

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl">
            <ShoppingBag className="text-blue-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              {t('create_new_order')}
            </h1>
            <p className="text-slate-400 mt-1">{t('manage_orders_and_customers')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">{t('total_orders')}</p>
          <p className="text-xl font-bold text-white">{orders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2 bg-[#11161D] p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">{t('order_details')}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <User size={16} /> {t('customer_name')} *
                </label>
                <input 
                  type="text" 
                  placeholder={t('customer_name_placeholder')}
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  value={formData.customerName} 
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <User size={16} /> {t('phone_number')} *
                </label>
                <input 
                  type="text" 
                  placeholder={t('phone_number_placeholder')}
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  value={formData.customerPhone} 
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Package size={16} /> {t('select_product')} *
              </label>
              <select 
                className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                value={formData.productId} 
                onChange={handleProductChange}
              >
                <option value="">{t('select_a_product')}</option>
                {inventoryLoading ? (
                  <option disabled>{t('loading_products')}</option>
                ) : (
                  inventory.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({t('stock')}: {item.stock}) - ৳ {item.sellingPrice || 0}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <Hash size={16} /> {t('quantity')} *
                </label>
                <input 
                  type="number" min="1"
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <Percent size={16} /> {t('discount')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
                  <input 
                    type="number"
                    className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.discount} 
                    onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <Truck size={16} /> {t('courier_cost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
                  <input 
                    type="number"
                    className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={formData.courierCost} 
                    onChange={(e) => setFormData({...formData, courierCost: Number(e.target.value)})} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={createOrderMutation.isPending || !formData.productId}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold uppercase text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
            >
              {createOrderMutation.isPending ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{t('saving')}</>
              ) : (
                <><CheckCircle size={20} />{t('confirm_order')}</>
              )}
            </button>
          </form>
        </div>

        {/* Preview & Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#11161D] to-[#0d1219] p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">{t('order_preview')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">{t('total_sell')}</span>
                <span className="text-green-500 font-bold">৳ {preview.totalSell.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400">{t('total_cost')}</span>
                <span className="text-red-400 font-bold">৳ {preview.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border-t border-white/10 pt-4">
                <span className="text-white font-bold">{t('net_profit')}</span>
                <span className={`text-2xl font-black ${preview.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ৳ {preview.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#11161D] p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="text-blue-500" size={20} /> {t('order_stats')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('total_orders')}</span>
                <span className="text-white font-bold">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('pending_orders')}</span>
                <span className="text-yellow-500 font-bold">{orders.filter(o => o.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            <Clock className="text-blue-500" size={20} /> {t('recent_orders')}
          </h3>
          <span className="text-sm text-slate-500">{orders.length} {t('orders')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white/5">
              <tr className="text-xs uppercase text-slate-500">
                <th className="p-4 text-left font-medium">{t('customer')}</th>
                <th className="p-4 text-left font-medium">{t('product')}</th>
                <th className="p-4 text-left font-medium">{t('quantity')}</th>
                <th className="p-4 text-left font-medium">{t('total_amount')}</th>
                <th className="p-4 text-left font-medium">{t('profit')}</th>
                <th className="p-4 text-left font-medium">{t('status')}</th>
                <th className="p-4 text-left font-medium">{t('date')}</th>
                <th className="p-4 text-left font-medium">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    {t('syncing_data')}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">{t('no_orders_found')}</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors text-white">
                    <td className="p-4">
                      <div className="font-bold">{order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="p-4">{order.productName}</td>
                    <td className="p-4 font-bold text-blue-500">{order.quantity}</td>
                    <td className="p-4 text-green-400 font-bold">
                      ৳ {((order.sellingPrice - order.discount) * order.quantity).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${order.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ৳ {order.netProfit?.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 uppercase`}>
                        {t(order.status?.toLowerCase() || 'pending')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => confirmDeleteOrder(order._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}