"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { 
  X, Plus, Search, Trash2, Globe, Store, Printer, Download, 
  Filter, Calendar, ChevronDown, ExternalLink, MoreVertical, Eye
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // --- States ---
  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online"); 
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [paidAmount, setPaidAmount] = useState(""); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [orderSource, setOrderSource] = useState("Facebook");
  
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  
  // Suggestion State
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    search: '', dateRange: 'all', type: 'all', status: 'all', delivery: 'all'
  });

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
  }, [transactionType]);

  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  const currency = useMemo(() => (typeof context?.currency === 'object' ? context?.currency.symbol : context?.currency) || "৳", [context?.currency]);

  // --- Data Fetching ---
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      return data.success ? data.orders : [];
    }
  });

  // --- Customer Auto-Suggestion Logic ---
  const customerSuggestions = useMemo(() => {
    if (!customerInfo.phone) return [];
    const uniqueCustomers = Array.from(new Set(orders.map(o => o.customerPhone)))
      .map(phone => orders.find(o => o.customerPhone === phone));
    return uniqueCustomers.filter(c => c.customerPhone.includes(customerInfo.phone));
  }, [customerInfo.phone, orders]);

  // --- Calculations ---
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    
    // Offline হলে অটো Paid
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    const dueAmount = totalSell - currentPaid;

    return { subTotal, totalSell, netProfit: (subTotal - disc) - totalCost, dueAmount, currentPaid };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  // --- Table Filtering ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = order.customerName.toLowerCase().includes(filters.search.toLowerCase()) || order.orderId.includes(filters.search);
      const matchType = filters.type === 'all' || order.transactionType === filters.type;
      const matchStatus = filters.status === 'all' || order.paymentStatus === filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [orders, filters]);

  // --- Actions ---
  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      setLastSavedOrder({ ...data.order, summary, customerInfo, cart, expenses });
      setShowReceipt(true);
      resetForm();
      toast.success(t('order_successful'));
    }
  });

  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setExpenses({ discount: '', courier: '' });
    setPaidAmount("");
    setOrderId(generateId(transactionType));
  };

  const handlePrint = () => {
    const content = document.getElementById("receipt-content").innerHTML;
    const win = window.open('', '', 'height=700,width=500');
    win.document.write(`<html><head><title>Print</title><script src="https://cdn.tailwindcss.com"></script></head><body>${content}</body></html>`);
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleDownload = async () => {
    const element = document.getElementById("receipt-content");
    const canvas = await html2canvas(element);
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = `Receipt-${lastSavedOrder.orderId}.png`;
    link.click();
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto text-slate-200">
      
      {/* Top Section: Form and Real-time Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Main Order Form */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5">
                <button onClick={() => setTransactionType("online")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                  <Globe size={14} /> ONLINE
                </button>
                <button onClick={() => setTransactionType("offline")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
                  <Store size={14} /> OFFLINE (CASH)
                </button>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block uppercase italic">Tracking ID</span>
                <span className="text-sm font-mono font-black text-blue-500">{orderId}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Inputs with Suggestions */}
              <div className="relative">
                <input 
                  className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500/50" 
                  placeholder="Customer Phone" 
                  value={customerInfo.phone} 
                  onChange={e => {
                    setCustomerInfo({...customerInfo, phone: e.target.value});
                    setShowCustSuggestions(true);
                  }} 
                />
                {showCustSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#1a2230] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {customerSuggestions.map((c, i) => (
                      <div key={i} onClick={() => {
                        setCustomerInfo({ name: c.customerName, phone: c.customerPhone, address: c.customerAddress });
                        setShowCustSuggestions(false);
                      }} className="px-5 py-3 hover:bg-blue-600 cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                        <p className="text-xs font-black">{c.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.customerPhone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500/50" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              
              {transactionType === "online" && (
                <>
                  <textarea className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px]" placeholder="Delivery Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Platform</label>
                    <select value={orderSource} onChange={e => setOrderSource(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none">
                      <option value="Facebook">Facebook</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Website">Website</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Online Payment Status</label>
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none">
                      <option value="COD">Cash On Delivery</option>
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Expenses */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-white/5 pt-6">
              <div className="md:col-span-2 relative">
                <input type="number" className="w-full px-5 py-4 bg-[#1a2230] border border-red-500/20 rounded-2xl text-sm font-black text-red-400" placeholder="Discount Amount" value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
              </div>
              {transactionType === "online" && (
                <div className="md:col-span-2">
                  <input type="number" className="w-full px-5 py-4 bg-[#1a2230] border border-blue-500/20 rounded-2xl text-sm font-black text-blue-400" placeholder="Courier Charge" value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
                </div>
              )}
            </div>

            {/* Product Selector */}
            <div className="mt-8 p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <select className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" value={selectedProduct.id} onChange={e => {
                  const p = inventory.find(i => i._id === e.target.value);
                  if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                }}>
                  <option value="">Select Product...</option>
                  {inventory.map(item => <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({item.stock} in stock)</option>)}
                </select>
                <input type="number" className="w-24 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                <button onClick={() => {
                  if (!selectedProduct.id) return;
                  setCart([...cart, {...selectedProduct}]);
                  setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
                }} className="px-10 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all text-white font-black"><Plus /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1a2230] p-4 rounded-2xl border border-white/5 group">
                    <div>
                      <p className="text-xs font-black uppercase">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">{item.qty} x {currency}{item.price}</p>
                    </div>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500/50 group-hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => createOrderMutation.mutate({ 
                orderId, transactionType, orderSource, paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier),
                totalSell: summary.totalSell, netProfit: summary.netProfit, dueAmount: summary.dueAmount, paidAmount: summary.currentPaid
              })}
              disabled={cart.length === 0}
              className="w-full mt-8 py-6 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {createOrderMutation.isPending ? "Syncing..." : "Process Transaction"}
            </button>
          </div>
        </div>

        {/* Floating Summary Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-6 space-y-8">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest italic border-l-4 border-blue-500 pl-4">Live Invoice</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-500"><span>Subtotal</span><span className="font-mono text-white">{currency} {summary.subTotal}</span></div>
              <div className="flex justify-between text-xs font-bold text-red-400"><span>Discount</span><span className="font-mono">-{currency} {expenses.discount || 0}</span></div>
              {transactionType === "online" && <div className="flex justify-between text-xs font-bold text-blue-500"><span>Courier</span><span className="font-mono">+{currency} {expenses.courier || 0}</span></div>}
              <div className="h-px bg-white/5 my-4"></div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Payable</p>
                <p className="text-5xl font-black italic text-white font-mono">{currency} {summary.totalSell}</p>
              </div>
              <div className="pt-4 flex gap-4">
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-500 uppercase">Paid</p>
                    <p className="text-xl font-black text-emerald-500 font-mono">{currency} {summary.currentPaid}</p>
                 </div>
                 {summary.dueAmount > 0 && (
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-red-500 uppercase">Due</p>
                      <p className="text-xl font-black text-red-500 font-mono">{currency} {summary.dueAmount}</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Advanced History Table with Multi-Filter --- */}
      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Transaction Ledger</h2>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-xs font-bold outline-none focus:border-blue-500/30" 
                placeholder="Search ID or Customer..." 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <select className="px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-xs font-black outline-none" onChange={e => setFilters({...filters, type: e.target.value})}>
              <option value="all">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <select className="px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-xs font-black outline-none" onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="COD">COD</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-black/20">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-5">ID & Date</th>
                <th className="px-6 py-5">Customer & Contact</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Payment Status</th>
                <th className="px-6 py-5 text-right">Financials</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-xs font-black text-blue-500 font-mono">{order.orderId}</p>
                    <p className="text-[10px] font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black">{order.customerName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.transactionType === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {order.transactionType} {order.orderSource && `(${order.orderSource})`}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.paymentStatus === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500/10 text-amber-500'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-y-1">
                    <p className="text-xs font-black">Total: {currency}{order.totalSell}</p>
                    <div className="flex justify-end gap-3 text-[10px] font-bold">
                      <span className="text-emerald-500">Paid: {order.paidAmount}</span>
                      <span className="text-red-500">Due: {order.dueAmount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Detailed Receipt Modal --- */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)] animate-in zoom-in duration-300">
            <div id="receipt-content" className="p-10 text-slate-900 bg-white">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-8 mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Control Room</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{lastSavedOrder.orderId} • {new Date().toLocaleDateString()}</p>
              </div>

              <div className="mb-8 space-y-2 text-[11px] font-bold uppercase text-slate-600">
                <div className="flex justify-between"><span>Customer:</span><span className="text-black font-black">{lastSavedOrder.customerInfo.name}</span></div>
                <div className="flex justify-between"><span>Contact:</span><span className="text-black font-black">{lastSavedOrder.customerInfo.phone}</span></div>
                {lastSavedOrder.transactionType === "online" && <div className="flex justify-between"><span>Ship To:</span><span className="text-black font-black text-right max-w-[150px]">{lastSavedOrder.customerInfo.address}</span></div>}
              </div>

              <table className="w-full text-left text-[11px] mb-8">
                <thead className="border-b-2 border-slate-100"><tr className="text-slate-400 uppercase font-black"><th className="pb-4">Description</th><th className="pb-4 text-right">Price</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {lastSavedOrder.cart.map((item, i) => (
                    <tr key={i}><td className="py-4 font-bold">{item.name} x {item.qty}</td><td className="py-4 text-right font-black font-mono">{currency}{item.price * item.qty}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-3 bg-slate-50 p-6 rounded-3xl">
                <div className="flex justify-between text-xs font-bold text-slate-500"><span>SUBTOTAL</span><span>{currency}{lastSavedOrder.summary.subTotal}</span></div>
                <div className="flex justify-between text-xs font-bold text-red-500"><span>DISCOUNT</span><span>-{currency}{lastSavedOrder.expenses.discount || 0}</span></div>
                {lastSavedOrder.transactionType === "online" && <div className="flex justify-between text-xs font-bold text-blue-600"><span>COURIER</span><span>+{currency}{lastSavedOrder.expenses.courier || 0}</span></div>}
                <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-xl"><span>TOTAL</span><span>{currency}{lastSavedOrder.summary.totalSell}</span></div>
                <div className="flex justify-between text-xs font-black text-emerald-600"><span>AMOUNT PAID</span><span>{currency}{lastSavedOrder.summary.currentPaid}</span></div>
                {lastSavedOrder.summary.dueAmount > 0 && <div className="flex justify-between text-xs font-black text-red-600 italic"><span>REMAINING DUE</span><span>{currency}{lastSavedOrder.summary.dueAmount}</span></div>}
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex gap-2">
              <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"><Printer size={18} /> PRINT</button>
              <button onClick={handleDownload} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"><Download size={18} /> SAVE PNG</button>
              <button onClick={() => setShowReceipt(false)} className="px-6 py-5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}