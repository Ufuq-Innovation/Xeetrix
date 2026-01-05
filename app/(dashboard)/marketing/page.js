"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Direct hook for instant language updates
import { useApp } from "@/context/AppContext";
import { Megaphone, Target } from 'lucide-react';

export default function MarketingPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common'); // Hook for real-time translation
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, adSpend: 0 });
  const [adData, setAdData] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });

  /**
   * Fetch core marketing metrics and financial data.
   */
  const fetchData = async () => {
    try {
      const [resStats, resFinance] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/finance')
      ]);
      const dataStats = await resStats.json();
      const dataFinance = await resFinance.json();

      if (dataStats.success && dataFinance.success) {
        // Filter expenses to aggregate only 'Marketing' category costs
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

  // Re-fetch data when component mounts or language changes (to ensure reactive updates)
  useEffect(() => { fetchData(); }, [lang]);

  /**
   * Handle submission of new ad campaign expenditure.
   */
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
        alert(t('ad_cost_saved_alert')); // Localized success alert
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ROAS Calculation (Total Revenue / Total Ad Spend).
   */
  const roas = stats.adSpend > 0 ? (stats.totalSales / stats.adSpend).toFixed(2) : 0;

  return (
    <div className="space-y-10 p-4 md:p-0">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
        <Megaphone size={40} className="text-pink-500" /> 
        {t('marketing_center')}
      </h1>

      {/* Strategic Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('total_ad_spend')}</p>
          <h2 className="text-4xl font-black text-pink-500 mt-2">৳ {stats.adSpend.toLocaleString()}</h2>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('revenue_from_ads')}</p>
          <h2 className="text-4xl font-black text-blue-500 mt-2">৳ {stats.totalSales.toLocaleString()}</h2>
        </div>
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t('roas_title')}</p>
          <h2 className="text-4xl font-black text-green-500 mt-2">{roas}x</h2>
        </div>
      </div>

      {/* Localized Ad Spend Recording Form */}
      <div className="max-w-2xl bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
        <h3 className="text-xl font-bold flex items-center gap-2 italic uppercase text-slate-200">
          <Target className="text-pink-500" /> {t('input_ad_cost')}
        </h3>
        <form onSubmit={handleAdSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder={t('campaign_name_placeholder')} required
              className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-pink-500 transition-all"
              value={adData.title} onChange={(e) => setAdData({...adData, title: e.target.value})}
            />
            <input 
              type="number" placeholder={t('spend_amount_placeholder')} required
              className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white focus:border-pink-500 transition-all"
              value={adData.amount} onChange={(e) => setAdData({...adData, amount: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-pink-600 p-4 rounded-xl font-black uppercase tracking-widest hover:bg-pink-700 transition-all text-white shadow-lg shadow-pink-900/20"
          >
            {loading ? t('recording') : t('record_ad_spend')}
          </button>
        </form>
      </div>
    </div>
  );
}