"use client";
import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Clock, Globe, Zap, Menu, X } from 'lucide-react';

export default function XeetrixDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false); // Mobile এ ফর্ম দেখানোর জন্য
  
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
    if (res.ok) { 
      setFormData(initialFormState); 
      fetchTrades(); 
      setIsFormOpen(false); // সাবমিট হলে মোবাইল ফর্ম বন্ধ হবে
    }
  };

  const deleteTrade = async (id) => {
    if (confirm("Delete execution?")) {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
      fetchTrades();
    }
  };

  const netPnl = trades.reduce((a, b) => a + (b.pnl || 0), 0);
  const winRate = trades.length > 0 ? ((trades.filter(t => t.status === 'Win').length / trades.length) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 p-4 md:p-8 lg:p-10 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={24} />
          <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Xeetrix</h1>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="lg:hidden bg-blue-600 p-2 rounded-lg text-white"
        >
          {isFormOpen ? <X size={20}/> : <PlusCircle size={20}/>}
        </button>
        <div className="hidden lg:block text-[10px] font-bold text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5 uppercase tracking-widest">
          Precision Mode Active
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Input Form - Mobile Overlay & Desktop Sidebar */}
        <section className={`
          lg:col-span-4 bg-[#11161D] p-6 rounded-[2rem] border border-white/5 shadow-2xl h-fit 
          fixed inset-0 z-50 lg:relative lg:inset-auto transition-transform duration-300
          ${isFormOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          overflow-y-auto lg:sticky lg:top-10
        `}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold flex items-center gap-2 uppercase text-sm tracking-widest">
              <PlusCircle size={18} className="text-blue-500"/> New Entry
            </h2>
            <button onClick={() => setIsFormOpen(false)} className="lg:hidden text-slate-500"><X size={24}/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Asset (e.g. XAUUSD)" className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-sm" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} required />
            
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white text-sm outline-none" value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})}>
                <option value="Buy">BUY</option>
                <option value="Sell">SELL</option>
              </select>
              <input placeholder="Lots" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-sm" value={formData.lotSize} onChange={(e) => setFormData({...formData, lotSize: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3 border-y border-white/5 py-4">
              <input placeholder="Entry" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-xs" value={formData.entryPrice} onChange={(e) => setFormData({...formData, entryPrice: e.target.value})} required />
              <input placeholder="Exit" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-xs" value={formData.exitPrice} onChange={(e) => setFormData({...formData, exitPrice: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="SL" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-xs" value={formData.sl} onChange={(e) => setFormData({...formData, sl: e.target.value})} />
              <input placeholder="TP" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white outline-none text-xs" value={formData.tp} onChange={(e) => setFormData({...formData, tp: e.target.value})} />
            </div>

            <select className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-2xl text-white text-sm" value={formData.strategy} onChange={(e) => setFormData({...formData, strategy: e.target.value})}>
              <option value="SMC">SMC</option>
              <option value="ICT">ICT</option>
              <option value="Scalp">Scalp</option>
            </select>

            <div className="grid grid-cols-1 gap-2">
              <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[10px] text-white outline-none" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} required />
              <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[10px] text-white outline-none" value={formData.exitDate} onChange={(e) => setFormData({...formData, exitDate: e.target.value})} required />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[1.5rem] uppercase text-xs tracking-widest">
              Store Trade
            </button>
          </form>
        </section>

        {/* Analytics & Table */}
        <section className="lg:col-span-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-[#11161D] p-5 rounded-[1.5rem] border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net PnL</p>
              <p className={`text-xl md:text-2xl font-black ${netPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${netPnl.toFixed(2)}</p>
            </div>
            <div className="bg-[#11161D] p-5 rounded-[1.5rem] border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Win Rate</p>
              <p className="text-xl md:text-2xl font-black text-blue-400">{winRate}%</p>
            </div>
            <div className="col-span-2 md:col-span-1 bg-[#11161D] p-5 rounded-[1.5rem] border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Trades</p>
              <p className="text-xl md:text-2xl font-black text-white">{trades.length}</p>
            </div>
          </div>

          {/* Responsive Table Container */}
          <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                    <th className="px-5 py-4">Asset / Session</th>
                    <th className="px-5 py-4">Strategy</th>
                    <th className="px-5 py-4">RR / Goals</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {trades.map((trade) => (
                    <tr key={trade._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-5">
                        <div className="flex flex-col">
                          <span className="text-white font-black text-sm">{trade.symbol}</span>
                          <span className="text-[8px] font-bold text-blue-500 uppercase bg-blue-500/5 px-1.5 py-0.5 rounded w-fit">{trade.session}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-xs text-slate-400">{trade.strategy}</td>
                      <td className="px-5 py-5">
                        <div className="text-[9px] font-mono leading-tight">
                          <p className="text-blue-400/80">RR 1:{trade.rrr}</p>
                          <p className="text-slate-600">Dur: {trade.duration}</p>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className={`text-[8px] font-black px-2 py-1 rounded border uppercase ${
                          trade.closeType === 'TP Hit' ? 'border-emerald-500/30 text-emerald-400' : 
                          trade.closeType === 'SL Hit' ? 'border-red-500/30 text-red-400' : 'border-slate-500/20 text-slate-500'
                        }`}>
                          {trade.closeType || 'Manual'}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`font-mono font-bold text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                          </span>
                          <button onClick={() => deleteTrade(trade._id)} className="text-slate-700 hover:text-red-500"><Trash2 size={14}/></button>
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
    </div>
  );
}
