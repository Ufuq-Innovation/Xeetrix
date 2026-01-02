"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, Zap, X, Loader2, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function XeetrixOS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '', direction: 'Retail', entryPrice: '', exitPrice: '', 
    lotSize: '', strategy: 'Direct Sales', entryDate: '', exitDate: ''
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormData({ ...formData, symbol: '', entryPrice: '', exitPrice: '', lotSize: '' });
      fetchOrders();
      setIsFormOpen(false);
    }
    setIsSubmitting(false);
  };

  const deleteOrder = async (id) => {
    if (confirm("Delete this order?")) {
      await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300">
      <nav className="border-b border-white/5 bg-[#07090E]/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500 fill-blue-500" size={20} />
          <span className="text-xl font-black text-white italic tracking-tighter uppercase">Xeetrix <span className="text-blue-500">OS</span></span>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
          <PlusCircle size={16}/> NEW ORDER
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { label: 'Net Revenue', val: `$${orders.reduce((a,b)=>a+b.pnl,0).toFixed(2)}`, color: 'text-emerald-400' },
            { label: 'Total Orders', val: orders.length, color: 'text-white' },
            { label: 'Avg Profit', val: `$${(orders.reduce((a,b)=>a+(b.pnl||0),0)/(orders.length||1)).toFixed(2)}`, color: 'text-blue-400' },
            { label: 'Success Rate', val: `${orders.length ? (orders.filter(t=>t.pnl > 0).length/orders.length*100).toFixed(1) : 0}%`, color: 'text-purple-400' }
          ].map((s, i) => (
            <div key={i} className="bg-[#11161D] p-6 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#11161D] rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-white/[0.02] group">
                  <td className="px-6 py-5"><div className="font-bold text-white">{order.symbol}</div></td>
                  <td className="px-6 py-5 text-xs">{order.direction}</td>
                  <td className="px-6 py-5 text-xs text-slate-500">C: {order.entryPrice} / S: {order.exitPrice}</td>
                  <td className="px-6 py-5 text-right flex justify-end gap-4 items-center">
                    <div>
                      <div className={`font-mono font-bold ${order.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{order.pnl.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-600">Qty: {order.lotSize}</div>
                    </div>
                    <button onClick={() => deleteOrder(order._id)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#11161D] rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-black text-white italic uppercase">Record New Order</h2><button onClick={() => setIsFormOpen(false)}><X/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Product Name" className="w-full bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.symbol} onChange={e=>setFormData({...formData, symbol: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Qty" type="number" className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.lotSize} onChange={e=>setFormData({...formData, lotSize: e.target.value})} required />
                <select className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.direction} onChange={e=>setFormData({...formData, direction: e.target.value})}><option value="Retail">Retail</option><option value="Wholesale">Wholesale</option></select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Cost Price" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.entryPrice} onChange={e=>setFormData({...formData, entryPrice: e.target.value})} required />
                <input placeholder="Sell Price" type="number" step="0.01" className="bg-[#07090E] border border-slate-800 p-4 rounded-xl text-white outline-none" value={formData.exitPrice} onChange={e=>setFormData({...formData, exitPrice: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Timeline</label>
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.entryDate} onChange={e=>setFormData({...formData, entryDate: e.target.value})} required />
                <input type="datetime-local" className="bg-[#07090E] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.exitDate} onChange={e=>setFormData({...formData, exitDate: e.target.value})} required />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg transition-all">{isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : "SYNC TO OS"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}