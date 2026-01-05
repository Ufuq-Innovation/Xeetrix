"use client";

import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function InventoryPage() {
  const context = useApp();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', stock: '', sku: '', costPrice: '', sellingPrice: '',
    description: '', category: '', source: '' 
  });

  // 1. Fetch Inventory Data using useQuery
  const { data: products = [], isLoading: fetching } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  // 2. Mutation for Adding/Updating Product
  const productMutation = useMutation({
    mutationFn: async (bodyData) => {
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/inventory', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error('Failed to save product');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate cache to trigger auto-refresh across the app
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['dashboardStats']);
      
      setFormData({ name: '', stock: '', sku: '', costPrice: '', sellingPrice: '', description: '', category: '', source: '' });
      setEditingId(null);
      alert(editingId ? "Product Updated!" : "Product Added!");
    }
  });

  if (!context) return null;
  const { t } = context;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) return;
    
    const bodyData = editingId ? { ...formData, id: editingId } : formData;
    productMutation.mutate(bodyData);
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name, sku: product.sku || '', stock: product.stock,
      costPrice: product.costPrice || '', sellingPrice: product.sellingPrice || '',
      description: product.description || '', category: product.category || '', source: product.source || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <header>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
          {t?.inventory || "Inventory"}
        </h1>
      </header>

      {/* Product Entry Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#11161D] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
        <input type="text" placeholder="Product Name" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="text" placeholder="Category" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
        <input type="text" placeholder="Source/Supplier" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
        <input type="number" placeholder="Stock Quantity" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
        <input type="number" placeholder="Cost Price" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} />
        <input type="number" placeholder="Selling Price" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} />
        <textarea placeholder="Description" className="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600 h-[58px]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        <button type="submit" disabled={productMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl transition-all h-[58px] shadow-lg shadow-blue-900/20">
          {productMutation.isPending ? "PROCESSING..." : editingId ? "UPDATE PRODUCT" : "ADD TO STOCK"}
        </button>
      </form>

      {/* Inventory Table */}
      <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 uppercase font-black border-b border-white/5 bg-white/[0.02]">
              <tr>
                <th className="p-6">Product</th>
                <th className="p-6">Category/Source</th>
                <th className="p-6">Stock</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {fetching ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 animate-pulse uppercase text-xs tracking-widest">Synchronizing Inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 italic">No products in stock.</td></tr>
              ) : products.map((item) => (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold">
                    <div className="text-white">{item.name}</div>
                    <div className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">CP: ৳{item.costPrice} | SP: ৳{item.sellingPrice}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-slate-300 text-xs font-medium">{item.category || 'N/A'}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{item.source || 'N/A'}</div>
                  </td>
                  <td className="p-6 text-2xl font-black text-blue-500">{item.stock}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => startEdit(item)} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-blue-500 font-bold uppercase text-[10px] transition-all border border-white/5">Edit</button>
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