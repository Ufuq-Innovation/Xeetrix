"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, Plus, Search, Trash2, Globe, Store, Printer, Download, Eye, Truck, CheckCircle2, Clock
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online"); 
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [deliveryStatus, setDeliveryStatus] = useState("Pending"); // নতুন লজিক: ডেলিভারি স্ট্যাটাস
  const [paidAmount, setPaidAmount] = useState(""); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [orderSource, setOrderSource] = useState("Facebook");
  
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
    
    // অটোমেটিক লজিক সেটআপ
    if (transactionType === "offline") {
      setPaymentStatus("Paid");
      setDeliveryStatus("Delivered");
    } else {
      setPaymentStatus("COD");
      setDeliveryStatus("Pending");
    }
  }, [transactionType]);

  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  const currency = useMemo(() => (typeof context?.currency === 'object' ? context?.currency.symbol : context?.currency) || "৳", [context?.currency]);

  // --- API Data ---
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

  // --- Calculations Logic ---
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    
    // আপনার চাওয়া মেইন লজিক: (Paid + Delivered) অথবা Offline হলেই সেটা Realized Profit
    const isConfirmedSell = (transactionType === "offline") || (paymentStatus === "Paid" && deliveryStatus === "Delivered");
    const netProfit = isConfirmedSell ? ((subTotal - disc) - totalCost) : 0;

    return { subTotal, totalSell, netProfit, dueAmount: totalSell - currentPaid, currentPaid, isConfirmedSell };
  }, [cart, expenses, transactionType, paymentStatus, deliveryStatus, paidAmount]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = (order.customerName || '').toLowerCase().includes(filters.search.toLowerCase()) || (order.orderId || '').includes(filters.search);
      const matchType = filters.type === 'all' || order.transactionType === filters.type;
      const matchStatus = filters.status === 'all' || order.paymentStatus === filters.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [orders, filters]);

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
      toast.success(transactionType === "offline" ? "Sale Recorded!" : "Order Placed!");
    }
  });

  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setExpenses({ discount: '', courier: '' });
    setPaidAmount("");
    setOrderId(generateId(transactionType));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto text-slate-200">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-8 shadow-2xl">
            {/* Header / Type Switcher */}
            <div className="flex justify-between items-center mb-8">
               <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5">
                <button onClick={() => setTransactionType("online")} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ONLINE ORDER</button>
                <button onClick={() => setTransactionType("offline")} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>OFFLINE SELL</button>
              </div>
              <div className="text-right font-mono text-sm font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg">{orderId}</div>
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" placeholder="Phone Number" value={customerInfo.phone} onChange={e => { setCustomerInfo({...customerInfo, phone: e.target.value}); setShowCustSuggestions(true); }} />
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              
              {transactionType === "online" && (
                <>
                  <textarea className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px]" placeholder="Full Delivery Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 italic tracking-widest">Delivery Status</label>
                    <select value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500">
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1 italic tracking-widest">Payment Status</label>
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500">
                      <option value="COD">COD</option>
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial">Partial Payment</option>
                    </select>
                  </div>
                  
                  {paymentStatus === "Partial" && (
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-yellow-500 uppercase ml-1 tracking-widest">Advance Paid Amount</label>
                       <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-[#1a2230] border border-yellow-500/30 rounded-2xl text-sm font-black text-white outline-none focus:border-yellow-500" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Expenses */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase ml-1">Discount</label>
                <input type="number" className="w-full px-5 py-4 bg-[#1a2230] border border-red-500/10 rounded-2xl text-sm font-black outline-none focus:border-red-500" placeholder="0" value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
              </div>
              {transactionType === "online" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase ml-1">Courier</label>
                  <input type="number" className="w-full px-5 py-4 bg-[#1a2230] border border-blue-500/10 rounded-2xl text-sm font-black outline-none focus:border-blue-500" placeholder="0" value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
                </div>
              )}
            </div>

            {/* Product Selector */}
            <div className="mt-8 p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <select className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" value={selectedProduct.id} onChange={e => {
                  const p = inventory.find(i => i._id === e.target.value);
                  if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                }}>
                  <option value="">Select Product...</option>
                  {inventory.map(item => <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({item.stock})</option>)}
                </select>
                <input type="number" className="w-24 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none focus:border-blue-500" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                <button onClick={() => { if (!selectedProduct.id) return; setCart([...cart, {...selectedProduct}]); setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 }); }} className="px-10 bg-blue-600 rounded-2xl text-white font-black hover:scale-105 active:scale-95 transition-all"><Plus /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1a2230] p-4 rounded-xl border border-white/5 group">
                    <span className="text-xs font-black uppercase tracking-tighter">{item.name} x {item.qty}</span>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => createOrderMutation.mutate({ 
                orderId, transactionType, orderSource, paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                deliveryStatus, customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier),
                totalSell: summary.totalSell, netProfit: summary.netProfit, dueAmount: summary.dueAmount, paidAmount: summary.currentPaid,
                isConfirmedSell: summary.isConfirmedSell
              })} className={`w-full mt-8 py-6 rounded-3xl font-black uppercase shadow-2xl active:scale-95 transition-all ${transactionType === 'offline' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              {transactionType === 'offline' ? 'Record Sale (Offline)' : 'Generate Order (Online)'}
            </button>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="xl:col-span-1">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-6 space-y-6">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic border-l-4 border-blue-500 pl-4">Live Accounting</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-500"><span>Subtotal</span><span>{currency}{summary.subTotal.toLocaleString()}</span></div>
              <div className="h-px bg-white/5"></div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receivable Total</p>
                <p className="text-4xl font-black italic text-white font-mono tracking-tighter">{currency}{summary.totalSell.toLocaleString()}</p>
              </div>

              {/* Realized Profit Alert */}
              <div className={`p-4 rounded-2xl border ${summary.isConfirmedSell ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                <p className="text-[9px] font-black uppercase mb-1 flex items-center gap-2">
                  {summary.isConfirmedSell ? <CheckCircle2 size={12} className="text-emerald-500"/> : <Clock size={12} className="text-yellow-500"/>}
                  {summary.isConfirmedSell ? 'Realized Profit' : 'Pending Revenue'}
                </p>
                <p className={`text-2xl font-black italic ${summary.isConfirmedSell ? 'text-emerald-500' : 'text-yellow-500'}`}>
                  {currency}{summary.netProfit.toLocaleString()}
                </p>
                {!summary.isConfirmedSell && <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-tighter italic">*Counted after Delivery & Payment</p>}
              </div>

              <div className="pt-4 flex gap-4 border-t border-white/5">
                 <div className="flex-1"><p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Paid</p><p className="text-lg font-black text-emerald-500">{currency}{summary.currentPaid.toLocaleString()}</p></div>
                 <div className="flex-1 text-right"><p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Due</p><p className="text-lg font-black text-red-500">{currency}{summary.dueAmount.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mt-12">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-black uppercase italic tracking-widest">Transaction Ledger</h2>
          <div className="flex flex-wrap gap-4">
            <input className="px-5 py-3 bg-black/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500" placeholder="Search Invoice/Name..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-black/20 text-[10px] text-slate-500 font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Date & ID</th>
                <th className="px-6 py-5">Customer Info</th>
                <th className="px-6 py-5">Channel</th>
                <th className="px-6 py-5">Delivery</th>
                <th className="px-6 py-5">Payment</th>
                <th className="px-6 py-5 text-right">Invoice Total</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] font-bold">
              {filteredOrders.map((order, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4"><span className="text-blue-500 font-mono text-[10px]">{order.orderId}</span><br/><span className="text-[9px] text-slate-600 uppercase italic">January 08, 2026</span></td>
                  <td className="px-6 py-4 uppercase"><span className="font-black text-slate-200">{order.customerName}</span><br/><span className="text-[10px] text-slate-500">{order.customerPhone}</span></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order.transactionType === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{order.transactionType}</span></td>
                  <td className="px-6 py-4 uppercase"><span className={`flex items-center gap-1 ${order.deliveryStatus === 'Delivered' ? 'text-emerald-500' : 'text-yellow-500'}`}>{order.deliveryStatus === 'Delivered' ? <CheckCircle2 size={12}/> : <Truck size={12}/>} {order.deliveryStatus}</span></td>
                  <td className="px-6 py-4 uppercase tracking-tighter">{order.paymentStatus}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-200">{currency}{order.totalSell.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center"><button className="p-2 hover:bg-white/10 rounded-lg transition-all"><Eye size={16} className="text-slate-500 hover:text-blue-500"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Receipt */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden text-slate-900 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
            <div id="receipt-content" className="p-8">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6 uppercase">
                <h2 className="text-xl font-black italic tracking-tighter">Business Control Room</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{lastSavedOrder.orderId}</p>
              </div>
              <div className="space-y-1 text-[10px] mb-6 uppercase font-black">
                <div className="flex justify-between"><span>Customer:</span><span className="text-right">{lastSavedOrder.customerName}</span></div>
                <div className="flex justify-between"><span>Phone:</span><span>{lastSavedOrder.customerPhone}</span></div>
                <div className="flex justify-between"><span>Status:</span><span className="text-blue-600">{lastSavedOrder.deliveryStatus}</span></div>
              </div>
              <div className="space-y-2 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <div className="flex justify-between text-[11px] font-bold"><span>Item Subtotal</span><span>{currency}{lastSavedOrder.totalSell - (Number(expenses.courier) || 0) + (Number(expenses.discount) || 0)}</span></div>
                 <div className="flex justify-between text-[11px] font-bold text-red-500"><span>Discount</span><span>-{currency}{lastSavedOrder.discount || 0}</span></div>
                 {lastSavedOrder.transactionType === "online" && <div className="flex justify-between text-[11px] font-bold text-blue-500"><span>Courier Charge</span><span>+{currency}{lastSavedOrder.courier || 0}</span></div>}
                 <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between font-black text-2xl tracking-tighter"><span>Grand Total</span><span>{currency}{lastSavedOrder.totalSell}</span></div>
                 <div className="flex justify-between text-xs font-black text-emerald-600 mt-2"><span>Paid to Date</span><span>{currency}{lastSavedOrder.paidAmount}</span></div>
              </div>
              <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest">Thank you for your business</p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
                <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all">Print Invoice</button>
                <button onClick={() => setShowReceipt(false)} className="px-6 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}