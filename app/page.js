"use client";
import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  Target, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Calendar, 
  Zap,
  Trash2 
} from 'lucide-react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const initialFormState = {
    symbol: '', direction: 'Buy', entryPrice: '', exitPrice: '', lotSize: '', sl: '', entryDate: '', exitDate: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const json = await res.json();
      if (json.success) setTrades(json.data);
    } catch (err) { 
      console.error("Fetch error:", err); 
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
        setFormData(initialFormState);
        fetchTrades();
      }
    } catch (err) { 
      alert("Submission failed!"); 
    }
  };

  const deleteTrade = async (id) => {
    if (!confirm("Are you sure you want to delete this trade?")) return;
    try {
      const res = await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        fetchTrades();
      } else {
        alert("Error deleting trade");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const netPnl = trades.reduce((a, b) => a + (b.pnl || 0), 0);
  const winRate = trades.length > 0 
    ? ((trades.filter(t => t.status === 'Win').length / trades.length) * 100).toFixed(1) 
    : 0;

  const chartData = trades.slice().reverse().reduce((acc, trade, index) => {
    const prevBalance = index === 0 ? 0 : acc[index - 1].balance;
    acc.push({
      name: `T${index + 1}`,
      balance: parseFloat((prevBalance + (trade.pnl || 0)).toFixed(2))
    });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 p-4 md:p-10 font-sans selection:bg-blue-500/30">
      
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-500 fill-blue-500" size={24} />
            <h1 className="text-4xl font-black text-white tracking-tighter italic bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
              XEETRIX
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em] flex items-center gap-2">
            Professional Trading Terminal <span className="w-1 h-1 bg-slate-600 rounded-full"></span> v1.0.2
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#11161D] p-1.5 rounded-2xl border border-white/5">
          <div className="px-4 py-2 bg-[#1C232C] rounded-xl border border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Market Status</p>
            <p className="text-emerald-500 text-xs font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM LIVE
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <section className="lg:col-span-4">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-10 overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full"></div>
            
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <PlusCircle className="text-blue-500" size={22} />
              Execute Entry
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Pair</label>
                <input 
                  type="text" placeholder="XAUUSD" 
                  className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-white font-bold" 
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Side</label>
                  <select 
                    className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 outline-none text-white font-bold cursor-pointer"
                    value={formData.direction}
                    onChange={(e) => setFormData({...formData, direction: e.target.value})}
                  >
                    <option value="Buy">BUY</option>
                    <option value="Sell">SELL</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lots</label>
                  <input 
                    type="number" step="0.01" placeholder="0.10" 
                    className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 outline-none text-white font-mono font-bold" 
                    value={formData.lotSize}
                    onChange={(e) => setFormData({...formData, lotSize: e.target.value})} required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-5 my-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entry Price</label>
                  <input type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 text-white font-mono" value={formData.entryPrice} onChange={(e) => setFormData({...formData, entryPrice: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Exit Price</label>
                  <input type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 text-white font-mono" value={formData.exitPrice} onChange={(e) => setFormData({...formData, exitPrice: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Entry Date
                  </label>
                  <input type="datetime-local" className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 text-xs font-bold text-slate-400" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={12} /> Exit Date
                  </label>
                  <input type="datetime-local" className="w-full bg-[#07090E] border border-slate-800 rounded-2xl p-4 text-xs font-bold text-slate-400" value={formData.exitDate} onChange={(e) => setFormData({...formData, exitDate: e.target.value})} required />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] transition-all active:scale-[0.98] mt-4 tracking-widest text-xs uppercase">
                Save Execution
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${netPnl >= 0 ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/5' : 'bg-red-500/[0.03] border-red-500/20 shadow-red-500/5'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${netPnl >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  <Activity size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Net Return</span>
              </div>
              <p className={`text-4xl font-mono font-bold tracking-tighter ${netPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netPnl >= 0 ? '+' : ''}{netPnl.toFixed(2)}<span className="text-lg ml-1 opacity-50">$</span>
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-blue-500/20 bg-blue-500/[0.03]">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500">
                  <BarChart3 size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Total Trades</span>
              </div>
              <p className="text-4xl font-mono font-bold tracking-tighter text-blue-400">{trades.length}</p>
            </div>

            <div className="p-8 rounded-[2rem] border border-orange-500/20 bg-orange-500/[0.03]">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-500">
                  <Target size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Win Rate</span>
              </div>
              <p className="text-4xl font-mono font-bold tracking-tighter text-orange-400">{winRate}<span className="text-xl font-bold opacity-50">%</span></p>
            </div>
          </div>

          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-white uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Equity Curve
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#11161D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="font-black text-white uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] bg-white/[0.02]">
                    <th className="px-10 py-6">Instrument</th>
                    <th className="px-10 py-6">Side</th>
                    <th className="px-10 py-6">Result</th>
                    <th className="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    <tr><td colSpan="4" className="px-10 py-24 text-center text-slate-600 font-mono text-xs uppercase animate-pulse">Syncing...</td></tr>
                  ) : trades.length === 0 ? (
                    <tr><td colSpan="4" className="px-10 py-24 text-center text-slate-600 font-mono text-xs uppercase">No Data</td></tr>
                  ) : [...trades].reverse().map((trade) => (
                    <tr key={trade._id} className="group hover:bg-white/[0.02] transition-all">
                      <td className="px-10 py-7">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white font-black text-base">{trade.symbol}</span>
                          <span className="text-[10px] text-slate-600 font-bold uppercase">{new Date(trade.entryDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border ${trade.direction === 'Buy' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 'border-orange-500/20 text-orange-400 bg-orange-500/5'}`}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-2">
                          {trade.status === 'Win' ? <ArrowUpRight size={18} className="text-emerald-500" /> : <ArrowDownRight size={18} className="text-red-500" />}
                          <span className={`text-xs font-black ${trade.status === 'Win' ? 'text-emerald-400' : 'text-red-400'}`}>{trade.status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <p className={`font-mono font-bold text-base ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}</p>
                          <button onClick={() => deleteTrade(trade._id)} className="text-slate-600 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
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
        &copy; 2025 XEETRIX LABS
      </footer>
    </div>
  );
}