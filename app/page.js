"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, Clock, Globe, Zap, X, Loader2, Brain, BarChart3, Link } from 'lucide-react';

export default function XeetrixPro() {
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

  // গ্রাফের জন্য ডাটা প্রসেসিং (Equity Curve)
  const chartData = trades.slice().reverse().reduce((acc, trade) => {
    const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    acc.push({
      name: new Date(trade.entryDate).toLocaleDateString(),
      balance: prevBalance + trade.pnl,
    });
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
        setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '', chartLink: '' });
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
      {/* Navbar - আগের মতো */}
      <nav className="border-b border-white/5 bg-[#07090E]/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={20} />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase font-sans">Xeetrix <span className='text-blue-500'>PRO</span></span>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <PlusCircle size={16}/> NEW EXECUTION
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equity Curve Graph */}
          <div className="lg:col-span-2 bg-[#11161D] p-6 rounded-[2rem] border border-white/5 h-[350px]">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500"/> Equity Growth
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#11161D', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPnL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {[
              { label: 'Net Profit', val: `$${trades.reduce((a,b)=>a+b.pnl,0).toFixed(2)}`, color: 'text-emerald-400' },
              { label: 'Win Rate', val: `${trades.length ? (trades.filter(t=>t.status==='Win').length/trades.length*100).toFixed(1) : 0}%`, color: 'text-blue-400' },
              { label: 'Avg RRR', val: `1:${(trades.reduce((a,b)=>a+(b.rrr||0),0)/(trades.length||1)).toFixed(1)}`, color: 'text-purple-400' },
              { label: 'Efficiency', val: 'High', color: 'text-orange-400' }
            ].map((s, i) => (
              <div key={i} className="bg-[#11161D] p-5 rounded-[1.5rem] border border-white/5 flex flex-col justify-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table Section - আগের লজিক ঠিক রেখে */}
        <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5">Asset / Session</th>
                  <th className="px-6 py-5">Setup / Mindset</th>
                  <th className="px-6 py-5">Exit Analysis</th>
                  <th className="px-6 py-5 text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {trades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-6 py-6">
                      <div className="font-black text-white text-sm">{trade.symbol}</div>
                      <div className="text-[9px] font-bold text-blue-500 uppercase flex items-center gap-1"><Globe size={10}/> {trade.session}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs text-slate-300">{trade.strategy}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-slate-500 flex items-center gap-1"><Brain size={10}/> {trade.emotion || 'Neutral'}</span>
                         {trade.chartLink && <a href={trade.chartLink} target="_blank" className="text-blue-500 hover:text-blue-400"><Link size={10}/></a>}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-mono">
                      <span className={`px-2 py-1 rounded border text-[9px] font-bold uppercase ${
                        trade.closeType?.includes('TP') ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
                        trade.closeType?.includes('SL') ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-slate-500/20 text-slate-500'
                      }`}>{trade.closeType}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                         {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                       </div>
                       <div className="text-[9px] text-slate-600 font-bold uppercase">{trade.direction} • 1:{trade.rrr}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Side-over Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#11161D] h-full rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white italic uppercase">Execute Entry</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="SYMBOL" className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold outline-none" value={formData.symbol} onChange={e=>setFormData({...formData, symbol: e.target.value.toUpperCase()})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white" value={formData.direction} onChange={e=>setFormData({...formData, direction: e.target.value})}>
                  <option value="Buy">BUY</option>
                  <option value="Sell">SELL</option>
                </select>
                <input placeholder="LOTS" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white" value={formData.lotSize} onChange={e=>setFormData({...formData, lotSize: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="ENTRY" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.entryPrice} onChange={e=>setFormData({...formData, entryPrice: e.target.value})} required />
                <input placeholder="EXIT" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white" value={formData.exitPrice} onChange={e=>setFormData({...formData, exitPrice: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="SL" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-red-500/50" value={formData.sl} onChange={e=>setFormData({...formData, sl: e.target.value})} />
                <input placeholder="TP" type="number" step="0.00001" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-emerald-500/50" value={formData.tp} onChange={e=>setFormData({...formData, tp: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
                 <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white text-xs" value={formData.emotion} onChange={e=>setFormData({...formData, emotion: e.target.value})}>
                   <option value="Calm">Mindset: Calm</option>
                   <option value="Fear">Mindset: Fear (FOMO)</option>
                   <option value="Greed">Mindset: Greed</option>
                   <option value="Angry">Mindset: Revenge</option>
                 </select>
                 <input placeholder="CHART LINK (URL)" className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white text-xs outline-none" value={formData.chartLink} onChange={e=>setFormData({...formData, chartLink: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-xs text-white" value={formData.entryDate} onChange={e=>setFormData({...formData, entryDate: e.target.value})} required />
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-xs text-white" value={formData.exitDate} onChange={e=>setFormData({...formData, exitDate: e.target.value})} required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : "SAVE EXECUTION"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
