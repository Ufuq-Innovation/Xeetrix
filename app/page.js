"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, Clock, Globe, Zap, X, Loader2, Brain, BarChart3, Link as LinkIcon } from 'lucide-react';

export default function XeetrixMasterV5() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    symbol: '', direction: 'Buy', entryPrice: '', exitPrice: '', 
    lotSize: '', sl: '', tp: '', strategy: 'SMC', manualCloseType: '',
    emotion: 'Neutral', chartLink: '', entryDate: '', exitDate: ''
  });

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const json = await res.json();
      if (json.success) setTrades(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrades(); }, []);

  const chartData = trades.slice().reverse().reduce((acc, trade) => {
    const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    acc.push({ date: new Date(trade.entryDate).toLocaleDateString(), balance: prevBalance + trade.pnl });
    return acc;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '', manualCloseType: '', chartLink: '' });
        fetchTrades();
        setIsFormOpen(false);
      }
    } finally { setIsSubmitting(false); }
  };

  const deleteTrade = async (id) => {
    if (confirm("Delete execution?")) {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
      fetchTrades();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 font-sans">
      <nav className="border-b border-white/5 bg-[#07090E]/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={20} />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">Xeetrix <span className="text-blue-500">PRO</span></span>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <PlusCircle size={16}/> NEW EXECUTION
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Analytics & Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#11161D] p-6 rounded-[2rem] border border-white/5 h-[350px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-slate-500 flex items-center gap-2"><BarChart3 size={14}/> Equity Growth Curve</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#11161D', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fill="url(#pnlGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Net Profit', val: `$${trades.reduce((a,b)=>a+b.pnl,0).toFixed(2)}`, color: 'text-emerald-400' },
              { label: 'Win Rate', val: `${trades.length ? (trades.filter(t=>t.status==='Win').length/trades.length*100).toFixed(1) : 0}%`, color: 'text-blue-400' },
              { label: 'Total Trades', val: trades.length, color: 'text-white' },
              { label: 'Avg RR', val: `1:${(trades.reduce((a,b)=>a+(b.rrr||0),0)/(trades.length||1)).toFixed(1)}`, color: 'text-purple-400' }
            ].map((s, i) => (
              <div key={i} className="bg-[#11161D] p-6 rounded-[1.5rem] border border-white/5 flex flex-col justify-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Table */}
        <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5">Asset / Session</th>
                  <th className="px-6 py-5">Strategy / Mindset</th>
                  <th className="px-6 py-5">Metrics (SL/TP)</th>
                  <th className="px-6 py-5">Exit Logic</th>
                  <th className="px-6 py-5 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-white/[0.02] group">
                    <td className="px-6 py-6">
                      <div className="font-black text-white text-sm">{trade.symbol}</div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase mt-1"><Globe size={10}/> {trade.session}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs text-slate-300">{trade.strategy}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-slate-500 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Brain size={10}/> {trade.emotion}</span>
                        {trade.chartLink && <a href={trade.chartLink} target="_blank" className="text-blue-500 hover:text-blue-400"><LinkIcon size={10}/></a>}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[10px] font-mono leading-tight">
                        <div className="text-red-500/50">SL: {trade.sl}</div>
                        <div className="text-emerald-500/50">TP: {trade.tp}</div>
                        <div className="text-blue-400 font-bold mt-1">RR 1:{trade.rrr}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${
                        trade.closeType?.includes('TP') ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
                        trade.closeType?.includes('SL') ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-slate-500/20 text-slate-500'
                      }`}>{trade.closeType}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="text-right">
                          <div className={`font-mono font-bold text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                          </div>
                          <div className="text-[9px] font-bold text-slate-600 uppercase">{trade.direction} • {trade.lotSize}L</div>
                        </div>
                        <button onClick={() => deleteTrade(trade._id)} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#11161D] h-full rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white italic tracking-tight uppercase">New Execution</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Symbol & Size</label>
                <div className="flex gap-2">
                  <input placeholder="XAUUSD" className="flex-1 bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold outline-none" value={formData.symbol} onChange={e=>setFormData({...formData, symbol: e.target.value.toUpperCase()})} required />
                  <input placeholder="LOTS" type="number" step="0.01" className="w-24 bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.lotSize} onChange={e=>setFormData({...formData, lotSize: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold" value={formData.direction} onChange={e=>setFormData({...formData, direction: e.target.value})}>
                  <option value="Buy">BUY</option><option value="Sell">SELL</option>
                </select>
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white text-xs" value={formData.emotion} onChange={e=>setFormData({...formData, emotion: e.target.value})}>
                  <option value="Calm">Mindset: Calm</option>
                  <option value="Fear">Mindset: Fear (FOMO)</option>
                  <option value="Greed">Mindset: Greed</option>
                  <option value="Angry">Mindset: Revenge</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6">
                <div className="space-y-3">
                  <input placeholder="ENTRY" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm" value={formData.entryPrice} onChange={e=>setFormData({...formData, entryPrice: e.target.value})} required />
                  <input placeholder="STOP LOSS" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-xs text-red-500/50" value={formData.sl} onChange={e=>setFormData({...formData, sl: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <input placeholder="EXIT" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm" value={formData.exitPrice} onChange={e=>setFormData({...formData, exitPrice: e.target.value})} required />
                  <input placeholder="TAKE PROFIT" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-xs text-emerald-500/50" value={formData.tp} onChange={e=>setFormData({...formData, tp: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <select className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white text-xs" value={formData.manualCloseType} onChange={e=>setFormData({...formData, manualCloseType: e.target.value})}>
                  <option value="">Auto-Detect (TP/SL)</option>
                  <option value="Manual Exit">Manual Exit</option>
                  <option value="Trailing SL">Trailing SL</option>
                  <option value="Breakeven">Breakeven</option>
                  <option value="Partial Close">Partial Close</option>
                </select>
                <input placeholder="CHART LINK (TradingView URL)" className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white text-xs outline-none" value={formData.chartLink} onChange={e=>setFormData({...formData, chartLink: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Timeline</label>
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[10px] text-white" value={formData.entryDate} onChange={e=>setFormData({...formData, entryDate: e.target.value})} required />
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[10px] text-white" value={formData.exitDate} onChange={e=>setFormData({...formData, exitDate: e.target.value})} required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 flex justify-center">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "SYNC DATA"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
