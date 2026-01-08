"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, Plus, Search, Trash2, Eye, ShoppingCart, User, MapPin, CreditCard
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

  const customerSuggestions = useMemo(() => {
    if (!customerInfo.phone) return [];
    return orders.filter(o => o.customerPhone.includes(customerInfo.phone)).slice(0, 5);
  }, [customerInfo.phone, orders]);

  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    const dueAmount = totalSell - currentPaid;
    return { subTotal, totalSell, netProfit: (subTotal - disc) - totalCost, dueAmount, currentPaid };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = (order.customerName || '').toLowerCase().includes(filters.search.toLowerCase()) || (order.orderId || '').includes(filters.search);
      const matchType = filters.type === 'all' || order.transactionType === filters.type;
      return matchSearch && matchType;
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
      toast.success("Order Successful!");
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
          <div className="bg-[#11161D] rounded-[2.5rem] border border-white/5 p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
               <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5">
                <button onClick={() => setTransactionType("online")} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>ONLINE</button>
                <button onClick={() => setTransactionType("offline")} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>OFFLINE</button>
              </div>
              <div className="text-right font-mono text-sm font-black text-blue-500">{orderId}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500/50" placeholder="Phone Number" value={customerInfo.phone} onChange={e => { setCustomerInfo({...customerInfo, phone: e.target.value}); setShowCustSuggestions(true); }} />
                {showCustSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#1a2230] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {customerSuggestions.map((c, i) => (
                      <div key={i} onClick={() => { setCustomerInfo({ name: c.customerName, phone: c.customerPhone, address: c.customerAddress }); setShowCustSuggestions(false); }} className="px-5 py-3 hover:bg-blue-600 cursor-pointer border-b border-white/5 last:border-0 uppercase text-[10px] font-black">{c.customerName} - {c.customerPhone}</div>
                    ))}
                  </div>
                )}
              </div>
              <input className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500/50" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              
              {transactionType === "online" && (
                <>
                  <textarea className="w-full md:col-span-2 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[80px]" placeholder="Full Delivery Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Source</label>
                        <select value={orderSource} onChange={e => setOrderSource(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none">
                        <option value="Facebook">Facebook</option>
                        <option value="WhatsApp">WhatsApp</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Payment Status</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none">
                        <option value="COD">COD</option>
                        <option value="Paid">Fully Paid</option>
                        <option value="Partial">Partial Payment</option>
                        </select>
                    </div>
                  </div>
                  {paymentStatus === "Partial" && (
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-yellow-500 uppercase ml-1">Paid / Advance Amount</label>
                       <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-[#1a2230] border border-yellow-500/30 rounded-2xl text-sm font-black text-white outline-none" />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase ml-1 tracking-widest">Discount</label>
                <input type="number" className="w-full px-5 py-4 bg-[#1a2230] border border-red-500/10 rounded-2xl text-sm font-black" placeholder="0" value={expenses.discount} onChange={e => setExpenses({...expenses, discount: e.target.value})} />
              </div>
              {transactionType === "online" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase ml-1 tracking-widest">Courier</label>
                  <input type="number" className="w-full px-5 py-4 bg-[#1a2230] border border-blue-500/10 rounded-2xl text-sm font-black" placeholder="0" value={expenses.courier} onChange={e => setExpenses({...expenses, courier: e.target.value})} />
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
                  {inventory.map(item => <option key={item._id} value={item._id} disabled={item.stock <= 0}>{item.name} ({item.stock})</option>)}
                </select>
                <input type="number" className="w-24 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none" value={selectedProduct.qty} onChange={e => setSelectedProduct({...selectedProduct, qty: Number(e.target.value)})} />
                <button onClick={() => { if (!selectedProduct.id) return; setCart([...cart, {...selectedProduct}]); setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 }); }} className="px-10 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all active:scale-95"><Plus /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#1a2230] p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-black uppercase">{item.name} x {item.qty}</span>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => createOrderMutation.mutate({ 
                orderId, transactionType, orderSource, paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                customerName: customerInfo.name, customerPhone: customerInfo.phone, customerAddress: customerInfo.address,
                products: cart, discount: Number(expenses.discount), courier: Number(expenses.courier),
                totalSell: summary.totalSell, netProfit: summary.netProfit, dueAmount: summary.dueAmount, paidAmount: summary.currentPaid
              })} className="w-full mt-8 py-6 bg-blue-600 text-white rounded-3xl font-black uppercase shadow-2xl active:scale-95 transition-all">PROCESS ORDER</button>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="xl:col-span-1">
          <div className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-6 space-y-6">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic border-l-4 border-blue-500 pl-4">Live Invoice</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500"><span>Subtotal</span><span>{currency}{summary.subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-bold text-red-400"><span>Discount</span><span>-{currency}{(Number(expenses.discount) || 0).toLocaleString()}</span></div>
              {transactionType === "online" && <div className="flex justify-between text-xs font-bold text-blue-500"><span>Courier</span><span>+{currency}{(Number(expenses.courier) || 0).toLocaleString()}</span></div>}
              <div className="h-px bg-white/5 my-2"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Total Payable</p>
              <p className="text-4xl font-black italic text-white font-mono">{currency}{summary.totalSell.toLocaleString()}</p>
              <div className="pt-4 flex gap-4 border-t border-white/5">
                 <div className="flex-1"><p className="text-[9px] font-black text-emerald-500 uppercase">Paid</p><p className="text-lg font-black text-emerald-500">{currency}{summary.currentPaid.toLocaleString()}</p></div>
                 <div className="flex-1 text-right"><p className="text-[9px] font-black text-red-500 uppercase">Due</p><p className="text-lg font-black text-red-500">{currency}{summary.dueAmount.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}