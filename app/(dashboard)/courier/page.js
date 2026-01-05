"use client";

import React from 'react';
import { useTranslation } from 'react-i18next'; // Direct hook for instant language updates
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, Search } from 'lucide-react';

export default function CourierPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common'); // Hook for real-time translation
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");

  /**
   * Fetch orders for courier management.
   * Key includes 'lang' to ensure reactivity if data format changes per locale.
   */
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', lang],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      return data.success ? data.orders : [];
    }
  });

  /**
   * Mutation for updating order delivery status.
   */
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['inventory']);
    }
  });

  // Filter logic based on search term
  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm) ||
    order._id.slice(-6).includes(searchTerm.toUpperCase())
  );

  /**
   * Dynamic styling for delivery status badges.
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Returned': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <Truck size={40} className="text-blue-500" /> 
          {t('courier_management')}
        </h1>

        {/* Search Bar Implementation */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            className="w-full bg-[#11161D] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Parcels Table Container */}
      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/2">
              <tr>
                <th className="p-6">{t('order_details')}</th>
                <th className="p-6">{t('customer_info')}</th>
                <th className="p-6">{t('current_status')}</th>
                <th className="p-6 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                    {t('syncing_pipeline')}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-500 uppercase text-xs font-bold italic">
                    {t('no_parcels')}
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-white uppercase tracking-tight">{order.productName}</div>
                    <div className="text-[10px] text-slate-500 font-medium italic mt-1">
                      {t('qty')}: {order.quantity} | {t('ref')}: {order._id.slice(-6).toUpperCase()}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-bold text-slate-300">{order.customerName}</div>
                    <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                      {/* Dynamic translation based on status value */}
                      {t(order.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <select 
                      disabled={updateStatusMutation.isPending}
                      className="bg-[#090E14] text-[10px] font-black uppercase p-2 px-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all cursor-pointer text-slate-300 disabled:opacity-50"
                      value={order.status || 'Pending'}
                      onChange={(e) => updateStatusMutation.mutate({ id: order._id, newStatus: e.target.value })}
                    >
                      <option value="Pending">🕒 {t('pending')}</option>
                      <option value="Shipped">📦 {t('shipped')}</option>
                      <option value="Delivered">✅ {t('delivered')}</option>
                      <option value="Returned">🔄 {t('returned')}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}