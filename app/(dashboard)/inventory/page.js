"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";

export default function InventoryPage() {
  const context = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', stock: '', sku: '', costPrice: '', sellingPrice: '',
    description: '', category: '', source: '' 
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      console.error("Inventory fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (!context) return null;
  const { t } = context;

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) return;
    setLoading(true);
    
    const method = editingId ? 'PUT' : 'POST';
    const bodyData = editingId ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch('/api/inventory', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      
      if (res.ok) {
        setFormData({ name: '', stock: '', sku: '', costPrice: '', sellingPrice: '', description: '', category: '', source: '' });
        setEditingId(null);
        await fetchInventory();
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
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
      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
        <input type="text" placeholder="Product Name" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="text" placeholder="Category" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
        <input type="text" placeholder="Source/Supplier" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
        <input type="number" placeholder="Stock Quantity" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
        <input type="number" placeholder="Cost Price" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} />
        <input type="number" placeholder="Selling Price" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} />
        <textarea placeholder="Description" className="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600 h-[58px]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all h-[58px]">
          {loading ? "Processing..." : editingId ? "Update Product" : "Add to Stock"}
        </button>
      </form>

      {/* Inventory Table */}
      <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 uppercase font-black border-b border-white/5">
              <tr>
                <th className="p-6">Product</th>
                <th className="p-6">Category/Source</th>
                <th className="p-6">Stock</th>
                <th className="p-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {fetching ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">Fetching inventory data...</td></tr>
              ) : products.map((item) => (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold">
                    {item.name} 
                    <br/>
                    <span className="text-[10px] font-normal text-slate-400">CP: {item.costPrice} | SP: {item.sellingPrice}</span>
                  </td>
                  <td className="p-6 text-slate-400 text-xs">{item.category || 'N/A'} <br/> {item.source || 'N/A'}</td>
                  <td className="p-6 text-xl font-black">{item.stock}</td>
                  <td className="p-6">
                    <button onClick={() => startEdit(item)} className="text-blue-500 font-bold uppercase text-[10px] hover:text-blue-400 transition-colors">Edit</button>
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