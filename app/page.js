"use client";
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // ডাটা লোড করার ফাংশন
  const fetchTrades = async () => {
    const res = await fetch('/api/trades');
    const json = await res.json();
    if (json.success) setTrades(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchTrades(); }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-primary">Xeetrix</h1>
        <button className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
          + New Trade
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card p-6 rounded-xl border border-slate-800 text-center">
          <p className="text-muted text-sm">Total Trades</p>
          <p className="text-2xl font-bold">{trades.length}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-slate-800 text-center">
          <p className="text-muted text-sm">Total PnL</p>
          <p className={`text-2xl font-bold ${trades.reduce((a, b) => a + b.pnl, 0) >= 0 ? 'text-success' : 'text-danger'}`}>
            ${trades.reduce((a, b) => a + b.pnl, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-muted uppercase text-xs">
            <tr>
              <th className="p-4">Symbol</th>
              <th className="p-4">Type</th>
              <th className="p-4">PnL</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr> : 
             trades.map((trade) => (
              <tr key={trade._id} className="hover:bg-slate-800/30 transition">
                <td className="p-4 font-bold">{trade.symbol}</td>
                <td className="p-4">{trade.direction}</td>
                <td className={`p-4 font-mono ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${trade.status === 'Win' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}