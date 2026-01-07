"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import html2canvas from "html2canvas"; // 'npm install html2canvas' লাগবে ডাউনলোড অপশনের জন্য
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

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
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
      // রিসিটে দেখানোর জন্য সব ডাটা সেট করা হচ্ছে
      setLastSavedOrder({ 
        orderId, orderDate, customerInfo, cart, summary, transactionType, paymentStatus 
      });
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

  // --- Print & Download Logic ---
  const handlePrint = () => {
    const content = document.getElementById("receipt-content").innerHTML;
    const win = window.open('', '', 'height=700,width=500');
    win.document.write(`<html><head><title>Receipt ${orderId}</title><script src="https://cdn.tailwindcss.com"></script></head><body>${content}</body></html>`);
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleDownload = async () => {
    const element = document.getElementById("receipt-content");
    const canvas = await html2canvas(element, { backgroundColor: "#ffffff" });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Receipt-${lastSavedOrder.orderId}.png`;
    link.click();
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#11161D] p-4 rounded-3xl border border-white/5">
        <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5">
          <button onClick={() => setTransactionType("online")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
            <Globe size={14} /> ONLINE
          </button>
          <button onClick={() => setTransactionType("offline")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
            <Store size={14} /> OFFLINE
          </button>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('order_id')}</p>
          <p className="font-mono text-sm font-black text-blue-500">{orderId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-2xl space-y-8">
            
            {/* Payment & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{t('payment_status')}</label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none">
                  <option value="COD">Cash On Delivery (COD)</option>
                  <option value="Paid">Fully Paid</option>
                  <option value="Partial">Partial Payment</option>
                </select>
              </div>
              {paymentStatus === "Partial" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-yellow-500 uppercase ml-1">{t('paid_amount')}</label>
                  <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-[#1a2230] border border-yellow-500/20 rounded-2xl text-sm font-black outline-none" />
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" placeholder={t('customer_name')} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" placeholder={t('phone_number')} value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
              
              {/* ডেলিভারি অ্যাড্রেস শুধুমাত্র অনলাইনে দেখাবে */}
              {transactionType === "online" && (
                <textarea className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px]" placeholder={t('delivery_address')} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
              )}
            </div>

            {/* Discount & Courier Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-400 uppercase ml-1">{t('discount_amount')}</label>
                  <input type="number" value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-black" placeholder="0.00" />
               </div>
               {transactionType === "online" && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase ml-1">{t('courier_charge')}</label>
                    <input type="number" value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-black" placeholder="0.00" />
                 </div>
               )}
            </div>

            {/* Product Selection (Same as before) */}
            <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <select className="flex-1 px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none" value={selectedProduct.id} onChange={e => {
                    const p = inventory.find(i => i._id === e.target.value);
                    if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                }}>
                  <option value="">{t('select_product')}</option>
                  {inventory.map(item => <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({item.stock})</option>)}
                </select>
                <input type="number" className="w-24 px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                <button onClick={() => {
                  if (!selectedProduct.id) return toast.error("Select Product");
                  setCart([...cart, {...selectedProduct}]);
                  setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
                }} className="px-8 bg-blue-600 rounded-2xl font-black text-white"><Plus /></button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1a2230] p-4 rounded-xl border border-white/5">
                    <span className="text-sm font-bold uppercase">{item.name} x {item.qty}</span>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => createOrderMutation.mutate({ 
                orderId, orderDate, transactionType, paymentStatus,
                customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier),
                totalSell: summary.totalSell, netProfit: summary.netProfit, dueAmount: summary.dueAmount
              })}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              {createOrderMutation.isPending ? "PROCESSING..." : t('confirm_order')}
            </button>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 h-fit sticky top-6">
          <h3 className="text-xs font-black text-blue-500 uppercase mb-6 tracking-[0.2em]">{t('bill_summary')}</h3>
          <div className="space-y-4 text-sm font-bold">
            <div className="flex justify-between text-slate-500"><span>SUBTOTAL</span><span>{currency} {summary.subTotal}</span></div>
            <div className="flex justify-between text-red-400"><span>DISCOUNT</span><span>-{currency} {expenses.discount || 0}</span></div>
            {transactionType === "online" && <div className="flex justify-between text-blue-400"><span>COURIER</span><span>+{currency} {expenses.courier || 0}</span></div>}
            <div className="h-px bg-white/5"></div>
            <div className="pt-2"><p className="text-[10px] text-slate-500 uppercase">Total Payable</p><p className="text-4xl font-black italic">{currency} {summary.totalSell}</p></div>
          </div>
        </div>
      </div>

      {/* --- Receipt Modal with Download & Customer Details --- */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            {/* Downloadable Area */}
            <div id="receipt-content" className="p-10 text-slate-900 bg-white">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Business Control Room</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lastSavedOrder.orderId} • {lastSavedOrder.orderDate}</p>
              </div>

              {/* কাস্টমার ডিটেইলস */}
              <div className="mb-6 space-y-1 text-xs">
                <p className="font-black text-[10px] text-slate-400 uppercase mb-2">Customer Details</p>
                <p><strong>Name:</strong> {lastSavedOrder.customerInfo.name || "N/A"}</p>
                <p><strong>Phone:</strong> {lastSavedOrder.customerInfo.phone || "N/A"}</p>
                {lastSavedOrder.transactionType === "online" && (
                  <p><strong>Address:</strong> {lastSavedOrder.customerInfo.address || "N/A"}</p>
                )}
              </div>

              <table className="w-full text-left text-[11px] mb-6">
                <thead className="border-b"><tr className="text-slate-400 uppercase"><th className="pb-2">Items</th><th className="pb-2 text-right">Total</th></tr></thead>
                <tbody>
                  {lastSavedOrder.cart.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50 font-bold"><td className="py-2">{item.name} x {item.qty}</td><td className="py-2 text-right">{currency}{item.price * item.qty}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between font-black text-lg"><span>Total</span><span>{currency}{lastSavedOrder.summary.totalSell}</span></div>
                <div className="flex justify-between text-xs font-bold text-slate-500"><span>Paid</span><span>{currency}{lastSavedOrder.summary.currentPaid}</span></div>
                {lastSavedOrder.summary.dueAmount > 0 && <div className="flex justify-between text-xs font-black text-red-600"><span>Due</span><span>{currency}{lastSavedOrder.summary.dueAmount}</span></div>}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 flex gap-2">
              <button onClick={handlePrint} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all"><Printer size={18} /> PRINT</button>
              <button onClick={handleDownload} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Download size={18} /> DOWNLOAD</button>
              <button onClick={() => setShowReceipt(false)} className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-red-500"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}