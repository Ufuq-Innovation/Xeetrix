"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from "@/context/AppContext";
import { Trash2, History, CheckSquare, Square } from 'lucide-react';

/**
 * Order History Page
 * Provides a detailed audit log of all transactions with bulk management capabilities.
 */
export default function HistoryPage() {
  const { t } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);

  /** Fetch synchronized order records */
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error("Audit log synchronization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  /** Handle single record deletion */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this record?")) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchOrders();
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };

  /** Toggle selection for bulk actions */
  const handleSelect = (id) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  /** Execute bulk deletion process */
  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedOrders.length} selected records permanently?`)) return;
    
    setLoading(true);
    try {
      // Executing sequential deletion (Optimization: Implement bulk DELETE endpoint in future)
      await Promise.all(
        selectedOrders.map(id => fetch(`/api/orders?id=${id}`, { method: 'DELETE' }))
      );
      setSelectedOrders([]);
      await fetchOrders();
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <History size={40} className="text-blue-500" /> 
          Order History
        </h1>
        
        {selectedOrders.length > 0 && (
          <button 
            onClick={deleteSelected} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete Selected ({selectedOrders.length})
          </button>
        )}
      </header>

      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 font-black uppercase border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-6 w-10">
                  <button 
                    onClick={() => setSelectedOrders(selectedOrders.length === orders.length ? [] : orders.map(o => o._id))}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {selectedOrders.length === orders.length ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="p-6 tracking-widest">Customer Profile</th>
                <th className="p-6 tracking-widest">Product Details</th>
                <th className="p-6 tracking-widest text-right">Revenue</th>
                <th className="p-6 tracking-widest text-right">Net Profit</th>
                <th className="p-6 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                    Synchronizing History Data...
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order._id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${selectedOrders.includes(order._id) ? 'bg-blue-600/5' : ''}`}>
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
                    <div className="text-sm font-medium">{order.productName}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Unit: {order.quantity}</div>
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
                      onClick={() => handleDelete(order._id)} 
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