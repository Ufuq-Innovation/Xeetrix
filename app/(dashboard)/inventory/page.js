"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Package, TrendingUp, DollarSign, Hash, Tag, User, CheckCircle } from "lucide-react";

export default function InventoryPage() {
  const context = useApp();
  const lang = context?.lang || "en";
  const currency = context?.currency || "৳"; 
  
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initialFormState = {
    name: "", stock: "", sku: "", costPrice: "", sellingPrice: "", description: "", category: "", source: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["inventory", lang],
    queryFn: async () => {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        return data.success ? data.products : [];
      } catch (error) {
        return [];
      }
    },
  });

  const inputs = useMemo(() => [
    { name: "name", label: t("product_name"), req: true, placeholder: t("product_name_placeholder") },
    { name: "category", label: t("category"), icon: Tag, placeholder: t("category_placeholder") },
    { name: "source", label: t("source_supplier"), icon: User, placeholder: t("source_placeholder") },
    { name: "stock", label: t("stock_quantity"), type: "number", req: true },
    { name: "costPrice", label: `${t("cost_price")} (${currency})`, type: "number" },
    { name: "sellingPrice", label: `${t("selling_price")} (${currency})`, type: "number" },
  ], [t, currency]);

  const statsData = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    const s = safeProducts.reduce((acc, item) => {
      const stock = Number(item?.stock) || 0;
      const cost = Number(item?.costPrice) || 0;
      acc.totalStock += stock;
      acc.totalValue += cost * stock;
      if (stock <= 0) acc.outOfStock += 1;
      return acc;
    }, { totalStock: 0, totalValue: 0, outOfStock: 0 });

    return [
      { label: t("total_stock"), val: s.totalStock, icon: Package, color: "blue" },
      { label: t("inventory_value"), val: `${currency} ${s.totalValue.toLocaleString()}`, icon: DollarSign, color: "green" },
      { label: t("total_products"), val: safeProducts.length, icon: Hash, color: "purple" },
      { label: t("out_of_stock"), val: s.outOfStock, icon: TrendingUp, color: "red", alert: s.outOfStock > 0 }
    ];
  }, [products, t, currency]);

  const productMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch("/api/inventory", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries(["inventory"]);
        setEditingId(null);
        setFormData(initialFormState);
        toast.success(t("success"));
      }
    },
  });

  if (!mounted) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">{t("inventory")}</h1>
          <p className="text-slate-400 mt-1">{t("manage_your_stock")}</p>
        </div>
        {editingId && (
          <button onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="text-red-500 font-bold uppercase text-[10px] tracking-widest border border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            {t("cancel")}
          </button>
        )}
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-[#11161D] p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1 overflow-hidden">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest truncate">{stat.label}</p>
                <p className={`text-xl md:text-2xl font-black truncate ${stat.alert ? 'text-red-500' : 'text-white'}`}>{stat.val}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl flex-shrink-0">
                <stat.icon className="text-slate-400" size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Form Section */}
      <form onSubmit={(e) => { e.preventDefault(); productMutation.mutate(editingId ? { ...formData, id: editingId } : formData); }} 
            className="bg-[#11161D] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <h3 className="text-lg font-black text-white uppercase italic mb-8 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Edit2 size={18} className="text-blue-500" /></div>
          {editingId ? t("edit") : t("add_new_product")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inputs.map((input) => (
            <div key={input.name} className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">{input.label}</label>
              <div className="relative">
                {input.icon && <input.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />}
                <input
                  type={input.type || "text"}
                  required={input.req}
                  placeholder={input.placeholder}
                  className={`w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${input.icon ? 'pl-12' : 'px-5'}`}
                  value={formData[input.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" disabled={productMutation.isPending} 
                className="mt-8 px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50">
          {productMutation.isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CheckCircle size={18} />}
          {editingId ? t("update") : t("add_to_stock")}
        </button>
      </form>

      {/* 4. Product Table */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead className="bg-white/5 text-[10px] uppercase text-slate-500 tracking-widest">
              <tr>
                {["product", "category", "source", "stock", "cost_price", "selling_price", "action"].map(k => (
                  <th key={k} className="p-5 font-bold">{t(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr><td colSpan="7" className="p-12 text-center text-slate-500 italic font-medium">{t("no_stock_available")}</td></tr>
              ) : (
                products.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5">
                      <div className="font-black text-slate-200 uppercase tracking-tight">{item?.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item?.sku}</div>
                    </td>
                    <td className="p-5"><span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-bold uppercase">{item?.category || "N/A"}</span></td>
                    <td className="p-5 text-xs text-slate-400 font-medium">{item?.source || "N/A"}</td>
                    <td className={`p-5 font-black text-lg ${Number(item?.stock) <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>{item?.stock}</td>
                    <td className="p-5 text-xs text-slate-500 font-mono">{currency} {Number(item?.costPrice || 0).toLocaleString()}</td>
                    <td className="p-5 font-black text-green-400 font-mono">{currency} {Number(item?.sellingPrice || 0).toLocaleString()}</td>
                    <td className="p-5 text-right">
                      <button onClick={() => { setEditingId(item._id); setFormData(item); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
                              className="text-yellow-500 bg-yellow-500/10 p-2.5 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}