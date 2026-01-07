"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Package, TrendingUp, DollarSign, Hash, Tag, User, FileText, CheckCircle } from "lucide-react";

export default function InventoryPage() {
  const { lang } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: "", stock: "", sku: "", costPrice: "", sellingPrice: "", description: "", category: "", source: ""
  };
  const [formData, setFormData] = useState(initialFormState);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["inventory", lang],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      return data.success ? data.products : [];
    },
  });

  // --- Stats Calculation with proper keys ---
  const statsData = useMemo(() => {
    const s = products.reduce((acc, item) => {
      const stock = Number(item.stock) || 0;
      acc.totalStock += stock;
      acc.totalValue += (Number(item.costPrice) || 0) * stock;
      if (stock <= 0) acc.outOfStock += 1;
      return acc;
    }, { totalStock: 0, totalValue: 0, outOfStock: 0 });

    return [
      { label: t("total_stock"), val: s.totalStock, icon: Package, color: "blue" },
      { label: t("inventory_value"), val: `৳ ${s.totalValue.toLocaleString()}`, icon: DollarSign, color: "green" },
      { label: t("total_products"), val: products.length, icon: Hash, color: "purple" },
      { label: t("out_of_stock"), val: s.outOfStock, icon: TrendingUp, color: "red", alert: s.outOfStock > 0 }
    ];
  }, [products, t]);

  const productMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch("/api/inventory", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
      setEditingId(null);
      setFormData(initialFormState);
      toast.success(t("success"));
    },
    onError: () => toast.error(t("fetch_error"))
  });

  const inputs = [
    { name: "name", label: t("product_name"), req: true, placeholder: t("product_name_placeholder") },
    { name: "category", label: t("category"), icon: Tag, placeholder: t("category") },
    { name: "source", label: t("source_supplier"), icon: User, placeholder: t("source_placeholder") },
    { name: "stock", label: t("stock_quantity"), type: "number", req: true },
    { name: "costPrice", label: t("cost_price"), type: "number" },
    { name: "sellingPrice", label: t("selling_price"), type: "number" },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">{t("inventory")}</h1>
          <p className="text-slate-400">{t("manage_your_stock")}</p>
        </div>
        {editingId && (
          <button onClick={() => { setEditingId(null); setFormData(initialFormState); }} className="text-red-500 font-bold uppercase text-xs border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all">
            {t("cancel")}
          </button>
        )}
      </div>

      {/* Stats Grid - Mapping used for cleaner code */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-[#11161D] p-5 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-black mt-1 ${stat.alert ? 'text-red-500' : 'text-white'}`}>{stat.val}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                <stat.icon className={`text-${stat.color}-500`} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Section - Clean Key Usage */}
      <form onSubmit={(e) => { e.preventDefault(); productMutation.mutate(editingId ? { ...formData, id: editingId } : formData); }} className="bg-[#11161D] p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-black text-white uppercase italic mb-6 flex items-center gap-2">
          <Edit2 size={18} className="text-blue-500" /> {editingId ? t("edit") : t("add_new_product")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inputs.map((input) => (
            <div key={input.name} className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">{input.label} {input.req && "*"}</label>
              <div className="relative">
                {input.icon && <input.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />}
                <input
                  type={input.type || "text"}
                  required={input.req}
                  placeholder={input.placeholder}
                  className={`w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${input.icon ? 'pl-11' : 'px-4'}`}
                  value={formData[input.name]}
                  onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" disabled={productMutation.isPending} className="mt-8 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
          {productMutation.isPending ? t("saving") : (editingId ? t("update") : t("add_to_stock"))}
        </button>
      </form>

      {/* Table Section - Integrated 't' keys for headers and empty states */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-[10px] uppercase text-slate-500 tracking-widest">
              <tr>
                {["product", "category", "source", "stock", "cost_price", "selling_price", "action"].map(key => (
                  <th key={key} className={`p-5 font-bold ${key === 'action' ? 'text-right' : 'text-left'}`}>{t(key)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-slate-500 italic">{t("no_stock_available")}</td></tr>
              ) : (
                products.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 font-bold text-slate-200">{item.name}</td>
                    <td className="p-5 text-xs text-purple-400 uppercase">{item.category || "N/A"}</td>
                    <td className="p-5 text-xs text-slate-400">{item.source || "N/A"}</td>
                    <td className={`p-5 font-black ${Number(item.stock) <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>{item.stock}</td>
                    <td className="p-5 text-xs text-slate-500">৳{Number(item.costPrice).toLocaleString()}</td>
                    <td className="p-5 font-bold text-green-400">৳{Number(item.sellingPrice).toLocaleString()}</td>
                    <td className="p-5 text-right">
                      <button onClick={() => { setEditingId(item._id); setFormData(item); window.scrollTo(0,0); }} className="text-yellow-500 bg-yellow-500/10 p-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-all">
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