"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";

export default function InventoryPage() {
  const context = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ name: '', stock: '', sku: '', costPrice: '', sellingPrice: '' });

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);
  if (!context) return null;
  const { t } = context;

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) return;
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: '', stock: '', sku: '', costPrice: '', sellingPrice: '' });
        await fetchInventory();
        alert("প্রোডাক্ট স্টকে যোগ হয়েছে!");
      }
    } catch (error) { alert("সেভ করতে সমস্যা হয়েছে!"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">{t?.inventory || "Inventory"}</h1>
      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
        <input type="text" placeholder="Product Name" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="text" placeholder="SKU/Code" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
        <input type="number" placeholder="Stock Quantity" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
        <input type="number" placeholder="Cost Price" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} />
        <input type="number" placeholder="Selling Price" className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} />
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all h-[58px]">{loading ? "Adding..." : "Add to Stock"}</button>
      </form>
      <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="text-[10px] text-slate-500 uppercase font-black border-b border-white/5">
            <tr><th className="p-6">Product</th><th className="p-6">Cost / Sell</th><th className="p-6">Stock</th><th className="p-6">Status</th></tr>
          </thead>
          <tbody className="text-white">
            {fetching ? (<tr><td colSpan="4" className="p-10 text-center">Loading...</td></tr>) : products.map((item) => (
              <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-6 font-bold">{item.name}</td>
                <td className="p-6 text-slate-400">{item.costPrice || 0} / {item.sellingPrice || 0}</td>
                <td className="p-6 text-xl font-black">{item.stock}</td>
                <td className="p-6">{Number(item.stock) > 5 ? <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-[10px] font-bold">In Stock</span> : <span className="text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-[10px] font-bold">Low</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}