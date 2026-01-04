"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";

export default function OrdersPage() {
  const context = useApp();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productId: '',
    productName: '',
    quantity: 1,
    costPrice: 0,
    sellingPrice: 0,
    courierCost: 100,
    otherExpense: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        if (data.success) setInventory(data.products || []);
      } catch (error) {
        console.error("Inventory load failed:", error);
      }
    };
    fetchProducts();
  }, []);

  if (!context) return null;
  const { t } = context;

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const product = inventory.find(p => p._id === selectedId);
    if (product) {
      setFormData({ ...formData, productId: selectedId, productName: product.name });
    } else {
      setFormData({ ...formData, productId: '', productName: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ফ্রন্টএন্ড স্টক চেক
    const selectedProduct = inventory.find(p => p._id === formData.productId);
    if (selectedProduct && selectedProduct.stock < formData.quantity) {
      alert(`স্টকে পর্যাপ্ত মাল নেই! বর্তমান স্টক: ${selectedProduct.stock}`);
      return;
    }

    setLoading(true);
    const netProfit = (formData.sellingPrice * formData.quantity) - 
                      (formData.costPrice * formData.quantity) - 
                      formData.courierCost - formData.otherExpense;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, netProfit }),
      });

      const data = await res.json();
      if (data.success) {
        alert("অর্ডার সফলভাবে সেভ হয়েছে!");
        setFormData({ 
          customerName: '', customerPhone: '', productId: '', productName: '', 
          quantity: 1, costPrice: 0, sellingPrice: 0, courierCost: 100, otherExpense: 0 
        });
        // ইনভেন্টরি ডাটা রিফ্রেশ করা যাতে স্টক আপডেট দেখায়
        const updatedInventory = await fetch('/api/inventory').then(r => r.json());
        if (updatedInventory.success) setInventory(updatedInventory.products);
      } else {
        alert("এরর: " + data.error);
      }
    } catch (error) {
      alert("সার্ভার কানেকশন এরর!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
      <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
        {t?.orders || "New Order"}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
        <input type="text" placeholder="কাস্টমারের নাম" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" 
          value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
        
        <input type="text" placeholder="ফোন নম্বর" required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" 
          value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} />

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] text-slate-500 font-bold ml-2 uppercase">Select Product</label>
          <select required className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600"
            value={formData.productId} onChange={handleProductChange}>
            <option value="" className="bg-[#11161D]">পণ্য সিলেক্ট করুন</option>
            {inventory.map((item) => (
              <option key={item._id} value={item._id} className="bg-[#11161D]">
                {item.name} (Stock: {item.stock})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-bold ml-2 uppercase">Quantity</label>
          <input type="number" required className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" 
            value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
        </div>

        {/* বাকি ইনপুট ফিল্ডগুলো আপনার আগের কোড অনুযায়ী থাকবে... */}
        {/* ... (Cost Price, Selling Price, Courier Cost) ... */}

        <button type="submit" disabled={loading} className="md:col-span-2 bg-blue-600 hover:bg-blue-700 p-6 rounded-2xl font-black uppercase tracking-widest transition-all">
          {loading ? "SAVING..." : "CONFIRM ORDER"}
        </button>
      </form>
    </div>
  );
}