"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Hook for reactive translation
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, History, CheckSquare, Square, Search } from 'lucide-react';

export default function HistoryPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common'); // Professional i18n hook
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * 1. Fetch Orders with React Query.
   * Key includes 'lang' to ensure reactivity across different locales.
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
   * 2. Single Record Delete Mutation.
   */
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
    }
  });

  /**
   * 3. Bulk Delete Mutation for multiple selected records.
   */
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => fetch(`/api/orders?id=${id}`, { method: 'DELETE' })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
      setSelectedOrders([]);
      alert(t('bulk_delete_success')); // Localized alert
    }
  });

  // Client-side filtering logic based on customer name or phone
  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  );

  // Toggle selection for bulk actions
  const handleSelect = (id) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <History size={40} className="text-blue-500" /> 
          {t('order_history')}
        </h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Localized Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={t('search_customer_placeholder')} 
              className="w-full bg-[#11161D] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bulk Action Button */}
          {selectedOrders.length > 0 && (
            <button 
              onClick={() => { if(confirm(t('confirm_bulk_delete'))) bulkDeleteMutation.mutate(selectedOrders) }} 
              disabled={bulkDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
            >
              <Trash2 size={14} /> 
              {bulkDeleteMutation.isPending ? t('deleting') : `${t('delete')} (${selectedOrders.length})`}
            </button>
          )}
        </div>
      </header>

      {/* History Data Table */}
      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 font-black uppercase border-b border-white/5 bg-white/2">
              <tr>
                <th className="p-6 w-10">
                  <button 
                    onClick={() => setSelectedOrders(selectedOrders.length === filteredOrders.length ? [] : filteredOrders.map(o => o._id))}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                  </button>
                </th>
                <th className="p-6 tracking-widest">{t('customer_profile')}</th>
                <th className="p-6 tracking-widest">{t('product_details')}</th>
                <th className="p-6 tracking-widest text-right">{t('revenue')}</th>
                <th className="p-6 tracking-widest text-right">{t('net_profit')}</th>
                <th className="p-6 tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                    {t('syncing_history')}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-slate-500 italic uppercase text-xs">
                    {t('no_records_found')}
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className={`border-b border-white/5 hover:bg-white/1 transition-colors ${selectedOrders.includes(order._id) ? 'bg-blue-600/5' : ''}`}>
                  <td className="p-6">
                    <button onClick={() => handleSelect(order._id)} className="text-slate-500">
                      {selectedOrders.includes(order._id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-slate-200">{order.customerName}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{order.customerPhone}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-medium text-slate-300">{order.productName}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{t('unit')}: {order.quantity}</div>
                  </td>
                  <td className="p-6 text-right font-mono text-sm text-slate-400">
                    ৳ {(order.sellingPrice * order.quantity).toLocaleString()}
                  </td>
                  <td className="p-6 text-right">
                    <span className="font-black text-green-500 font-mono">
                      ৳ {order.netProfit?.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => { if(confirm(t('confirm_delete'))) deleteMutation.mutate(order._id) }} 
                      className="text-slate-600 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
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