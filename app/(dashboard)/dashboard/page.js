"use client";

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, Hash } from 'lucide-react'; // DollarSign এর বদলে Hash বেশি মানানসই অর্ডারের জন্য

const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to synchronize dashboard data');
  const data = await res.json();
  return data.success ? data.stats : null;
};

export default function Dashboard() {
  const context = useApp();
  const { t } = useTranslation('common');

  // ১. কারেন্সি অবজেক্ট সেফটি (ইস্যু #৩১ ফিক্স)
  const currency = useMemo(() => {
    const curr = context?.currency;
    if (curr && typeof curr === 'object') return curr.symbol || "৳";
    return curr || "৳";
  }, [context?.currency]);

  const lang = context?.lang || 'en';

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats', lang],
    queryFn: fetchDashboardStats,
    initialData: { totalSales: 0, totalProfit: 0, totalOrders: 0 },
  });

  // কার্ড কম্পোনেন্ট (কোড রিপিটেশন কমাতে)
  const StatCard = ({ title, value, icon: Icon, colorClass, isCurrency = false }) => (
    <div className={`group bg-white dark:bg-[#11161D] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-5 hover:border-${colorClass}-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-${colorClass}-500/10`}>
      <div className={`w-12 h-12 md:w-14 md:h-14 bg-${colorClass}-50 dark:bg-${colorClass}-600/10 rounded-2xl flex items-center justify-center text-${colorClass}-600 dark:text-${colorClass}-500 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-widest uppercase opacity-70 mb-1">
          {t(title)}
        </p>
        <h2 className={`text-3xl md:text-4xl font-black tabular-nums ${colorClass === 'green' && value < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
          {isCurrency ? `${currency} ` : ''}{Number(value).toLocaleString()}
        </h2>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-12 p-4 md:p-0 transition-colors duration-300">
      <header>
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-slate-900 dark:text-white leading-tight">
          {t('overview')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
          {t('control_room')}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
        <StatCard 
          title="total_sales" 
          value={stats.totalSales} 
          icon={ShoppingBag} 
          colorClass="blue" 
          isCurrency 
        />
        <StatCard 
          title="net_profit" 
          value={stats.totalProfit} 
          icon={TrendingUp} 
          colorClass="green" 
          isCurrency 
        />
        <StatCard 
          title="total_orders" 
          value={stats.totalOrders} 
          icon={Hash} 
          colorClass="purple" 
        />
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-6">
          <p className="text-slate-400 animate-pulse text-[11px] font-bold tracking-[0.2em] uppercase">
            {t('syncing_data')}...
          </p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-center">
          <p className="text-red-600 dark:text-red-500 text-xs font-bold tracking-widest uppercase">
            {t('fetch_error')}
          </p>
        </div>
      )}
    </div>
  );
}