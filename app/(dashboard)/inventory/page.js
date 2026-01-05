"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Hook for real-time translation
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function InventoryPage() {
  const { lang } = useApp();
  const { t } = useTranslation('common'); // Professional i18n hook
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', stock: '', sku: '', costPrice: '', sellingPrice: '',
    description: '', category: '', source: '' 
  });

  /**
   * 1. Fetch Inventory Data using TanStack Query.
   * Linked to 'lang' to ensure reactivity across different locales.
   */
  const { data: products = [], isLoading: fetching } = useQuery({
    queryKey: ['inventory', lang],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    }
  });

  /**
   * 2. Mutation for Adding or Updating Product.
   * Invalidates relevant queries on success to maintain data integrity.
   */
  const productMutation = useMutation({
    mutationFn: async (bodyData) => {
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/inventory', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error('Failed to save product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['dashboardStats']);
      
      // Reset form and editing state
      setFormData({ name: '', stock: '', sku: '', costPrice: '', sellingPrice: '', description: '', category: '', source: '' });
      setEditingId(null);
      alert(editingId ? t('product_updated_alert') : t('product_added_alert'));
    }
  });

  /**
   * Handle Form Submission for both Create and Update operations.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) return;
    
    const bodyData = editingId ? { ...formData, id: editingId } : formData;
    productMutation.mutate(bodyData);
  };

  /**
   * Pre-fill the form with existing product data for editing.
   */
  const startEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name, sku: product.sku || '', stock: product.stock,
      costPrice: product.costPrice || '', sellingPrice: product.sellingPrice || '',
      description: product.description || '', category: product.category || '', source: product.source || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 p-4 md:p-0">
      <header>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
          {t('inventory')}
        </h1>
      </header>

      {/* Product Entry Form - Fully Localized */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#11161D] p-6 rounded-4xl border border-white/5 shadow-2xl">
        <input type="text" placeholder={t('product_name_placeholder')} required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="text" placeholder={t('category')} className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
        <input type="text" placeholder={t('source_supplier')} className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
        <input type="number" placeholder={t('stock_quantity')} required className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
        <input type="number" placeholder={t('cost_price')} className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: e.target.value})} />
        <input type="number" placeholder={t('selling_price')} className="bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} />
        <textarea placeholder={t('description')} className="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-600 h-14.5" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        <button type="submit" disabled={productMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl transition-all h-14.5 shadow-lg shadow-blue-900/20">
          {productMutation.isPending ? t('processing') : editingId ? t('update_product') : t('add_to_stock')}
        </button>
      </form>

      {/* Inventory Management Table */}
      <div className="bg-[#11161D] rounded-4xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 uppercase font-black border-b border-white/5 bg-white/2">
              <tr>
                <th className="p-6">{t('product')}</th>
                <th className="p-6">{t('category_source')}</th>
                <th className="p-6">{t('stock')}</th>
                <th className="p-6 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {fetching ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 animate-pulse uppercase text-xs tracking-widest">{t('syncing_inventory')}</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-slate-500 italic uppercase text-xs font-bold">{t('no_stock_available')}</td></tr>
              ) : products.map((item) => (
                <tr key={item._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="p-6 font-bold">
                    <div className="text-white">{item.name}</div>
                    <div className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">
                      {t('cp')}: ৳{item.costPrice} | {t('sp')}: ৳{item.sellingPrice}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-slate-300 text-xs font-medium">{item.category || 'N/A'}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{item.source || 'N/A'}</div>
                  </td>
                  <td className="p-6 text-2xl font-black text-blue-500">{item.stock}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => startEdit(item)} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-blue-500 font-bold uppercase text-[10px] transition-all border border-white/5">
                      {t('edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}