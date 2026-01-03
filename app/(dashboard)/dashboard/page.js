"use client";
import React from 'react';
import { useApp } from "@/context/AppContext";
import { ShoppingBag, Banknote, TrendingUp, Landmark } from 'lucide-react';

export default function DashboardPage() {
  const context = useApp();

  // বিল্ডের সময় কনটেক্সট লোড না হলে যেন এরর না দেয়
  if (!context) {
    return (
      <div className="p-8 text-slate-500 font-bold">
        Loading Dashboard...
      </div>
    );
  }

  const { t } = context;

  // stats অ্যারেটি অবশ্যই ডিস্ট্রাকচারিং এর পরে থাকতে হবে
  const stats = [
    { label: t.today_sales || "Today's Sales", val: '৳ 0', icon: <Banknote className="text-emerald-500"/> },
    { label: t.today_profit || "Today's Profit", val: '৳ 0', icon: <TrendingUp className="text-purple-500"/> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
        {t.dashboard || "Dashboard"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
            <div className="p-4 bg-white/5 rounded-2xl w-fit mb-4">{stat.icon}</div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}