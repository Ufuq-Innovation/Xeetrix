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

  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online");
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [paidAmount, setPaidAmount] = useState(""); // পার্শিয়াল পেমেন্টের জন্য
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);

  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
  }, [transactionType]);

  const currency = useMemo(() => (typeof context?.currency === 'object' ? context?.currency.symbol : context?.currency) || "৳", [context?.currency]);

  // Calculations
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    
    // পেমেন্ট অনুযায়ী ডিউ ক্যালকুলেশন
    const currentPaid = paymentStatus === "Paid" ? totalSell : (Number(paidAmount) || 0);
    const dueAmount = totalSell - currentPaid;

    return { subTotal, totalSell, netProfit: (subTotal - disc) - totalCost, dueAmount, currentPaid };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      // API call logic
      return { success: true, order: newOrder }; 
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      setLastSavedOrder(data.order);
      setShowReceipt(true);
      // Reset Form
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setExpenses({ discount: '', courier: '' });
      setPaidAmount("");
      setOrderId(generateId(transactionType));
      toast.success(t('order_successful_alert'));
    }
  });

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-modal");
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50,top=50,width=800,height=900');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body onload="window.print();window.close()">${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Transaction Toggle - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-[#11161D] rounded-2xl border border-white/5 w-full sm:w-auto">
          <button onClick={() => setTransactionType("online")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>
            <Globe size={14} /> {t('online').toUpperCase()}
          </button>
          <button onClick={() => setTransactionType("offline")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>
            <Store size={14} /> {t('offline').toUpperCase()}
          </button>
        </div>
        <div className="font-mono text-xs font-bold text-slate-500 bg-[#11161D] px-4 py-2 rounded-lg border border-white/5">ID: {orderId}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11161D] rounded-[2rem] border border-white/5 p-6 md:p-10 shadow-2xl">
            <div className="space-y-8">
              
              {/* Payment Status & Source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase ml-1">{t('payment_status')}</label>
                  <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none">
                    <option value="COD">{t('cod')}</option>
                    <option value="Paid">{t('paid')}</option>
                    <option value="Partial">{t('partial')}</option>
                  </select>
                </div>
                {paymentStatus === "Partial" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-yellow-500 uppercase ml-1">{t('paid_amount')}</label>
                    <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-[#1a2230] border border-yellow-500/20 rounded-2xl text-sm font-black text-white outline-none" />
                  </div>
                )}
              </div>

              {/* Customer Fields - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('customer_name')}</label>
                  <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" placeholder="John Doe" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('phone_number')}</label>
                  <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" placeholder="017XXXXXXXX" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('address')}</label>
                  <textarea className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[100px]" placeholder="Full Address..." value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                </div>
              </div>

              {/* Cart Section would go here (same as your logic) */}

              <button 
                onClick={() => createOrderMutation.mutate({ 
                  orderId, orderDate, customerInfo, cart, summary, paymentStatus, transactionType 
                })}
                disabled={cart.length === 0}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
              >
                {t('confirm_order')}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Bill Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 sticky top-8 space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('bill_summary')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold"><span>{t('subtotal')}</span><span className="font-mono text-white">{currency} {summary.subTotal}</span></div>
              <div className="flex justify-between text-xs font-bold text-red-400"><span>{t('discount')}</span><span className="font-mono">-{currency} {expenses.discount || 0}</span></div>
              <div className="h-px bg-white/5"></div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase">{t('total')}</span>
                <span className="text-3xl font-black text-white font-mono">{currency} {summary.totalSell}</span>
              </div>
              {summary.dueAmount > 0 && (
                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-500 uppercase">{t('due_amount')}</span>
                    <span className="text-xl font-black text-red-500 font-mono">{currency} {summary.dueAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Auto Receipt Modal --- */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div id="receipt-modal" className="p-8 text-slate-900">
              <div className="text-center border-b-2 border-dashed pb-6 mb-6">
                <h2 className="text-2xl font-black italic uppercase">Business Control Room</h2>
                <p className="text-[10px] font-bold text-slate-400">Order ID: {lastSavedOrder.orderId}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-bold mb-6">
                <div><p className="text-slate-400 uppercase text-[9px]">{t('customer')}</p><p>{lastSavedOrder.customerInfo.name}</p></div>
                <div className="text-right"><p className="text-slate-400 uppercase text-[9px]">{t('date')}</p><p>{lastSavedOrder.orderDate}</p></div>
              </div>

              <table className="w-full text-left text-xs mb-6">
                <thead><tr className="border-b text-slate-400 uppercase"><th className="pb-2">Item</th><th className="pb-2 text-right">Price</th></tr></thead>
                <tbody>
                  {lastSavedOrder.cart.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50"><td className="py-3 font-bold">{item.name} x {item.qty}</td><td className="py-3 text-right font-mono">{currency} {item.price * item.qty}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-2">
                <div className="flex justify-between font-black text-lg"><span>{t('total')}</span><span>{currency} {lastSavedOrder.summary.totalSell}</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-500"><span>{t('paid')}</span><span>{currency} {lastSavedOrder.summary.currentPaid}</span></div>
                {lastSavedOrder.summary.dueAmount > 0 && <div className="flex justify-between text-xs font-black text-red-600"><span>{t('due')}</span><span>{currency} {lastSavedOrder.summary.dueAmount}</span></div>}
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                <Printer size={18} /> {t('print')}
              </button>
              <button onClick={() => setShowReceipt(false)} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}