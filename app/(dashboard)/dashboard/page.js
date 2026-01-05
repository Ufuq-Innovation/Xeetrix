"use client";

import React from 'react';
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

/**
 * Fetcher function to get dashboard analytics from the API
 */
const fetchDashboardStats = async () => {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Network response was not ok');
  const data = await res.json();
  return data.success ? data.stats : null;
};

export default function Dashboard() {
  const { t } = useApp();

  /** * React Query implementation 
   * Replaces useEffect and manual state management
   */
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    initialData: { totalSales: 0, totalProfit: 0, totalOrders: 0 },
  });

  return (
    <div className="space-y-10 p-4 md:p-0">
      <header>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
          Overview
        </h1>
      </header>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Sales Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-blue-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
              {t?.total_sales || "Total Sales"}
            </p>
            <h2 className="text-4xl font-black text-white">
              ৳ {stats.totalSales.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Total Net Profit Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-green-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-green-600/20 rounded-2xl flex items-center justify-center text-green-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
              {t?.net_profit || "Net Profit"}
            </p>
            <h2 className={`text-4xl font-black ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ৳ {stats.totalProfit.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Total Orders Volume Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-purple-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
              {t?.total_orders || "Total Orders"}
            </p>
            <h2 className="text-4xl font-black text-white">{stats.totalOrders}</h2>
          </div>
        </div>
      </div>
      
      {/* Dynamic Status Indicators */}
      {isLoading && (
        <p className="text-center text-slate-500 animate-pulse uppercase text-xs tracking-widest">
          Synchronizing Real-time Data...
        </p>
      )}

      {isError && (
        <p className="text-center text-red-500 uppercase text-xs tracking-widest">
          Failed to fetch business analytics.
        </p>
      )}
    </div>
  );
}