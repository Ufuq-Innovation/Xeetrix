"use client";
import { useState, useEffect } from 'react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    symbol: '', 
    direction: 'Buy', 
    entryPrice: '', 
    exitPrice: '', 
    lotSize: '', 
    sl: '', 
    entryDate: '', 
    exitDate: ''
  });

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
        alert("Trade Saved!");
        fetchTrades();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Submission failed!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-blue-500">XEETRIX</h1>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <section className="lg:col-span-4 bg-[#151A21] p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-6">Log New Trade</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Symbol (e.g. XAUUSD)" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none" 
              onChange={(e) => setFormData({...formData, symbol: e.target.value})} required />
            
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5" onChange={(e) => setFormData({...formData, direction: e.target.value})}>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
              <input type="number" step="0.01" placeholder="Lot Size" className="bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                onChange={(e) => setFormData({...formData, lotSize: Number(e.target.value)})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.0001" placeholder="Entry Price" className="bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                onChange={(e) => setFormData({...formData, entryPrice: Number(e.target.value)})} required />
              <input type="number" step="0.0001" placeholder="Exit Price" className="bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                onChange={(e) => setFormData({...formData, exitPrice: Number(e.target.value)})} required />
            </div>

            <input type="number" step="0.0001" placeholder="Stop Loss (Optional)" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
              onChange={(e) => setFormData({...formData, sl: Number(e.target.value)})} />

            <div className="space-y-2">
              <label className="text-xs text-slate-500">Entry Date & Time</label>
              <input type="datetime-local" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2" 
                onChange={(e) => setFormData({...formData, entryDate: e.target.value})} required />
              <label className="text-xs text-slate-500">Exit Date & Time</label>
              <input type="datetime-local" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2" 
                onChange={(e) => setFormData({...formData, exitDate: e.target.value})} required />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">
              SAVE TRADE
            </button>
          </form>
        </section>

        {/* List Section */}
        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#151A21] p-4 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Net P&L</p>
              <p className="text-2xl font-mono font-bold text-emerald-400">
                ${trades.reduce((a, b) => a + (b.pnl || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#151A21] p-4 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Trades</p>
              <p className="text-2xl font-mono font-bold text-blue-400">{trades.length}</p>
            </div>
          </div>

          <div className="bg-[#151A21] rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-[#1c232c] text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Pair</th>
                  <th className="px-6 py-4">Side</th>
                  <th className="px-6 py-4">P&L</th>
                  <th className="px-6 py-4 text-center">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center">Loading...</td></tr>
                ) : trades.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center">No trades found.</td></tr>
                ) : trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-[#1c232c] transition">
                    <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                    <td className="px-6 py-4 text-xs">{trade.direction}</td>
                    <td className={`px-6 py-4 font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${trade.pnl?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${trade.status === 'Win' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}