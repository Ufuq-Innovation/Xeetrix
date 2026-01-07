"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, ShoppingBag, X, Plus, Search, Trash2, History, 
  Calendar, Globe, Store, CreditCard, ChevronDown, Printer, Download 
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // --- States ---
  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online"); 
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [paidAmount, setPaidAmount] = useState(""); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Effects ---
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

  // --- Calculations ---
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    
    const currentPaid = paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0);
    const dueAmount = totalSell - currentPaid;

    return { subTotal, totalSell, netProfit: (subTotal - disc) - totalCost, dueAmount, currentPaid };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  // --- Mutations ---
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
      setLastSavedOrder({ ...data.order, summary }); // রিসিট এর জন্য ডাটা রাখা
      setShowReceipt(true);
      resetForm();
      toast.success(t('order_successful_alert'));
    }
  });

  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setExpenses({ discount: '', courier: '' });
    setPaidAmount("");
    setOrderId(generateId(transactionType));
  };

  const printReceipt = () => {
    const content = document.getElementById("receipt-content").innerHTML;
    const win = window.open('', '', 'height=700,width=500');
    win.document.write(`<html><head><title>Print</title><script src="https://cdn.tailwindcss.com"></script></head><body>${content}</body></html>`);
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-6 max-w-7xl mx-auto bg-transparent">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-[#11161D] rounded-2xl border border-white/5 w-full sm:w-auto">
          <button onClick={() => setTransactionType("online")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
            <Globe size={14} /> {t('online').toUpperCase()}
          </button>
          <button onClick={() => setTransactionType("offline")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
            <Store size={14} /> {t('offline').toUpperCase()}
          </button>
        </div>
        <div className="font-mono text-[10px] md:text-xs font-bold text-slate-500 bg-[#11161D] px-4 py-2 rounded-lg border border-white/5">
          {t('id')}: {orderId}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-2xl">
            <div className="space-y-8">
              
              {/* Conditional Payment Logic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase ml-1">{t('payment_status')}</label>
                  <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold text-white outline-none">
                    <option value="COD">Cash On Delivery (COD)</option>
                    <option value="Paid">Fully Paid</option>
                    <option value="Partial">Partial Payment</option>
                  </select>
                </div>
                {paymentStatus === "Partial" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-yellow-500 uppercase ml-1">{t('paid_amount')}</label>
                    <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-[#1a2230] border border-yellow-500/20 rounded-2xl text-sm font-black text-white outline-none" />
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" placeholder={t('customer_name')} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" placeholder={t('phone_number')} value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                <textarea className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px]" placeholder={t('delivery_address')} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
              </div>

              {/* Product Selection Hub */}
              <div className="p-4 md:p-8 bg-white/[0.02] rounded-[2rem] border border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7">
                    <select className="w-full px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500/50"
                      value={selectedProduct.id} onChange={e => {
                        const p = inventory.find(i => i._id === e.target.value);
                        if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                      }}>
                      <option value="">{t('select_product')}</option>
                      {inventory.map(item => (
                        <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({t('stock')}: {item.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <input type="number" className="w-full px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black text-white outline-none" placeholder="Qty" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2">
                    <button onClick={() => {
                        if (!selectedProduct.id) return toast.error(t('select_product_first'));
                        setCart([...cart, {...selectedProduct}]);
                        setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
                    }} className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg"><Plus size={24} /></button>
                  </div>
                </div>
                
                {/* Cart View */}
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#1a2230] p-4 rounded-xl border border-white/5">
                      <div className="text-sm font-bold">{item.name} <span className="text-blue-500 font-mono">x{item.qty}</span></div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs">{currency} {item.price * item.qty}</span>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-500/50 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => createOrderMutation.mutate({ 
                  orderId, orderDate, transactionType, orderSource, paymentStatus,
                  customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                  products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier),
                  totalSell: summary.totalSell, netProfit: summary.netProfit, dueAmount: summary.dueAmount
                })}
                disabled={createOrderMutation.isPending || cart.length === 0} 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${transactionType === 'online' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-600 shadow-emerald-500/20'} text-white shadow-xl`}
              >
                {createOrderMutation.isPending ? t('syncing') : t('confirm_order')}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Sidebar Bill Summary */}
        <div className="space-y-6">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-6">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6 italic">{t('bill_details')}</h3>
            <div className="space-y-4">
               <div className="flex justify-between text-xs font-bold text-slate-500 uppercase"><span>{t('subtotal')}</span><span className="text-white font-mono">{currency} {summary.subTotal.toLocaleString()}</span></div>
               <div className="flex justify-between text-xs font-bold text-red-400 uppercase"><span>{t('discount')}</span><span>-{currency} {Number(expenses.discount || 0).toLocaleString()}</span></div>
               {transactionType === 'online' && <div className="flex justify-between text-xs font-bold text-blue-500 uppercase"><span>{t('courier')}</span><span>+{currency} {Number(expenses.courier || 0).toLocaleString()}</span></div>}
               <div className="h-px bg-white/5"></div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-500 uppercase">{t('total_payable')}</p>
                 <div className="text-4xl font-black italic text-white font-mono">{currency} {summary.totalSell.toLocaleString()}</div>
               </div>
               {summary.dueAmount > 0 && (
                 <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 animate-pulse">
                    <p className="text-[10px] font-black text-red-500 uppercase">{t('due_amount')}</p>
                    <p className="text-xl font-black text-red-500 font-mono">{currency} {summary.dueAmount.toLocaleString()}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Auto Receipt Modal --- */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div id="receipt-content" className="p-8 text-slate-900 bg-white">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Business Control Room</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Receipt • {lastSavedOrder.orderId}</p>
              </div>
              <div className="space-y-2 mb-6 text-xs font-bold">
                <div className="flex justify-between"><span>{t('date')}:</span><span>{orderDate}</span></div>
                <div className="flex justify-between"><span>{t('customer')}:</span><span>{customerInfo.name}</span></div>
              </div>
              <table className="w-full text-left text-[11px] mb-6">
                <thead className="border-b"><tr className="text-slate-400 uppercase font-black"><th className="py-2">Item</th><th className="py-2 text-right">Total</th></tr></thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50"><td className="py-2">{item.name} x {item.qty}</td><td className="py-2 text-right font-mono">{currency}{item.price * item.qty}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between font-black"><span>{t('total')}</span><span>{currency}{summary.totalSell}</span></div>
                {summary.dueAmount > 0 && <div className="flex justify-between text-xs font-bold text-red-600"><span>{t('due')}</span><span>{currency}{summary.dueAmount}</span></div>}
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-2">
              <button onClick={printReceipt} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"><Printer size={18} /> {t('print')}</button>
              <button onClick={() => setShowReceipt(false)} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}