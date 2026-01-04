"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from "@/context/AppContext";
import { Truck, Package, CheckCircle, RotateCcw, Clock } from 'lucide-react';

export default function CourierPage() {
  const { t } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // সব অর্ডার নিয়ে আসা
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error("Order fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // স্ট্যাটাস আপডেট করার ফাংশন
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders(); // লিস্ট রিফ্রেশ করা
      } else {
        alert("Status update failed!");
      }
    } catch (error) {
      alert("Error updating status!");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Returned': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <Truck size={40} className="text-blue-500" /> 
          {t?.courier || "Courier Management"}
        </h1>
      </div>

      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-6">Order Info</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {loading ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading Orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-500">কোনো অর্ডার পাওয়া যায়নি!</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-white uppercase tracking-tight">{order.productName || "Unknown Product"}</div>
                    <div className="text-[10px] text-slate-500 font-medium italic mt-1">QTY: {order.quantity} | ID: {order._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-bold text-slate-300">{order.customerName}</div>
                    <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <select 
                      className="bg-[#090E14] text-xs font-bold p-2 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all cursor-pointer"
                      value={order.status || 'Pending'}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="Shipped">📦 Shipped</option>
                      <option value="Delivered">✅ Delivered</option>
                      <option value="Returned">🔄 Returned</option>
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