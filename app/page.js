"use client";
import { useState, useEffect } from 'react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    symbol: '', direction: 'Buy', entryPrice: '', exitPrice: '', 
    lotSize: '', sl: '', entryDate: '', exitDate: ''
  });

  const fetchTrades = async () => {
    const res = await fetch('/api/trades');
    const json = await res.json();
    if (json.success) setTrades(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchTrades(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (result.success) {
      alert("Trade Saved Successfully!");
      fetchTrades(); // নতুন ট্রেড সেভ হওয়ার পর লিস্ট আপডেট হবে
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-500">XEETRIX</h1>
        <div className="text-sm text-slate-400">Trading DNA Decoded</div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <section className="lg:col-span-4 bg-[#151A21] p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-2">Log New Trade</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Symbol</label>
              <input type="text" placeholder="e.g. XAUUSD" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 focus:border-blue-500 outline-none transition" 
                onChange={(e) => setFormData({...formData, symbol: e.target.value})} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Direction</label>
                <select className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none" 
                  onChange={(e) => setFormData({...formData, direction: e.target.value})}>
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Lot Size</label>
                <input type="number" step="0.01" placeholder="0.10" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none" 
                  onChange={(e) => setFormData({...formData, lotSize: Number(e.target.value)})} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Entry Price</label>
                <input type="number" step="0.0001" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                  onChange={(e) => setFormData({...formData, entryPrice: Number(e.target.value)})} required />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Exit Price</label>
                <input type="number" step="0.0001" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                  onChange={(e) => setFormData({...formData, exitPrice: Number(e.target.value)})} required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Stop Loss (Optional)</label>
                <input type="number" step="0.0001" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono text-red-400" 
                  onChange={(e) => setFormData({...formData, sl: Number(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <input type="datetime-local" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 text-xs" 
                onChange={(e) => setFormData({...formData, entryDate: e.target.value})} required />
              <input type="datetime-local" className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 text-xs" 
                onChange={(e) => setFormData({...formData, exitDate: e.target.value})} required />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg shadow-blue-900/20">
              SAVE TRADE
            </button>
          </form>
        </section>

        {/* List Section */}
        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#151A21] p-4 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Net Profit</p>
              <p className={`text-2xl font-mono font-bold ${trades.reduce((a, b) => a + b.pnl, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${trades.reduce((a, b) => a + b.pnl, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#151A21] p-4 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Win Rate</p>
              <p className="text-2xl font-mono font-bold text-blue-400">
                {trades.length > 0 ? ((trades.filter(t => t.status === 'Win').length / trades.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-[#151A21] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1c232c] text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Pair</th>
                    <th className="px-6 py-4">Side</th>
                    <th className="px-6 py-4 font-mono">P&L</th>
                    <th className="px-6 py-4 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">Connecting to Database...</td></tr>
                  ) : trades.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No trades recorded yet.</td></tr>
                  ) : trades.map((trade) => (
                    <tr key={trade._id} className="hover:bg-[#1c232c] transition group">
                      <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trade.direction === 'Buy' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${trade.status === 'Win' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}