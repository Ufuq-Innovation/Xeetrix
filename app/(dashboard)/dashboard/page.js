"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from "@/context/AppContext";
import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { t } = useApp();
  const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0, totalOrders: 0 });

  useEffect(() => {
    // ডাটাবেস থেকে হিসাব নিয়ে আসা
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      });
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Sales Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t?.today_sales || "Total Sales"}</p>
            <h2 className="text-4xl font-black">৳ {stats.totalSales}</h2>
          </div>
        </div>

        {/* Total Profit Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <div className="w-12 h-12 bg-green-600/20 rounded-2xl flex items-center justify-center text-green-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t?.today_profit || "Total Profit"}</p>
            <h2 className="text-4xl font-black text-green-500">৳ {stats.totalProfit}</h2>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-4">
          <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total Orders</p>
            <h2 className="text-4xl font-black">{stats.totalOrders}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}