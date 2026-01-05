"use client";
import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Trash2, Clock } from 'lucide-react';

export default function OrdersPage() {
  const context = useApp();
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
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  // 2. Fetch Orders History
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
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
    onSuccess: () => {
      // Invalidate and refetch orders and dashboard stats
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['inventory']);
      alert("Order Successful!");
      setFormData({ customerName: '', customerPhone: '', productId: '', productName: '', quantity: 1, costPrice: 0, sellingPrice: 0, discount: 0, courierCost: 100, otherExpense: 0 });
    }
  });

  // 4. Delete Order Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
    }
  });

  if (!context) return null;
  const { t } = context;

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
    const product = inventory.find(p => p._id === formData.productId);
    if (product && product.stock < formData.quantity) {
      alert("Insufficient Stock!");
      return;
    }

    const totalSell = (formData.sellingPrice - formData.discount) * formData.quantity;
    const totalCost = formData.costPrice * formData.quantity;
    const netProfit = totalSell - totalCost - formData.courierCost - formData.otherExpense;

    createOrderMutation.mutate({ ...formData, netProfit });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 p-4 md:p-0 pb-20">
      {/* 1. Order Entry Form */}
      <div className="space-y-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
            <ShoppingBag className="text-blue-500" size={36} /> {t?.orders || "Create New Order"}
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <input type="text" placeholder="Customer Name" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
            <input type="text" placeholder="Phone Number" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} />
            
            <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-slate-500 font-bold ml-2 uppercase tracking-widest">Select Product</label>
                <select required className="w-full bg-[#0d1117] p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600 appearance-none" value={formData.productId} onChange={handleProductChange}>
                    <option value="">Select a Product</option>
                    {inventory.map((item) => (<option key={item._id} value={item._id}>{item.name} (Stock: {item.stock})</option>))}
                </select>
            </div>

            <div className="grid grid-cols-3 md:col-span-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold ml-2 uppercase">Quantity</label>
                    <input type="number" required className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold ml-2 uppercase">Discount</label>
                    <input type="number" className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold ml-2 uppercase">Courier</label>
                    <input type="number" className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" value={formData.courierCost} onChange={(e) => setFormData({...formData, courierCost: Number(e.target.value)})} />
                </div>
            </div>

            <button type="submit" disabled={createOrderMutation.isPending} className="md:col-span-2 bg-blue-600 hover:bg-blue-700 p-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20">
              {createOrderMutation.isPending ? "SAVING..." : "CONFIRM ORDER"}
            </button>
        </form>
      </div>

      {/* 2. Orders History Table */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-400 flex items-center gap-3">
            <Clock size={24} /> Recent Orders
        </h2>
        <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/2">
                        <tr>
                            <th className="p-6">Customer</th>
                            <th className="p-6">Product</th>
                            <th className="p-6">Profit</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {ordersLoading ? (
                           <tr><td colSpan="5" className="p-10 text-center text-slate-500 animate-pulse">Synchronizing Data...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="5" className="p-10 text-center text-slate-500 italic">No orders found.</td></tr>
                        ) : orders.map((order) => (
                            <tr key={order._id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                                <td className="p-6">
                                    <div className="font-bold">{order.customerName}</div>
                                    <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                                </td>
                                <td className="p-6 text-sm">
                                    <div className="font-medium text-slate-300">{order.productName}</div>
                                    <div className="text-[10px] text-slate-500">QTY: {order.quantity}</div>
                                </td>
                                <td className="p-6 font-mono text-green-500 font-bold">৳{order.netProfit?.toFixed(2)}</td>
                                <td className="p-6">
                                    <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full">
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <button onClick={() => { if(confirm("Delete order?")) deleteOrderMutation.mutate(order._id) }} className="text-slate-600 hover:text-red-500 transition-colors">
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
    </div>
  );
}