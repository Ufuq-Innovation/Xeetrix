"use client";
import React, { useEffect, useState } from 'react';
import { useApp } from "@/context/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { t } = useApp();
  const [data, setData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          // ১. চার্টের জন্য ডাটা ফরম্যাটিং (অর্ডার ভিত্তিক)
          const chartData = orders.orders.map(order => ({
            name: new Date(order.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }),
            sales: Number(order.sellingPrice) * Number(order.quantity),
            profit: Number(order.netProfit) || 0
          })).reverse().slice(-7); // শেষ ৭টি অর্ডার
          setData(chartData);

          // ২. পাই চার্টের জন্য খরচ ফরম্যাটিং
          const categories = {};
          finance.expenses.forEach(exp => {
            categories[exp.category] = (categories[exp.category] || 0) + Number(exp.amount);
          });
          const formattedExpenses = Object.keys(categories).map(cat => ({
            name: cat,
            value: categories[cat]
          }));
          setExpenseData(formattedExpenses);
        }
      } catch (e) {
        console.error("Report fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#22c55e'];

  return (
    <div className="space-y-10 pb-20">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
        <BarChart3 size={40} className="text-blue-500" /> Business Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales & Profit Chart */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-lg font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" /> Sales vs Profit (Last 7 Orders)
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
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090E14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-lg font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <PieIcon size={20} className="text-pink-500" /> Expense Breakdown
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090E14', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {expenseData.map((exp, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-xs font-bold text-slate-300 uppercase">{exp.name}: ৳{exp.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}