"use client";
import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";

export default function OrdersPage() {
  const context = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productName: '',
    quantity: 1,
    costPrice: 0,
    sellingPrice: 0,
    courierCost: 100,
    otherExpense: 0,
  });

  // সেফটি চেক
  if (!context) return null;
  const { t } = context;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setFormData({ customerName: '', customerPhone: '', productName: '', quantity: 1, costPrice: 0, sellingPrice: 0, courierCost: 100, otherExpense: 0 });
      } else {
        alert("ভুল হয়েছে: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("সার্ভার কানেকশন এরর!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
        {t?.orders || "New Order"}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
        <input type="text" placeholder="কাস্টমারের নাম" required className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white" 
          value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
        
        <input type="text" placeholder="ফোন নম্বর" required className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white" 
          value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} />

        <input type="text" placeholder="পণ্যের নাম" required className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white" 
          value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} />

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-bold ml-2">QUANTITY</label>
          <input type="number" className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" 
            value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-bold ml-2">COST PRICE</label>
          <input type="number" className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" 
            value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-bold ml-2">SELLING PRICE</label>
          <input type="number" className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white" 
            value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
        </div>

        <button type="submit" disabled={loading} className="md:col-span-2 bg-blue-600 hover:bg-blue-700 p-6 rounded-2xl font-black uppercase tracking-widest transition-all">
          {loading ? "SAVING..." : "CONFIRM ORDER"}
        </button>
      </form>
    </div>
  );
}