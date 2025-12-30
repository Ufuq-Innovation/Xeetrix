"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Target, PlusCircle, ArrowUpRight, ArrowDownRight, BarChart3, Calendar, Zap, Trash2, Clock, Globe } from 'lucide-react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const initialFormState = {
    symbol: '', direction: 'Buy', entryPrice: '', exitPrice: '', 
    lotSize: '', sl: '', tp: '', strategy: 'SMC', notes: '', 
    entryDate: '', exitDate: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const json = await res.json();
      if (json.success) setTrades(json.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchTrades(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) { 
      setFormData(initialFormState); 
      fetchTrades(); 
    }
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
    <div className="min-h-screen bg-[#07090E] text-slate-300 p-4 md:p-10 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={20} />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Xeetrix</h1>
        </div>
        <div className="text-[10px] font-bold text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5 uppercase tracking-widest animate-pulse">
          System Live
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <section className="lg:col-span-4 bg-[#11161D] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl h-fit sticky top-10">
          <h2 className="text-white font-bold mb-6 flex items-center gap-2"><PlusCircle size={18} className="text-blue-500"/> EXECUTE ENTRY</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Asset Pair (e.g. XAUUSD)" className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} required />
            
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white font-bold cursor-pointer outline-none" value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})}>
                <option value="Buy">BUY</option>
                <option value="Sell">SELL</option>
              </select>
              <input placeholder="Lots" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none font-bold" value={formData.lotSize} onChange={(e) => setFormData({...formData, lotSize: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3 border-y border-white/5 py-4">
              <input placeholder="Entry Price" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-sm" value={formData.entryPrice} onChange={(e) => setFormData({...formData, entryPrice: e.target.value})} required />
              <input placeholder="Exit Price" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-sm" value={formData.exitPrice} onChange={(e) => setFormData({...formData, exitPrice: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="SL Price" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-sm" value={formData.sl} onChange={(e) => setFormData({...formData, sl: e.target.value})} />
              <input placeholder="TP Price" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-sm" value={formData.tp} onChange={(e) => setFormData({...formData, tp: e.target.value})} />
            </div>

            <select className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none font-bold" value={formData.strategy} onChange={(e) => setFormData({...formData, strategy: e.target.value})}>
              <option value="SMC">Strategy: SMC</option>
              <option value="ICT">Strategy: ICT</option>
              <option value="Breakout">Strategy: Breakout</option>
              <option value="Scalp">Strategy: Scalp</option>
            </select>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Execution Timeline</label>
              <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[11px] text-white outline-none" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} required />
              <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[11px] text-white outline-none" value={formData.exitDate} onChange={(e) => setFormData({...formData, exitDate: e.target.value})} required />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] transition-all active:scale-[0.98] shadow-xl shadow-blue-600/10 uppercase text-xs tracking-widest">
              Store Data
            </button>
          </form>
        </section>

        {/* Analytics & Table */}
        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Net Return</p>
              <p className={`text-3xl font-black ${netPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${netPnl.toFixed(2)}</p>
            </div>
            <div className="bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Success Rate</p>
              <p className="text-3xl font-black text-blue-400">{winRate}%</p>
            </div>
            <div className="bg-[#11161D] p-6 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Orders</p>
              <p className="text-3xl font-black text-white">{trades.length}</p>
            </div>
          </div>

          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Execution History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-5">Asset / Session</th>
                    <th className="px-6 py-5">Strategy / Time</th>
                    <th className="px-6 py-5">Risk / Reward</th>
                    <th className="px-6 py-5">Close Type</th>
                    <th className="px-6 py-5 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    <tr><td colSpan="5" className="p-20 text-center text-xs font-bold uppercase tracking-widest opacity-20">Syncing Database...</td></tr>
                  ) : trades.length === 0 ? (
                    <tr><td colSpan="5" className="p-20 text-center text-xs font-bold uppercase tracking-widest opacity-20">No Execution Found</td></tr>
                  ) : trades.map((trade) => (
                    <tr key={trade._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-black text-sm tracking-tight">{trade.symbol}</span>
                          <span className="text-[9px] font-bold text-blue-500 uppercase bg-blue-500/5 w-fit px-2 py-0.5 rounded flex items-center gap-1">
                            <Globe size={10}/> {trade.session || 'ASIA'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-medium text-slate-300">{trade.strategy}</span>
                          <span className="text-[9px] text-slate-600 flex items-center gap-1">
                            <Clock size={10}/> {trade.duration}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1 text-[10px] font-mono">
                          <span className="text-red-500/60 font-bold">SL: {trade.sl || '---'}</span>
                          <span className="text-emerald-500/60 font-bold">TP: {trade.tp || '---'}</span>
                          <span className="text-blue-400/80 font-bold">RR: 1:{trade.rrr || '0'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[9px] font-black px-2 py-1 rounded border ${
                          trade.closeType === 'TP Hit' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
                          trade.closeType === 'SL Hit' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 
                          'border-slate-500/20 text-slate-500 bg-slate-500/5'
                        }`}>
                          {trade.closeType?.toUpperCase() || 'MANUAL'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono font-bold text-base ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-600 font-bold uppercase">{trade.direction}</span>
                          </div>
                          <button onClick={() => deleteTrade(trade._id)} className="text-slate-700 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/5">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pb-10 border-t border-white/5 pt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">
        © 2025 XEETRIX LABS • PRECISION TERMINAL
      </footer>
    </div>
  );
}
