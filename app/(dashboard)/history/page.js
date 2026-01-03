"use client";
import React, { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white p-10">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Order History</h1>

      <div className="overflow-x-auto bg-[#11161D] rounded-[2.5rem] border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <th className="p-6">Customer</th>
              <th className="p-6">Product</th>
              <th className="p-6">Qty</th>
              <th className="p-6">Selling Price</th>
              <th className="p-6">Net Profit</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-6 font-medium">
                  {order.customerName} <br />
                  <span className="text-xs text-slate-500">{order.customerPhone}</span>
                </td>
                <td className="p-6">{order.productName}</td>
                <td className="p-6">{order.quantity}</td>
                <td className="p-6">৳ {order.sellingPrice * order.quantity}</td>
                <td className="p-6 font-bold text-green-500">৳ {order.netProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-10 text-center text-slate-500">কোনো অর্ডার পাওয়া যায়নি!</div>
        )}
      </div>
    </div>
  );
}