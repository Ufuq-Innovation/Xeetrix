"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";
import { Megaphone, Target, TrendingUp, DollarSign } from 'lucide-react';

export default function MarketingPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, adSpend: 0 });
  const [adData, setAdData] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    try {
      const [resStats, resFinance] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/finance')
      ]);
      const dataStats = await resStats.json();
      const dataFinance = await resFinance.json();

      if (dataStats.success && dataFinance.success) {
        // শুধু মার্কেটিং ক্যাটাগরির খরচগুলো যোগ করা
        const totalAdSpend = dataFinance.expenses
          .filter(exp => exp.category === 'Marketing')
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        setStats({
          totalSales: dataStats.stats.totalSales,
          adSpend: totalAdSpend
        });
      }
    } catch (error) {
      console.error("Error fetching marketing data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adData, category: 'Marketing' }),
      });
      if (res.ok) {
        setAdData({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });
        fetchData();
        alert("অ্যাড কস্ট সেভ হয়েছে!");
      }
    } finally {
      setLoading(false);
    }
  };

  // ROAS ক্যালকুলেশন (Revenue / Ad Spend)
  const roas = stats.adSpend > 0 ? (stats.totalSales / stats.adSpend).toFixed(2) : 0;

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
        <Megaphone size={40} className="text-pink-500" /> Marketing Center
      </h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total Ad Spend</p>
          <h2 className="text-4xl font-black text-pink-500 mt-2">৳ {stats.adSpend}</h2>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Revenue from Ads</p>
          <h2 className="text-4xl font-black text-blue-500 mt-2">৳ {stats.totalSales}</h2>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">ROAS (Return on Ad Spend)</p>
          <h2 className="text-4xl font-black text-green-500 mt-2">{roas}x</h2>
        </div>
      </div>

      {/* Add Ad Spend Form */}
      <div className="max-w-2xl bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 italic uppercase">
          <Target className="text-pink-500" /> বিজ্ঞাপন খরচ ইনপুট দিন
        </h3>
        <form onSubmit={handleAdSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Campaign Name (e.g. Winter Sale)" required
              className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-pink-500"
              value={adData.title} onChange={(e) => setAdData({...adData, title: e.target.value})}
            />
            <input 
              type="number" placeholder="Spend Amount" required
              className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-pink-500"
              value={adData.amount} onChange={(e) => setAdData({...adData, amount: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-pink-600 p-4 rounded-xl font-black uppercase tracking-widest hover:bg-pink-700 transition-all">
            {loading ? "RECORDING..." : "RECORD AD SPEND"}
          </button>
        </form>
      </div>
    </div>
  );
}