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

  // ডাটা লোড করার ফাংশন
  const fetchData = async () => {
    try {
      const [resExp, resStats] = await Promise.all([
        fetch('/api/finance'),
        fetch('/api/stats')
      ]);
      const dataExp = await resExp.json();
      const dataStats = await resStats.json();
      
      if (dataExp.success) setExpenses(dataExp.expenses);
      if (dataStats.success) setStats(dataStats.stats);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
        await fetchData(); // লিস্ট এবং কার্ড আপডেট
        alert("খরচ সেভ হয়েছে!");
      }
    } catch (error) {
      alert("সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    try {
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      alert("ডিলিট হয়নি!");
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
        {t?.finance || "Finance Control"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Expense Entry Form */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <h3 className="text-xl font-bold">নতুন খরচ যোগ করুন</h3>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <input 
              type="text" placeholder="খরচের বিবরণ (যেমন: Facebook Ads)" required
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white"
              value={expenseData.title} onChange={(e) => setExpenseData({...expenseData, title: e.target.value})}
            />
            <input 
              type="number" placeholder="টাকার পরিমাণ" required
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600 text-white"
              value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
            />
            <select 
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none text-white"
              value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
            >
              <option value="Marketing" className="bg-[#11161D]">Marketing</option>
              <option value="Rent" className="bg-[#11161D]">Rent</option>
              <option value="Salary" className="bg-[#11161D]">Salary</option>
              <option value="Others" className="bg-[#11161D]">Others</option>
            </select>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 p-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">
              {loading ? "SAVING..." : "SAVE EXPENSE"}
            </button>
          </form>
        </div>

        {/* Net Cash Flow Summary Card */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center space-y-4">
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Net Cash Flow</p>
          <h2 className={`text-6xl font-black ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ৳ {stats.totalProfit}
          </h2>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              মোট অর্ডার প্রফিট: <span className="text-white">৳{Number(stats.totalProfit) + Number(stats.totalExpense || 0)}</span>
            </p>
            <p className="text-xs text-red-400 font-medium tracking-wide">
              মোট খরচ: <span>৳{stats.totalExpense || 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Expense History List */}
      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <ArrowDownCircle size={18} className="text-blue-500" /> Expense History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5">
              <tr>
                <th className="p-6">Description</th>
                <th className="p-6">Category</th>
                <th className="p-6 text-right">Amount</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {fetching ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500">কোনো খরচ পাওয়া যায়নি!</td></tr>
              ) : expenses.map((exp) => (
                <tr key={exp._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                  <td className="p-6 font-medium">{exp.title}</td>
                  <td className="p-6"><span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-slate-400">{exp.category}</span></td>
                  <td className="p-6 text-right font-bold text-red-400">৳ {exp.amount}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => deleteExpense(exp._id)} className="text-slate-600 hover:text-red-500 transition-colors">
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