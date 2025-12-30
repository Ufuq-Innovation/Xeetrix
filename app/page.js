"use client";
import { useState, useEffect } from 'react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        alert("✅ Trade Saved Successfully!");
        setFormData(initialFormState);
        fetchTrades();
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      alert("⚠️ Submission failed!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-blue-500 tracking-tighter italic">XEETRIX</h1>
        <p className="text-slate-500 text-sm">Decode Your Trading DNA</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                <label className="text-xs text-slate-500 mb-1 block">Lot Size</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.10" 
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                  value={formData.lotSize}
                  onChange={(e) => setFormData({...formData, lotSize: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Entry Price</label>
                <input 
                  type="number" 
                  step="0.00001" 
                  placeholder="1.0850" 
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({...formData, entryPrice: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Exit Price</label>
                <input 
                  type="number" 
                  step="0.00001" 
                  placeholder="1.0900" 
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                  value={formData.exitPrice}
                  onChange={(e) => setFormData({...formData, exitPrice: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Stop Loss (Optional)</label>
              <input 
                type="number" 
                step="0.00001" 
                placeholder="1.0800" 
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2.5 outline-none font-mono" 
                value={formData.sl}
                onChange={(e) => setFormData({...formData, sl: e.target.value})} 
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Entry Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2 text-sm" 
                  value={formData.entryDate}
                  onChange={(e) => setFormData({...formData, entryDate: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Exit Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-2 text-sm" 
                  value={formData.exitDate}
                  onChange={(e) => setFormData({...formData, exitDate: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95">
              SAVE TRADE
            </button>
          </form>
        </section>

        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#151A21] p-5 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Net P&L</p>
              <p className={`text-2xl font-mono font-bold ${trades.reduce((a, b) => a + (b.pnl || 0), 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${trades.reduce((a, b) => a + (b.pnl || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#151A21] p-5 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Trades</p>
              <p className="text-2xl font-mono font-bold text-blue-400">{trades.length}</p>
            </div>
            <div className="bg-[#151A21] p-5 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</p>
              <p className="text-2xl font-mono font-bold text-orange-400">
                {trades.length > 0 ? ((trades.filter(t => t.status === 'Win').length / trades.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-[#151A21] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1c232c] text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Side</th>
                    <th className="px-6 py-4">P&L ($)</th>
                    <th className="px-6 py-4 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">Synchronizing Data...</td></tr>
                  ) : trades.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No trading history found.</td></tr>
                  ) : trades.map((trade) => (
                    <tr key={trade._id} className="hover:bg-[#1c232c]/50 transition cursor-default">
                      <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                      <td className={`px-6 py-4 text-xs font-bold ${trade.direction === 'Buy' ? 'text-blue-400' : 'text-orange-400'}`}>
                        {trade.direction.toUpperCase()}
                      </td>
                      <td className={`px-6 py-4 font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-md tracking-tighter ${trade.status === 'Win' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {trade.status.toUpperCase()}
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