"use client";
import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";

export default function FinancePage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [expenseData, setExpenseData] = useState({ title: '', amount: '', category: 'Marketing' });

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // এখানে আপনার এপিআই কল হবে (api/finance যা আমরা পরে বানাবো)
    alert("খরচ সেভ হয়েছে! (Backend integration pending)");
    setExpenseData({ title: '', amount: '', category: 'Marketing' });
    setLoading(false);
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
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600"
              value={expenseData.title} onChange={(e) => setExpenseData({...expenseData, title: e.target.value})}
            />
            <input 
              type="number" placeholder="টাকার পরিমাণ" required
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-600"
              value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
            />
            <select 
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none"
              value={expenseData.category} onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
            >
              <option value="Marketing" className="bg-[#11161D]">Marketing</option>
              <option value="Rent" className="bg-[#11161D]">Rent</option>
              <option value="Salary" className="bg-[#11161D]">Salary</option>
              <option value="Others" className="bg-[#11161D]">Others</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 p-4 rounded-xl font-bold uppercase tracking-widest">
              {loading ? "SAVING..." : "SAVE EXPENSE"}
            </button>
          </form>
        </div>

        {/* Profit/Loss Summary Card (Static for now) */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center items-center space-y-4">
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Net Cash Flow</p>
          <h2 className="text-6xl font-black text-green-500">৳ 0.00</h2>
          <p className="text-xs text-slate-400 font-medium">অর্ডারের লাভ - মোট খরচ</p>
        </div>
      </div>
    </div>
  );
}