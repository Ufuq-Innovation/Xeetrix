"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, Globe, Zap, X, Loader2, BarChart3, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function XeetrixEcommerceOS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    symbol: '', direction: 'Retail', entryPrice: '', exitPrice: '', 
    lotSize: '', strategy: 'Direct Sales', emotion: 'Normal',
    entryDate: '', exitDate: ''
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/trades'); // API রাউট এখনো /api/trades ই রাখছি যাতে এরর না দেয়
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const chartData = orders.slice().reverse().reduce((acc, order) => {
    const prevRevenue = acc.length > 0 ? acc[acc.length - 1].revenue : 0;
    acc.push({ date: new Date(order.entryDate).toLocaleDateString(), revenue: prevRevenue + order.pnl });
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
        setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '' });
        fetchOrders();
        setIsFormOpen(false);
      }
    } finally { setIsSubmitting(false); }
  };

  const deleteOrder = async (id) => {
    if (confirm("Delete this order record?")) {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 font-sans">
      <nav className="border-b border-white/5 bg-[#07090E]/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={20} />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">Xeetrix <span className="text-blue-500">OS</span></span>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <PlusCircle size={16}/> NEW ORDER
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Sales Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#11161D] p-6 rounded-[2rem] border border-white/5 h-[350px]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-slate-500 flex items-center gap-2"><TrendingUp size={14}/> Revenue Growth Curve</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#11161D', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#pnlGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Revenue', val: `$${orders.reduce((a,b)=>a+b.pnl,0).toFixed(2)}`, color: 'text-emerald-400' },
              { label: 'Success Rate', val: `${orders.length ? (orders.filter(t=>t.status==='Win').length/orders.length*100).toFixed(1) : 0}%`, color: 'text-blue-400' },
              { label: 'Total Orders', val: orders.length, color: 'text-white' },
              { label: 'Avg Profit/Order', val: `$${(orders.reduce((a,b)=>a+(b.pnl||0),0)/(orders.length||1)).toFixed(1)}`, color: 'text-purple-400' }
            ].map((s, i) => (
              <div key={i} className="bg-[#11161D] p-6 rounded-[1.5rem] border border-white/5 flex flex-col justify-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory & Orders Table */}
        <div className="bg-[#11161D] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5">Product / Channel</th>
                  <th className="px-6 py-5">Strategy / Source</th>
                  <th className="px-6 py-5">Pricing (Cost/Sell)</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] group">
                    <td className="px-6 py-6">
                      <div className="font-black text-white text-sm">{order.symbol}</div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase mt-1"><Package size={10}/> Stock: Active</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs text-slate-300">{order.strategy}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-slate-500 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><ShoppingCart size={10}/> {order.direction}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[10px] font-mono leading-tight">
                        <div className="text-slate-500">Cost: {order.entryPrice}</div>
                        <div className="text-emerald-500/50">Sell: {order.exitPrice}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[9px] font-black px-2 py-1 rounded border border-blue-500/30 text-blue-400 bg-blue-500/5 uppercase tracking-tighter">Completed</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="text-right">
                          <div className={`font-mono font-bold text-sm ${order.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {order.pnl >= 0 ? '+' : ''}{order.pnl.toFixed(2)}
                          </div>
                          <div className="text-[9px] font-bold text-slate-600 uppercase">Qty: {order.lotSize}</div>
                        </div>
                        <button onClick={() => deleteOrder(order._id)} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Order Entry Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#11161D] h-full rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white italic tracking-tight uppercase">New Order Entry</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Product Name & Quantity</label>
                <div className="flex gap-2">
                  <input placeholder="iPhone 15 Pro" className="flex-1 bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold outline-none" value={formData.symbol} onChange={e=>setFormData({...formData, symbol: e.target.value})} required />
                  <input placeholder="QTY" type="number" className="w-24 bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.lotSize} onChange={e=>setFormData({...formData, lotSize: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white font-bold" value={formData.direction} onChange={e=>setFormData({...formData, direction: e.target.value})}>
                  <option value="Retail">RETAIL</option>
                  <option value="Wholesale">WHOLESALE</option>
                </select>
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white text-xs" value={formData.strategy} onChange={e=>setFormData({...formData, strategy: e.target.value})}>
                  <option value="Direct Sales">Direct Sales</option>
                  <option value="Online Store">Online Store</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-600 uppercase">Cost Price</label>
                  <input placeholder="0.00" type="number" step="0.01" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm" value={formData.entryPrice} onChange={e=>setFormData({...formData, entryPrice: e.target.value})} required />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-600 uppercase">Selling Price</label>
                  <input placeholder="0.00" type="number" step="0.01" className="w-full bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-sm" value={formData.exitPrice} onChange={e=>setFormData({...formData, exitPrice: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Order Date</label>
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[10px] text-white" value={formData.entryDate} onChange={e=>setFormData({...formData, entryDate: e.target.value})} required />
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-[10px] text-white" value={formData.exitDate} onChange={e=>setFormData({...formData, exitDate: e.target.value})} required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 flex justify-center">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : "CONFIRM ORDER"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}