"use client";
import React, { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]); // মাল্টিপল ডিলিট এর জন্য

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      });
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("আপনি কি নিশ্চিত ডিলিট করতে চান?")) return;
    const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchOrders();
  };

  const handleSelect = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const deleteSelected = async () => {
    if (!confirm(`আপনি কি ${selectedOrders.length}টি অর্ডার ডিলিট করতে চান?`)) return;
    // লুপ চালিয়ে ডিলিট (অথবা ব্যাকএন্ডে বাল্ক ডিলিট এপিআই বানানো যায়)
    for (let id of selectedOrders) {
      await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
    }
    setSelectedOrders([]);
    fetchOrders();
  };

  if (loading) return <div className="text-white p-10">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Order History</h1>
        {selectedOrders.length > 0 && (
          <button onClick={deleteSelected} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase">
            Delete Selected ({selectedOrders.length})
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-[#11161D] rounded-[2.5rem] border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <th className="p-6 w-10"><input type="checkbox" onChange={(e) => e.target.checked ? setSelectedOrders(orders.map(o => o._id)) : setSelectedOrders([])} /></th>
              <th className="p-6">Customer</th>
              <th className="p-6">Product</th>
              <th className="p-6">Qty</th>
              <th className="p-6">Selling Price</th>
              <th className="p-6">Net Profit</th>
              <th className="p-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                  <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => handleSelect(order._id)} />
                </td>
                <td className="p-6 font-medium">
                  {order.customerName} <br />
                  <span className="text-xs text-slate-500">{order.customerPhone}</span>
                </td>
                <td className="p-6">{order.productName}</td>
                <td className="p-6">{order.quantity}</td>
                <td className="p-6">৳ {order.sellingPrice * order.quantity}</td>
                <td className="p-6 font-bold text-green-500">৳ {order.netProfit}</td>
                <td className="p-6">
                  <button onClick={() => handleDelete(order._id)} className="text-red-500 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}