"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Network response was not ok');
  const data = await res.json();
  return data.success ? data.stats : null;
};

export default function Dashboard() {
  const { lang } = useApp();
  const { t } = useTranslation('common');

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats', lang],
    queryFn: fetchDashboardStats,
    initialData: { totalSales: 0, totalProfit: 0, totalOrders: 0 },
  });

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-0">
      <header>
        {/* Adjusted Font Size and Tracking for Mobile */}
        <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight md:tracking-tighter text-white">
          {t('overview')}
        </h1>
      </header>
      
      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Total Sales Card */}
        <div className="bg-[#11161D] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-4 hover:border-blue-500/30 transition-all duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
            <ShoppingBag size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-widest">
              {t('total_sales')}
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              ৳ {stats.totalSales.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-[#11161D] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-4 hover:border-green-500/30 transition-all duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600/20 rounded-2xl flex items-center justify-center text-green-500">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-widest">
              {t('net_profit')}
            </p>
            <h2 className={`text-2xl md:text-4xl font-black ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ৳ {stats.totalProfit.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-[#11161D] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-4 hover:border-purple-500/30 transition-all duration-300">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
            <DollarSign size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-widest">
              {t('total_orders')}
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-white">{stats.totalOrders}</h2>
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      {isLoading && (
        <p className="text-center text-slate-500 animate-pulse uppercase text-[10px] tracking-widest">
          {t('syncing_data')}
        </p>
      )}

      {isError && (
        <p className="text-center text-red-500 uppercase text-[10px] tracking-widest">
          {t('fetch_error')}
        </p>
      )}
    </div>
  );
}