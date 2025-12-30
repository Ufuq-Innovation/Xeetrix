"use client";
import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Clock, Globe, Zap, X, Loader2 } from 'lucide-react';

export default function XeetrixFinal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    symbol: '', direction: 'Buy', entryPrice: '', exitPrice: '', 
    lotSize: '', sl: '', tp: '', strategy: 'SMC', manualCloseType: '',
    entryDate: '', exitDate: ''
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
        setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '', manualCloseType: '' });
        fetchTrades();
        setIsFormOpen(false);
      }
    } finally { setIsSubmitting(false); }
  };

  const deleteTrade = async (id) => {
    if (!confirm("Delete execution?")) return;
    await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
    fetchTrades();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300">
      <nav className="border-b border-white/5 bg-[#07090E]/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={20} />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">Xeetrix</span>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <PlusCircle size={16}/> NEW ENTRY
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#11161D] p-6 rounded-[1.5rem] border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total PnL</p>
            <p className={`text-2xl font-black ${trades.reduce((a,b)=>a+b.pnl,0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${trades.reduce((a,b)=>a+b.pnl,0).toFixed(2)}
            </p>
          </div>
          <div className="bg-[#11161D] p-6 rounded-[1.5rem] border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Win Rate</p>
            <p className="text-2xl font-black text-blue-400">
              {trades.length ? (trades.filter(t=>t.status==='Win').length/trades.length*100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-[#11161D] p-6 rounded-[1.5rem] border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Trades</p>
            <p className="text-2xl font-black text-white">{trades.length}</p>
          </div>
          <div className="bg-[#11161D] p-6 rounded-[1.5rem] border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Avg RR</p>
            <p className="text-2xl font-black text-purple-400">
              1:{(trades.reduce((a,b)=>a+(b.rrr||0),0)/(trades.length||1)).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5">Asset / Session</th>
                  <th className="px-6 py-5">Strategy / Duration</th>
                  <th className="px-6 py-5">Risk:Reward</th>
                  <th className="px-6 py-5">Exit Type</th>
                  <th className="px-6 py-5 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr><td colSpan="5" className="p-20 text-center animate-pulse text-xs font-bold uppercase tracking-[0.3em]">Loading Data...</td></tr>
                ) : trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-6 py-6">
                      <div className="font-black text-white text-sm">{trade.symbol}</div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase tracking-tighter mt-1"><Globe size={10}/> {trade.session}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs text-slate-300">{trade.strategy}</div>
                      <div className="text-[10px] text-slate-600 flex items-center gap-1 mt-1"><Clock size={10}/> {trade.duration}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[10px] font-mono space-y-0.5">
                        <div className="text-red-500/50">SL: {trade.sl}</div>
                        <div className="text-emerald-500/50">TP: {trade.tp}</div>
                        <div className="text-blue-400 font-bold">RR 1:{trade.rrr}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter ${
                        trade.closeType === 'TP Hit' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
                        trade.closeType === 'SL Hit' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-slate-500/20 text-slate-500'
                      }`}>{trade.closeType}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="text-right">
                          <div className={`font-mono font-bold text-base ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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

      {/* Slide-over Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#11161D] h-full rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Execute Entry</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 pb-10">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Asset Pair</label>
                <input placeholder="SYMBOL (e.g. XAUUSD)" className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold outline-none focus:border-blue-500" value={formData.symbol} onChange={e=>setFormData({...formData, symbol: e.target.value.toUpperCase()})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold outline-none" value={formData.direction} onChange={e=>setFormData({...formData, direction: e.target.value})}>
                  <option value="Buy">BUY</option>
                  <option value="Sell">SELL</option>
                </select>
                <input placeholder="LOTS" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.lotSize} onChange={e=>setFormData({...formData, lotSize: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6">
                <div className="space-y-4">
                  <input placeholder="ENTRY PRICE" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm outline-none" value={formData.entryPrice} onChange={e=>setFormData({...formData, entryPrice: e.target.value})} required />
                  <input placeholder="STOP LOSS" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm outline-none" value={formData.sl} onChange={e=>setFormData({...formData, sl: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <input placeholder="EXIT PRICE" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm outline-none" value={formData.exitPrice} onChange={e=>setFormData({...formData, exitPrice: e.target.value})} required />
                  <input placeholder="TAKE PROFIT" type="number" step="0.00001" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm outline-none" value={formData.tp} onChange={e=>setFormData({...formData, tp: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manual Exit Type (Optional)</label>
                <select className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.manualCloseType} onChange={e=>setFormData({...formData, manualCloseType: e.target.value})}>
                  <option value="">Auto-detect (TP/SL)</option>
                  <option value="Manual Exit">Manual Exit</option>
                  <option value="Trailing SL">Trailing SL</option>
                  <option value="Breakeven">Breakeven</option>
                  <option value="Partial Close">Partial Close</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Timeline</label>
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none" value={formData.entryDate} onChange={e=>setFormData({...formData, entryDate: e.target.value})} required />
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none" value={formData.exitDate} onChange={e=>setFormData({...formData, exitDate: e.target.value})} required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : "SAVE TO CLOUD"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
