"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

/**
 * Fetch business metrics from the dashboard API.
 * @returns {Promise<Object|null>}
 */
const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to synchronize dashboard data');
  const data = await res.json();
  return data.success ? data.stats : null;
};

/**
 * Dashboard View
 * Optimized for performance, theme consistency, and accessibility.
 * Ensures translation keys match the localized dictionary.
 */
export default function Dashboard() {
  const { lang } = useApp();
  const { t } = useTranslation('common');

  /**
   * Data fetching with language-based key for currency/format updates.
   */
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats', lang],
    queryFn: fetchDashboardStats,
    initialData: { totalSales: 0, totalProfit: 0, totalOrders: 0 },
  });

  return (
    <div className="space-y-8 md:space-y-12 p-4 md:p-0 transition-colors duration-300">
      <header>
        {/* Title: Title Case, Responsive Size, Theme-Aware */}
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-slate-900 dark:text-white leading-tight">
          {t('overview')}
        </h1>
        {/* Fixed: Using 'control_room' as per verified translation keys */}
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
          {t('control_room')}
        </p>
      </header>
      
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
        
        {/* Total Sales Card */}
        <div className="group bg-white dark:bg-[#11161D] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-5 hover:border-blue-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-widest uppercase opacity-70 mb-1">
              {t('total_sales')}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums">
              ৳ {stats.totalSales.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="group bg-white dark:bg-[#11161D] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-5 hover:border-green-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-green-500/10">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-600/10 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-500 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-widest uppercase opacity-70 mb-1">
              {t('net_profit')}
            </p>
            <h2 className={`text-3xl md:text-4xl font-black tabular-nums ${stats.totalProfit >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              ৳ {stats.totalProfit.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="group bg-white dark:bg-[#11161D] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/5 space-y-5 hover:border-purple-500/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-50 dark:bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-500 group-hover:scale-110 transition-transform duration-300">
            <DollarSign size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-widest uppercase opacity-70 mb-1">
              {t('total_orders')}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.totalOrders.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Feedback States */}
      {isLoading && (
        <div className="flex justify-center py-6" aria-live="polite">
          <p className="text-slate-400 animate-pulse text-[11px] font-bold tracking-[0.2em] uppercase">
            {t('syncing_data')}...
          </p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-center" role="alert">
          <p className="text-red-600 dark:text-red-500 text-xs font-bold tracking-widest uppercase">
            {t('fetch_error')}
          </p>
        </div>
      )}
    </div>
  );
}