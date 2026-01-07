"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, Hash } from 'lucide-react';

const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Sync failed');
  const data = await res.json();
  return data.success ? data.stats : { totalSales: 0, totalProfit: 0, totalOrders: 0 };
};

export default function Dashboard() {
  const context = useApp();
  const { t } = useTranslation('common');
  const currency = useMemo(() => (typeof context?.currency === 'object' ? context?.currency.symbol : context?.currency) || "৳", [context?.currency]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats', context?.lang],
    queryFn: fetchDashboardStats,
    refetchOnMount: true, // পেজে ঢোকামাত্র ডাটা রিফ্রেশ করবে
    staleTime: 0, 
  });

  const StatCard = ({ title, value, icon: Icon, colorClass, isCurrency = false }) => (
    <div className={`bg-[#11161D] p-10 rounded-[3.5rem] border border-white/5 space-y-6 hover:border-${colorClass}-500/30 transition-all duration-500`}>
      <div className={`w-14 h-14 bg-${colorClass}-500/10 rounded-2xl flex items-center justify-center text-${colorClass}-500`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-slate-500 font-bold text-xs tracking-widest uppercase mb-1">{t(title)}</p>
        <h2 className="text-4xl font-black text-white italic tracking-tighter">
          {isCurrency ? `${currency} ` : ''}{Number(value || 0).toLocaleString()}
        </h2>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">{t('overview')}</h1>
        <p className="text-slate-500 text-sm mt-2 font-bold tracking-widest uppercase opacity-50">{t('control_room')} • 2026</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="total_sales" value={stats?.totalSales} icon={ShoppingBag} colorClass="blue" isCurrency />
        <StatCard title="net_profit" value={stats?.totalProfit} icon={TrendingUp} colorClass="green" isCurrency />
        <StatCard title="total_orders" value={stats?.totalOrders} icon={Hash} colorClass="purple" />
      </div>

      {isLoading && <p className="text-center text-blue-500 animate-pulse font-black tracking-widest uppercase text-[10px] mt-10">Syncing Control Room Data...</p>}
    </div>
  );
}