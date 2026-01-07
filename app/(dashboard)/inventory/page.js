"use client";

import React, { useState } from "react";
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
  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    sku: "",
    costPrice: "",
    sellingPrice: "",
    description: "",
    category: "",
    source: "",
  });

  /* ===================== FETCH ===================== */
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["inventory", lang],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      return data.success ? data.products : [];
    },
  });

  /* ===================== STATS ===================== */
  const totalStock = products.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const totalValue = products.reduce((sum, item) => {
    const cost = Number(item.costPrice) || 0;
    const stock = Number(item.stock) || 0;
    return sum + (cost * stock);
  }, 0);
  const outOfStock = products.filter(item => (Number(item.stock) || 0) <= 0).length;
  const totalProducts = products.length;

  /* ===================== ADD / UPDATE ===================== */
  const productMutation = useMutation({
    mutationFn: async (body) => {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/inventory", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onMutate: () => {
      toast.loading(editingId ? t("updating") : t("saving"), { id: "product" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      cancelEdit();
      toast.success(editingId ? t("success") : t("success"), { id: "product" });
    },
    onError: () => {
      toast.error(t("fetch_error"), { id: "product" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) {
      toast.error(t("fill_required_fields"));
      return;
    }
    productMutation.mutate(editingId ? { ...formData, id: editingId } : formData);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      stock: item.stock || "",
      sku: item.sku || "",
      costPrice: item.costPrice || "",
      sellingPrice: item.sellingPrice || "",
      description: item.description || "",
      category: item.category || "",
      source: item.source || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", stock: "", sku: "", costPrice: "", sellingPrice: "", description: "", category: "", source: "" });
  };

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tighter">
            {t("inventory")}
          </h1>
          <p className="text-slate-400 mt-1">{t("manage_your_stock")}</p>
        </div>
        
        {editingId && (
          <button
            onClick={cancelEdit}
            className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            {t("cancel")}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("total_stock"), val: totalStock, icon: Package, color: "blue" },
          { label: t("inventory_value"), val: `৳ ${totalValue.toLocaleString()}`, icon: DollarSign, color: "green" },
          { label: t("total_products"), val: totalProducts, icon: Hash, color: "purple" },
          { label: t("out_of_stock"), val: outOfStock, icon: TrendingUp, color: "red", alert: outOfStock > 0 }
        ].map((stat, i) => (
          <div key={i} className="bg-[#11161D] p-5 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.alert ? 'text-red-500' : 'text-white'}`}>{stat.val}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                <stat.icon className={`text-${stat.color}-500`} size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Form */}
      <div className="bg-[#11161D] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-3 rounded-2xl ${editingId ? 'bg-yellow-500/10' : 'bg-blue-500/10'}`}>
            <Edit2 className={editingId ? 'text-yellow-500' : 'text-blue-500'} size={24} />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic">
            {editingId ? t("edit_product") : t("add_new_product")}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("product_name")} *</label>
              <input
                required
                placeholder={t("product_name_placeholder")}
                className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("category")}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  placeholder={t("category_placeholder")}
                  className="w-full p-4 pl-12 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("source_supplier")}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  placeholder={t("source_placeholder")}
                  className="w-full p-4 pl-12 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("stock_quantity")} *</label>
              <input
                required type="number" min="0"
                className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("cost_price")} (৳)</label>
              <input
                type="number" step="0.01"
                className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("selling_price")} (৳)</label>
              <input
                type="number" step="0.01"
                className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-widest ml-1">{t("description")}</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-600" size={18} />
              <textarea
                placeholder={t("description_placeholder")}
                className="w-full p-4 pl-12 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none min-h-[100px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={productMutation.isPending}
            className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl font-black uppercase text-white shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {productMutation.isPending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckCircle size={20} />}
            {editingId ? t("update") : t("add_to_stock")}
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center gap-2 text-white uppercase italic">
            <Package className="text-blue-500" size={20} /> {t("all_products")}
          </h3>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold">
            {products.length} {t("products")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white/5">
              <tr className="text-[10px] uppercase text-slate-500 tracking-widest">
                <th className="p-5 text-left">{t("product")}</th>
                <th className="p-5 text-left">{t("category")}</th>
                <th className="p-5 text-left">{t("source")}</th>
                <th className="p-5 text-left">{t("stock")}</th>
                <th className="p-5 text-left">{t("cost_price")}</th>
                <th className="p-5 text-left">{t("selling_price")}</th>
                <th className="p-5 text-right">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-bold">{t("syncing_inventory")}</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-slate-400 italic">{t("no_stock_available")}</td></tr>
              ) : (
                products.map((item) => (
                  <tr key={item._id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="p-5">
                      <div className="font-black text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{item.description}</div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold uppercase">{item.category || "N/A"}</span>
                    </td>
                    <td className="p-5 text-xs text-slate-400 font-medium">{item.source || "N/A"}</td>
                    <td className="p-5">
                      <span className={`text-lg font-black ${Number(item.stock) <= 0 ? 'text-red-500' : Number(item.stock) <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400 font-mono text-xs">৳ {Number(item.costPrice || 0).toLocaleString()}</td>
                    <td className="p-5 text-green-400 font-black">৳ {Number(item.sellingPrice || 0).toLocaleString()}</td>
                    <td className="p-5 text-right">
                      <button onClick={() => startEdit(item)} className="p-2.5 bg-yellow-500/5 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-xl transition-all ml-auto flex items-center gap-2 text-xs font-bold uppercase">
                        <Edit2 size={14} /> {t("edit")}
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