"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Target, PlusCircle, ArrowUpRight, ArrowDownRight, BarChart3, Calendar, Zap, Trash2, Clock, ShieldCheck } from 'lucide-react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialFormState = {
    symbol: '', direction: 'Buy', entryPrice: '', exitPrice: '', lotSize: '', sl: '', tp: '', strategy: 'SMC', notes: '', entryDate: '', exitDate: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const json = await res.json();
      if (json.success) setTrades(json.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTrades(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) { setFormData(initialFormState); fetchTrades(); }
  };

  const deleteTrade = async (id) => {
    if (confirm("Delete this execution?")) {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
      fetchTrades();
    }
  };

  const netPnl = trades.reduce((a, b) => a + (b.pnl || 0), 0);
  const winRate = trades.length > 0 ? ((trades.filter(t => t.status === 'Win').length / trades.length) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 p-4 md:p-10">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-black text-white italic tracking-tighter">XEETRIX <span className="text-blue-500">PRO</span></h1>
        <div className="text-[10px] font-bold text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5 uppercase">System Live</div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <section className="lg:col-span-4 bg-[#11161D] p-6 rounded-[2rem] border border-white/5 h-fit">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2"><PlusCircle size={18} className="text-blue-500"/> New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Symbol (e.g. BTC)" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-blue-500" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} required />
            
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})}>
                <option value="Buy">BUY</option>
                <option value="Sell">SELL</option>
              </select>
              <input placeholder="Lot Size" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.lotSize} onChange={(e) => setFormData({...formData, lotSize: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Entry Price" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.entryPrice} onChange={(e) => setFormData({...formData, entryPrice: e.target.value})} required />
              <input placeholder="Exit Price" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.exitPrice} onChange={(e) => setFormData({...formData, exitPrice: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Stop Loss" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.sl} onChange={(e) => setFormData({...formData, sl: e.target.value})} />
              <select className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.strategy} onChange={(e) => setFormData({...formData, strategy: e.target.value})}>
                <option value="SMC">SMC</option>
                <option value="ICT">ICT</option>
                <option value="Scalp">Scalp</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dates (Entry & Exit)</label>
              <input type="datetime-local" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-xs text-white" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} required />
              <input type="datetime-local" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-xs text-white" value={formData.exitDate} onChange={(e) => setFormData({...formData, exitDate: e.target.value})} required />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all">Save Trade</button>
          </form>
        </section>

        {/* Stats & History */}
        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#11161D] p-5 rounded-3xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Net PnL</p>
              <p className={`text-2xl font-black ${netPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${netPnl.toFixed(2)}</p>
            </div>
            <div className="bg-[#11161D] p-5 rounded-3xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Win Rate</p>
              <p className="text-2xl font-black text-blue-400">{winRate}%</p>
            </div>
            <div className="bg-[#11161D] p-5 rounded-3xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total</p>
              <p className="text-2xl font-black text-white">{trades.length}</p>
            </div>
          </div>

          <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5">
                  <th className="p-5">Asset</th>
                  <th className="p-5">Strategy</th>
                  <th className="p-5">R:R</th>
                  <th className="p-5">Duration</th>
                  <th className="p-5 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-white/[0.01]">
                    <td className="p-5">
                      <p className="text-white font-bold text-sm">{trade.symbol}</p>
                      <p className="text-[10px] text-slate-600 uppercase">{trade.direction}</p>
                    </td>
                    <td className="p-5 text-xs font-medium text-slate-400">{trade.strategy}</td>
                    <td className="p-5 text-xs font-mono text-blue-400">1:{trade.rrr || '0'}</td>
                    <td className="p-5 text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock size={12}/> {trade.duration}</td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                        </span>
                        <button onClick={() => deleteTrade(trade._id)} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
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