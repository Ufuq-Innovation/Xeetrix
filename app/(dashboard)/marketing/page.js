"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { Megaphone, Target, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [stats, setStats] = useState({ 
    totalSales: 0, 
    adSpend: 0,
    totalProfit: 0,
    totalExpense: 0
  });
  
  const [campaigns, setCampaigns] = useState([]);
  const [adData, setAdData] = useState({ 
    title: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0],
    platform: 'Facebook'
  });

  /**
   * Fetch marketing data
   */
  const fetchData = async () => {
    try {
      setFetching(true);
      const [resStats, resFinance] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/finance')
      ]);
      
      const dataStats = await resStats.json();
      const dataFinance = await resFinance.json();

      if (dataStats.success && dataFinance.success) {
        // Filter expenses to aggregate only 'Marketing' category costs
        const marketingExpenses = dataFinance.expenses
          ?.filter(exp => exp.category === 'Marketing') || [];
        
        const totalAdSpend = marketingExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

        setStats({
          totalSales: dataStats.stats?.totalSales || 0,
          totalProfit: dataStats.stats?.totalProfit || 0,
          totalExpense: dataStats.stats?.totalExpense || 0,
          adSpend: totalAdSpend
        });

        // Get latest 5 marketing campaigns
        setCampaigns(marketingExpenses.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching marketing data:", error);
      toast.error(t('fetch_failed'));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [lang]);

  /**
   * Handle submission of new ad campaign expenditure
   */
  const handleAdSubmit = async (e) => {
    e.preventDefault();
    
    if (!adData.title || !adData.amount || Number(adData.amount) <= 0) {
      toast.error(t('fill_all_fields'));
      return;
    }

    setLoading(true);
    toast.loading(t('saving'), { id: 'ad-campaign' });
    
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...adData, 
          category: 'Marketing',
          amount: Number(adData.amount)
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAdData({ 
          title: '', 
          amount: '', 
          date: new Date().toISOString().split('T')[0],
          platform: 'Facebook'
        });
        await fetchData();
        toast.success(t('ad_cost_saved_alert'), { id: 'ad-campaign' });
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (error) {
      console.error("Error saving ad campaign:", error);
      toast.error(t('save_failed'), { id: 'ad-campaign' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate ROAS (Return on Ad Spend)
   */
  const calculateROAS = () => {
    if (stats.adSpend <= 0) return 0;
    return (stats.totalSales / stats.adSpend).toFixed(2);
  };

  /**
   * Calculate ROI (Return on Investment)
   */
  const calculateROI = () => {
    if (stats.adSpend <= 0) return 0;
    const netProfit = stats.totalProfit;
    return ((netProfit / stats.adSpend) * 100).toFixed(1);
  };

  /**
   * Calculate Cost per Sale
   */
  const calculateCPS = () => {
    if (stats.totalSales <= 0) return 0;
    return (stats.adSpend / (stats.totalSales / 1000)).toFixed(2); // Cost per 1000 sales
  };

  const roas = calculateROAS();
  const roi = calculateROI();
  const cps = calculateCPS();

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl">
            <Megaphone className="text-pink-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white">
              {t('marketing_center')}
            </h1>
            <p className="text-slate-400 mt-1">{t('manage_campaigns_track_roi')}</p>
          </div>
        </div>
        
        {fetching && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            {t('updating_data')}
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ad Spend */}
        <div className="bg-gradient-to-br from-[#11161D] to-[#0d1219] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">{t('total_ad_spend')}</p>
              <p className="text-3xl font-bold text-pink-500 mt-2">
                ৳ {stats.adSpend.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <DollarSign className="text-pink-500" size={22} />
            </div>
          </div>
        </div>

        {/* Revenue from Ads */}
        <div className="bg-gradient-to-br from-[#11161D] to-[#0d1219] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">{t('revenue_from_ads')}</p>
              <p className="text-3xl font-bold text-blue-500 mt-2">
                ৳ {stats.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <TrendingUp className="text-blue-500" size={22} />
            </div>
          </div>
        </div>

        {/* ROAS */}
        <div className="bg-gradient-to-br from-[#11161D] to-[#0d1219] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">{t('roas_title')}</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {roas}x
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('per_taka_spent')}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <BarChart3 className="text-green-500" size={22} />
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="bg-gradient-to-br from-[#11161D] to-[#0d1219] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">{t('roi_title')}</p>
              <p className={`text-3xl font-bold mt-2 ${
                Number(roi) >= 100 ? 'text-green-500' : 
                Number(roi) >= 0 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {roi}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('return_on_investment')}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Target className="text-purple-500" size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad Campaign Form */}
        <div className="lg:col-span-2 bg-[#11161D] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-lg">
              <Target className="text-pink-500" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">
              {t('input_ad_cost')}
            </h3>
          </div>

          <form onSubmit={handleAdSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t('campaign_name')} *
                </label>
                <input 
                  type="text" 
                  placeholder={t('campaign_name_placeholder')} 
                  required
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
                  value={adData.title} 
                  onChange={(e) => setAdData({...adData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t('ad_platform')}
                </label>
                <select
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all appearance-none"
                  value={adData.platform}
                  onChange={(e) => setAdData({...adData, platform: e.target.value})}
                >
                  <option value="Facebook">Facebook Ads</option>
                  <option value="Google">Google Ads</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t('spend_amount')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">৳</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder={t('spend_amount_placeholder')} 
                    required
                    className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
                    value={adData.amount} 
                    onChange={(e) => setAdData({...adData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t('date')}
                </label>
                <input 
                  type="date" 
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
                  value={adData.date} 
                  onChange={(e) => setAdData({...adData, date: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 rounded-xl font-bold uppercase tracking-wider text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/20"
            >
              {loading ? t('recording') : t('record_ad_spend')}
            </button>
          </form>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-[#11161D] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {t('recent_campaigns')}
            </h3>
            <span className="text-sm text-slate-500">
              {campaigns.length} {t('campaigns')}
            </span>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-white/5 rounded-full inline-block mb-3">
                  <Megaphone className="text-slate-600" size={24} />
                </div>
                <p className="text-slate-500">{t('no_campaigns')}</p>
              </div>
            ) : (
              campaigns.map((campaign, index) => (
                <div 
                  key={campaign._id || index} 
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{campaign.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(campaign.date || campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-pink-500 font-bold">
                        ৳ {Number(campaign.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {campaign.platform || 'Facebook'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CPS Metric */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl">
            <p className="text-sm text-slate-400">{t('cost_per_sale')}</p>
            <p className="text-2xl font-bold text-cyan-500 mt-1">
              ৳ {cps}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t('per_1000_sales')}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Insight */}
      <div className="bg-[#11161D] p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('performance_insight')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-slate-400">{t('ad_spend_to_revenue_ratio')}</p>
              <p className="text-sm text-slate-500">
                {t('every_taka_spent_returns')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">{roas}x</p>
              <p className={`text-sm ${Number(roas) >= 3 ? 'text-green-500' : 'text-yellow-500'}`}>
                {Number(roas) >= 3 ? t('excellent') : t('needs_improvement')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-slate-400">{t('profitability')}</p>
              <p className="text-sm text-slate-500">
                {t('return_on_marketing_investment')}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                Number(roi) > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {roi}%
              </p>
              <p className="text-sm text-slate-500">
                {Number(roi) > 0 ? t('profitable') : t('losing_money')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}