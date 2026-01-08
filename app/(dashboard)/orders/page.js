"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toPng } from 'html-to-image'; 
import { 
  X, Plus, Search, Trash2, Globe, Store, Printer, Download, Eye, Truck, CheckCircle2, Clock, Image as ImageIcon, Wallet
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const receiptRef = useRef(null); 

  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online"); 
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [deliveryStatus, setDeliveryStatus] = useState("Pending"); 
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paidAmount, setPaidAmount] = useState(""); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
    
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

  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    
    const isConfirmedSell = (transactionType === "offline") || (paymentStatus === "Paid" && deliveryStatus === "Delivered");
    const netProfit = isConfirmedSell ? ((subTotal - disc) - totalCost) : 0;

    return { 
      subTotal: subTotal || 0, 
      totalSell: totalSell || 0, 
      netProfit: netProfit || 0, 
      dueAmount: (totalSell - currentPaid) || 0, 
      currentPaid: currentPaid || 0, 
      isConfirmedSell 
    };
  }, [cart, expenses, transactionType, paymentStatus, deliveryStatus, paidAmount]);

  const downloadReceiptImage = async () => {
    if (receiptRef.current === null) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `INV-${lastSavedOrder?.orderId || 'POS'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image Downloaded");
    } catch (err) {
      toast.error("Image export failed");
    }
  };

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
      setLastSavedOrder({ ...data.order }); 
      setShowReceipt(true);
      resetForm();
      toast.success("Transaction Successful");
    }
  });

  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setExpenses({ discount: '', courier: '' });
    setPaidAmount("");
    setOrderId(generateId(transactionType));
  };

  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      const searchStr = (filters.search || "").toLowerCase();
      return (order.customerName || '').toLowerCase().includes(searchStr) || (order.orderId || '').toLowerCase().includes(searchStr);
    });
  }, [orders, filters]);

  if (!mounted) return null;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-[1600px] mx-auto text-slate-200">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5">
                <button onClick={() => setTransactionType("online")} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>ONLINE ORDER</button>
                <button onClick={() => setTransactionType("offline")} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}>OFFLINE SELL</button>
              </div>
              <div className="font-mono text-sm font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">{orderId}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="Phone Number" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              
              {transactionType === "online" && (
                <>
                  <textarea className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px] focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="Full Delivery Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Platform Source</label>
                    <select value={orderSource} onChange={e => setOrderSource(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all">
                      <option value="Facebook">Facebook</option>
                      <option value="Website">Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Whatsapp">Whatsapp</option>
                      <option value="Linkedin">Linkedin</option>
                      <option value="X">X (Twitter)</option>
                      <option value="Phone Call">Phone Call</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Payment Status</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all">
                            <option value="COD">COD</option>
                            <option value="Paid">Fully Paid</option>
                            <option value="Partial">Partial Payment</option>
                        </select>
                        {paymentStatus === "Partial" && (
                            <div className="relative flex-1 animate-in slide-in-from-right-2 duration-300">
                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                <input type="number" className="w-full px-12 py-4 bg-[#1a2230] border border-emerald-500/30 rounded-2xl text-sm font-black outline-none focus:border-emerald-500 transition-all" placeholder="Paid Amount" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                            </div>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Product Selection Section */}
            <div className="mt-8 p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <select className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" value={selectedProduct.id} onChange={e => {
                  const p = inventory.find(i => i._id === e.target.value);
                  if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                }}>
                  <option value="">Select Product...</option>
                  {inventory.map(item => <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({item.stock})</option>)}
                </select>
                <input type="number" className="w-full md:w-24 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none focus:border-blue-500 transition-all" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                <button onClick={() => { if (!selectedProduct.id) return; setCart([...cart, {...selectedProduct}]); setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 }); }} className="px-10 py-4 bg-blue-600 rounded-2xl text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center"><Plus /></button>
              </div>
              
              {/* Cart Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1a2230] p-4 rounded-xl border border-white/5 group transition-all hover:border-white/20">
                    <span className="text-xs font-black uppercase tracking-tight">{item.name} x {item.qty}</span>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500 hover:scale-110 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>

              {/* Extras: Discount & Courier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <input type="number" placeholder="Discount Amount" className="px-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
                {transactionType === "online" && (
                    <input type="number" placeholder="Courier Charge" className="px-5 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
                )}
              </div>
            </div>

            <button onClick={() => createOrderMutation.mutate({ 
                orderId, transactionType, orderSource, paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                deliveryStatus, customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier),
                totalSell: summary.totalSell, netProfit: summary.netProfit, dueAmount: summary.dueAmount, paidAmount: summary.currentPaid,
                isConfirmedSell: summary.isConfirmedSell
              })} className={`w-full mt-8 py-6 rounded-3xl font-black uppercase shadow-2xl active:scale-95 transition-all ${transactionType === 'offline' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-blue-600 shadow-blue-600/20'}`}>
              {transactionType === 'offline' ? 'Confirm Sale' : 'Create Order'}
            </button>
          </div>
        </div>

        {/* Right Side Summary */}
        <div className="xl:col-span-1">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-6 space-y-6">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic border-l-4 border-blue-500 pl-4">Accounting Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-500"><span>Subtotal</span><span>{currency}{(summary.subTotal || 0).toLocaleString()}</span></div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Receivable</p>
                <p className="text-4xl font-black italic text-white font-mono tracking-tighter">{currency}{(summary.totalSell || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1 pt-2">
                <p className="text-[10px] font-black text-slate-500 uppercase">Paid Amount</p>
                <p className="text-xl font-black text-emerald-500 font-mono tracking-tighter">{currency}{(summary.currentPaid || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase">Due Amount</p>
                <p className="text-xl font-black text-red-500 font-mono tracking-tighter">{currency}{(summary.dueAmount || 0).toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${summary.isConfirmedSell ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                <p className="text-[9px] font-black uppercase mb-1 flex items-center gap-2">
                  {summary.isConfirmedSell ? <CheckCircle2 size={12} className="text-emerald-500"/> : <Clock size={12} className="text-yellow-500"/>}
                  {summary.isConfirmedSell ? 'Realized Profit' : 'Expected Profit'}
                </p>
                <p className={`text-2xl font-black italic ${summary.isConfirmedSell ? 'text-emerald-500' : 'text-yellow-500'}`}>
                  {currency}{(summary.netProfit || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mt-12">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-black uppercase italic tracking-widest">Transaction Ledger</h2>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-xs outline-none focus:border-blue-500 transition-all" placeholder="Search orders..." onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-black/20 text-[10px] text-slate-500 font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Date & ID</th>
                <th className="px-6 py-5">Customer Info</th>
                <th className="px-6 py-5">Payment Status</th>
                <th className="px-6 py-5 text-right">Invoice Total</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] font-bold">
              {filteredOrders.map((order, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-blue-500 font-mono text-[10px]">{order?.orderId || 'N/A'}</span>
                    <br/>
                    <span className="text-[9px] text-slate-600 uppercase italic">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 uppercase">
                    <span className="font-black text-slate-200">{order?.customerName || 'Walking Customer'}</span>
                    <br/>
                    <span className="text-[10px] text-slate-500">{order?.customerPhone || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${order?.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {order?.paymentStatus || 'COD'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-200">
                    {currency}{(Number(order?.totalSell) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all"><Eye size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden text-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
            <div ref={receiptRef} className="p-8 bg-white">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6 uppercase">
                <h2 className="text-xl font-black italic tracking-tighter text-blue-600">Xeetrix Control Room</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{lastSavedOrder?.orderId || 'N/A'}</p>
              </div>
              <div className="space-y-2 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-700">
                 <div className="flex justify-between text-[11px] font-bold"><span>Items Subtotal</span><span>{currency}{(Number(lastSavedOrder?.totalSell) - (Number(lastSavedOrder?.courier) || 0) + (Number(lastSavedOrder?.discount) || 0)).toLocaleString()}</span></div>
                 <div className="flex justify-between text-[11px] font-bold text-red-500"><span>Discount</span><span>-{currency}{(Number(lastSavedOrder?.discount) || 0).toLocaleString()}</span></div>
                 {lastSavedOrder?.transactionType === "online" && <div className="flex justify-between text-[11px] font-bold text-blue-500"><span>Courier</span><span>+{currency}{(Number(lastSavedOrder?.courier) || 0).toLocaleString()}</span></div>}
                 <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between font-black text-2xl tracking-tighter text-slate-900"><span>Total</span><span>{currency}{(Number(lastSavedOrder?.totalSell) || 0).toLocaleString()}</span></div>
              </div>
              <p className="text-center text-[8px] font-black text-slate-300 uppercase italic">Transaction Verified via Xeetrix</p>
            </div>
            <div className="p-6 bg-slate-100 grid grid-cols-2 gap-3 border-t border-slate-200">
                <button onClick={() => window.print()} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all"><Printer size={14}/> Print PDF</button>
                <button onClick={downloadReceiptImage} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><ImageIcon size={14}/> Save Image</button>
                <button onClick={() => setShowReceipt(false)} className="col-span-2 py-3 bg-white border border-slate-300 rounded-2xl font-black uppercase text-[10px] text-slate-500 hover:bg-slate-50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}