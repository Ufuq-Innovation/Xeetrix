"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";
import { Trash2, ArrowDownCircle } from 'lucide-react';

export default function FinancePage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0, totalExpense: 0 });
  const [expenseData, setExpenseData] = useState({ title: '', amount: '', category: 'Marketing' });

  const fetchData = async () => {
    try {
      const [resExp, resStats] = await Promise.all([
        fetch('/api/finance'),
        fetch('/api/dashboard')
      ]);
      const dataExp = await resExp.json();
      const dataStats = await resStats.json();
      
      if (dataExp.success) setExpenses(dataExp.expenses);
      if (dataStats.success) setStats(dataStats.stats);
    } catch (error) {
      console.error("Finance data fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (res.ok) {
        setExpenseData({ title: '', amount: '', category: 'Marketing' });
        await fetchData();
      }
    } catch (error) {
      console.error("Expense save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm(t?.confirm_delete || "Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
        {t?.finance || "Finance Control"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-xl font-bold text-slate-200">{t?.new_expense || "Record New Expense"}</h3>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <input 
              type="text" placeholder={t?.expense_desc_placeholder || "Description (e.g., Facebook Ads)"} required
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white"
              value={expenseData.title} onChange={(e) => setExpenseData({...expenseData, title: e.target.value})}
            />
            <input 
              type="number" placeholder={t?.amount_placeholder || "Amount (৳)"} required
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white"
              value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
            />
            <select 
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white appearance-none"
              value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
            >
              <option value="Marketing">{t?.marketing || "Marketing"}</option>
              <option value="Rent">{t?.rent || "Rent"}</option>
              <option value="Salary">{t?.salary || "Salary"}</option>
              <option value="Others">{t?.others || "Others"}</option>
            </select>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all text-white">
              {loading ? (t?.saving || "SAVING...") : (t?.save_transaction || "SAVE TRANSACTION")}
            </button>
          </form>
        </div>

        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{t?.net_cash_flow || "Net Cash Flow"}</p>
          <h2 className={`text-6xl font-black tracking-tighter ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ৳ {stats.totalProfit}
          </h2>
          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              {t?.order_profit || "Order Profit"}: <span className="text-white">৳{Number(stats.totalProfit) + Number(stats.totalExpense || 0)}</span>
            </p>
            <p className="text-[11px] text-red-400 font-medium uppercase tracking-wider">
              {t?.total_expenses || "Total Expenses"}: <span>৳{stats.totalExpense || 0}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2 text-slate-300">
            <ArrowDownCircle size={18} className="text-blue-500" /> {t?.transaction_log || "Transaction Log"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 font-black uppercase border-b border-white/5">
              <tr>
                <th className="p-6">{t?.description || "Description"}</th>
                <th className="p-6">{t?.category || "Category"}</th>
                <th className="p-6 text-right">{t?.amount || "Amount"}</th>
                <th className="p-6 text-right">{t?.action || "Action"}</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {fetching ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 animate-pulse">{t?.syncing_records || "Synchronizing records..."}</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">{t?.no_transactions || "No transactions recorded yet."}</td></tr>
              ) : expenses.map((exp) => (
                <tr key={exp._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="p-6 font-medium text-slate-200">{exp.title}</td>
                  <td className="p-6">
                    <span className="text-[9px] font-bold bg-white/5 px-3 py-1.5 rounded-full text-slate-400 border border-white/5 uppercase">
                      {t?.[exp.category.toLowerCase()] || exp.category}
                    </span>
                  </td>
                  <td className="p-6 text-right font-bold text-red-400">৳ {exp.amount}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => deleteExpense(exp._id)} className="text-slate-600 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}