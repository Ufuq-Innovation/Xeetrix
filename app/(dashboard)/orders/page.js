"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, ShoppingBag, User, Phone, 
  Package, ChevronRight, Clock, X, Plus 
} from "lucide-react";

export default function UnifiedOrderPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currency = useMemo(() => {
    const curr = context?.currency;
    return (typeof curr === 'object' ? curr.symbol : curr) || "৳";
  }, [context?.currency]);

  // States
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [expenses, setExpenses] = useState({ discount: 0, courier: 100 });

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

  // Cart Logic with Strict Stock Control
  const addToCart = () => {
    if (!selectedProduct.id) return toast.error(t('select_a_product'));
    
    const existingItem = cart.find(item => item.id === selectedProduct.id);
    const currentQtyInCart = existingItem ? existingItem.qty : 0;
    const totalRequestedQty = currentQtyInCart + selectedProduct.qty;

    if (totalRequestedQty > selectedProduct.stock) {
      return toast.error(`${t('stock')}: ${selectedProduct.stock}. ${t('insufficient_stock_alert')}`);
    }

    if (existingItem) {
      setCart(cart.map(item => item.id === selectedProduct.id 
        ? { ...item, qty: totalRequestedQty } 
        : item));
    } else {
      setCart([...cart, { ...selectedProduct }]);
    }
    setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  };

  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const totalCost = cart.reduce((acc, item) => acc + (item.cost * item.qty), 0);
    const totalSell = subTotal - expenses.discount;
    const netProfit = totalSell - totalCost - expenses.courier;
    return { subTotal, totalSell, netProfit };
  }, [cart, expenses]);

  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      toast.success(t('order_successful_alert'));
    }
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Header - Fixed Typography */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black uppercase italic text-white tracking-tighter">
              {t('order_management')}
            </h1>
            <p className="hidden md:block text-slate-500 text-xs font-medium">{t('manage_orders_and_customers')}</p>
          </div>
        </div>
        <div className="bg-[#11161D] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
          <div className="text-right border-r border-white/10 pr-3">
            <p className="text-[8px] font-bold text-slate-500 uppercase">{t('total_orders')}</p>
            <p className="text-lg font-black text-white">{orders.length}</p>
          </div>
          <Clock className="text-blue-500 opacity-50" size={18} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#11161D] rounded-[2rem] border border-white/5 p-5 md:p-10 shadow-2xl">
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('customer_name')}</label>
                  <input className="w-full px-5 py-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/40" 
                    placeholder={t('customer_name')} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('phone_number')}</label>
                  <input className="w-full px-5 py-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/40" 
                    placeholder="01XXXXXXXXX" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                </div>
              </div>

              {/* Multi-Product Selector */}
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="md:col-span-1 w-full px-4 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none"
                    value={selectedProduct.id} 
                    onChange={e => {
                      const p = inventory.find(i => i._id === e.target.value);
                      if(p) setSelectedProduct({ id: p._id, name: p.name, qty: 1, stock: p.stock, price: p.sellingPrice, cost: p.costPrice });
                    }}>
                    <option value="">{t('select_a_product')}</option>
                    {inventory.map(item => (
                      <option key={item._id} value={item._id} disabled={item.stock <= 0}>
                        {item.name} ({t('stock')}: {item.stock})
                      </option>
                    ))}
                  </select>
                  
                  <input type="number" 
                    className="px-4 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none" 
                    placeholder={t('quantity')}
                    value={selectedProduct.qty} 
                    onChange={e => {
                      const val = Math.min(Number(e.target.value), selectedProduct.stock);
                      setSelectedProduct({...selectedProduct, qty: val});
                    }}
                  />
                  
                  <button type="button" onClick={addToCart} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-3 px-6 transition-all flex items-center justify-center gap-2">
                    <Plus size={18} /> {t('add_to_cart') || 'Add'} 
                  </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="text-sm">
                        <span className="text-white font-bold">{item.name}</span>
                        <span className="ml-2 text-slate-500">x{item.qty}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-blue-400">{currency} {item.price * item.qty}</span>
                        <button type="button" onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Expenses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('discount')}</label>
                  <input type="number" className="w-full px-5 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-white" 
                    value={expenses.discount} onChange={e => setExpenses({...expenses, discount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{t('courier_cost')}</label>
                  <input type="number" className="w-full px-5 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-white" 
                    value={expenses.courier} onChange={e => setExpenses({...expenses, courier: Number(e.target.value)})} />
                </div>
              </div>

              <button 
                onClick={() => {
                  if(cart.length === 0) return toast.error(t('cart_empty_alert'));
                  createOrderMutation.mutate({ customerName: customerInfo.name, customerPhone: customerInfo.phone, products: cart, ...expenses, netProfit: summary.netProfit });
                }}
                disabled={createOrderMutation.isPending} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {createOrderMutation.isPending ? t('syncing') : t('confirm_order')}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-[#11161D] to-[#1a2230] p-8 rounded-[2rem] border border-white/5 shadow-2xl h-fit sticky top-6">
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6 italic">{t('order_preview')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 uppercase font-bold">{t('total_sales') || t('subtotal')}</span>
              <span className="text-white font-mono">{currency} {summary.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-red-400">
              <span className="text-slate-500 uppercase font-bold">{t('discount')}</span>
              <span>-{currency} {expenses.discount.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/5 my-2"></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{t('net_profit')}</p>
              <div className={`text-4xl font-black italic tracking-tighter ${summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {currency} {summary.netProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}