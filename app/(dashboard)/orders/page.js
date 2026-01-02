"use client";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Loader2, Plus, Wallet } from 'lucide-react';

export default function OrdersPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', productName: '',
    quantity: 1, costPrice: '', sellingPrice: '', courierCost: 120, otherExpense: 0
  });

  // ইউজার ইন্টারফেসের জন্য রিয়েল-টাইম লাভ হিসাব
  const profitPreview = (form.sellingPrice * form.quantity) - 
                        ((form.costPrice * form.quantity) + Number(form.courierCost) + Number(form.otherExpense));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert(t.lang === 'bn' ? "অর্ডারটি সফলভাবে সংরক্ষিত হয়েছে!" : "Order Saved Successfully!");
        setForm({ customerName: '', customerPhone: '', productName: '', quantity: 1, costPrice: '', sellingPrice: '', courierCost: 120, otherExpense: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">{t.orders}</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Inventory Sync & Logistics Control</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* বাম পাশ: গ্রাহকের তথ্য */}
        <div className="lg:col-span-7 bg-[#11161D] p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-4">Customer Intelligence</h3>
          <div className="space-y-4">
            <input placeholder="Customer Name" className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required />
            <input placeholder="Phone Number" className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} required />
            <input placeholder="Product Description" className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} required />
          </div>
        </div>

        {/* ডান পাশ: প্রফিট ইঞ্জিন */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#11161D] p-10 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-4">Financial Preview</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Cost" className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-sm font-bold" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} required />
              <input type="number" placeholder="Sell" className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-sm font-bold" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Courier" className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-sm font-bold text-orange-400" value={form.courierCost} onChange={e => setForm({...form, courierCost: e.target.value})} />
              <input type="number" placeholder="Qty" className="bg-black/40 border border-white/5 p-4 rounded-xl outline-none text-sm font-bold text-blue-400" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            </div>

            {/* লাভ ক্যালকুলেশন কার্ড */}
            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-[2rem] flex justify-between items-center">
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Net Margin</p>
                  <p className={`text-3xl font-black tracking-tighter ${profitPreview >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>৳ {profitPreview || 0}</p>
               </div>
               <Wallet className="text-blue-500/30" size={32}/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[2.5rem] font-black text-white shadow-3xl shadow-blue-600/40 transition-all flex justify-center items-center gap-3 uppercase text-xs tracking-[0.2em]">
            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={18}/> {t.new_shipment}</>}
          </button>
        </div>
      </form>
    </div>
  );
}