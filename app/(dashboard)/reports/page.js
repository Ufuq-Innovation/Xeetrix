"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Reactive translation hook
import { useApp } from "@/context/AppContext";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common'); // i18n hook
  const [data, setData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch and format data for business analytics.
   * Aggregates orders for sales trends and finance for expense breakdown.
   */
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [resOrders, resFinance] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/finance')
        ]);
        const orders = await resOrders.json();
        const finance = await resFinance.json();

        if (orders.success && finance.success) {
          // 1. Format Area Chart Data (Last 7 Orders)
          const chartData = orders.orders.map(order => ({
            name: new Date(order.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { 
              day: 'numeric', 
              month: 'short' 
            }),
            sales: Number(order.sellingPrice) * Number(order.quantity),
            profit: Number(order.netProfit) || 0
          })).reverse().slice(-7);
          setData(chartData);

          // 2. Format Pie Chart Data (Expense Categories)
          const categories = {};
          finance.expenses.forEach(exp => {
            // Use localized category name if available
            const catName = t(exp.category.toLowerCase());
            categories[catName] = (categories[catName] || 0) + Number(exp.amount);
          });
          const formattedExpenses = Object.keys(categories).map(cat => ({
            name: cat,
            value: categories[cat]
          }));
          setExpenseData(formattedExpenses);
        }
      } catch (e) {
        console.error("Report fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [lang, t]); // Refetch/re-format when language changes

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#22c55e'];

  return (
    <div className="space-y-10 pb-20 p-4 md:p-0">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
        <BarChart3 size={40} className="text-blue-500" /> 
        {t('business_analytics')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales & Profit Visualizer */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" /> 
            {t('sales_vs_profit_title')}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090E14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Area 
                  name={t('sales')}
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={3} 
                />
                <Area 
                  name={t('profit')}
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  fillOpacity={0} 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution Pie Chart */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <PieIcon size={20} className="text-pink-500" /> 
            {t('expense_breakdown')}
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse text-slate-500 text-xs font-bold uppercase">{t('generating_charts')}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090E14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Localized Legend */}
          <div className="grid grid-cols-2 gap-4">
            {expenseData.map((exp, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {exp.name}: <span className="text-white">৳{exp.value.toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}