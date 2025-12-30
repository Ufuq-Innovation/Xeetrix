"use client";
import { useState, useEffect } from 'react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // প্রাথমিক স্টেট (খালি ফর্ম)
  const initialFormState = {
    symbol: '', 
    direction: 'Buy', 
    entryPrice: '', 
    exitPrice: '', 
    lotSize: '', 
    sl: '', 
    entryDate: '', 
    exitDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // ডাটাবেজ থেকে ডাটা নিয়ে আসা
  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const json = await res.json();
      if (json.success) setTrades(json.data);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrades(); }, []);

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      
      if (result.success) {
        alert("✅ Trade Saved Successfully!");
        
        // ১. ডাটা সেভ হওয়ার পর ফর্ম ক্লিয়ার করা
        setFormData(initialFormState);
        
        // ২. লিস্ট আপডেট করা
        fetchTrades();
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      alert("⚠️ Submission failed! Check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-blue-500 tracking-tighter italic">XEETRIX</h1>
        <p className="text-slate-500 text-sm">Decode Your Trading DNA</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ফর্ম সেকশন */}
        <section className="lg:col-span-4 bg-[#151A21] p-6 rounded-2xl border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Log New Trade
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Trading Pair</label>
              <input 
                type="text" 
                placeholder="e.g. XAUUSD" 
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 transition" 
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Direction</label>
                <select 
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none" 
                  value={formData.direction}
                  onChange={(e) => setFormData({...formData, direction: e.target.value})}
                >
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Lot