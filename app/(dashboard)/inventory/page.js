"use client";
import React, { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', stock: '', sku: '' });

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory');
    const data = await res.json();
    if (data.success) setProducts(data.products);
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormData({ name: '', stock: '', sku: '' });
      fetchInventory();
      alert("প্রোডাক্ট স্টকে যোগ হয়েছে!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Inventory</h1>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
        <input type="text" placeholder="Product Name" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600"
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="text" placeholder="SKU/Code" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600"
          value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
        <input type="number" placeholder="Stock Quantity" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600"
          value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
          {loading ? "Adding..." : "Add to Stock"}
        </button>
      </form>

      {/* Inventory List */}
      <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[10px] text-slate-500 uppercase font-black border-b border-white/5">
            <tr>
              <th className="p-6">Product</th>
              <th className="p-6">SKU</th>
              <th className="p-6">Current Stock</th>
              <th className="p-6">Status</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {products.map((item) => (
              <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-6 font-bold">{item.name}</td>
                <td className="p-6 text-slate-400">{item.sku || 'N/A'}</td>
                <td className="p-6 text-xl font-black">{item.stock}</td>
                <td className="p-6">
                  {item.stock > 5 ? 
                    <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs">In Stock</span> : 
                    <span className="text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs">Low Stock</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}