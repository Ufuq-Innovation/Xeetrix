"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Package, TrendingUp, DollarSign, Hash, Tag, User, FileText } from "lucide-react";

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
      toast.loading(
        editingId ? t("updating_product") : t("adding_product"),
        { id: "product" }
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });

      setFormData({
        name: "",
        stock: "",
        sku: "",
        costPrice: "",
        sellingPrice: "",
        description: "",
        category: "",
        source: "",
      });
      setEditingId(null);

      toast.success(
        editingId ? t("product_updated") : t("product_added"),
        { id: "product" }
      );
    },

    onError: () => {
      toast.error(t("product_save_failed"), { id: "product" });
    },
  });

  /* ===================== SUBMIT ===================== */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) {
      toast.error(t("fill_required_fields"));
      return;
    }

    productMutation.mutate(
      editingId ? { ...formData, id: editingId } : formData
    );
  };

  /* ===================== EDIT ===================== */
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

  /* ===================== CANCEL EDIT ===================== */
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      stock: "",
      sku: "",
      costPrice: "",
      sellingPrice: "",
      description: "",
      category: "",
      source: "",
    });
  };

  /* ===================== UI ===================== */
  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white">
            {t("inventory")}
          </h1>
          <p className="text-slate-400 mt-2">{t("manage_your_stock")}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-sm border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#11161D] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{t("total_stock")}</p>
              <p className="text-2xl font-bold text-white mt-1">{totalStock}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Package className="text-blue-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-[#11161D] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{t("inventory_value")}</p>
              <p className="text-2xl font-bold text-white mt-1">
                ৳ {totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <DollarSign className="text-green-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-[#11161D] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{t("total_products")}</p>
              <p className="text-2xl font-bold text-white mt-1">{totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Hash className="text-purple-500" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-[#11161D] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{t("out_of_stock")}</p>
              <p className={`text-2xl font-bold mt-1 ${outOfStock > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {outOfStock}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <TrendingUp className="text-red-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      <div className="bg-[#11161D] p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-2 rounded-lg ${editingId ? 'bg-yellow-500/10' : 'bg-blue-500/10'}`}>
            <Edit2 className={editingId ? 'text-yellow-500' : 'text-blue-500'} size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">
            {editingId ? t("edit_product") : t("add_new_product")}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("product_name")} *
              </label>
              <input
                required
                placeholder={t("product_name_placeholder")}
                className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("category")}
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <input
                  placeholder={t("category_placeholder")}
                  className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("source_supplier")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <input
                  placeholder={t("source_placeholder")}
                  className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("stock_quantity")} *
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="0"
                className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("cost_price")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">৳</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("selling_price")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">৳</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              {t("description")}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-slate-500" size={18} />
              <textarea
                placeholder={t("description_placeholder")}
                className="w-full p-3.5 pl-10 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={productMutation.isPending}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold uppercase text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
          >
            {productMutation.isPending
              ? t("processing")
              : editingId
              ? t("update_product")
              : t("add_to_stock")}
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Package className="text-blue-500" size={20} />
              {t("all_products")}
            </h3>
            <span className="text-sm text-slate-500">
              {products.length} {t("products")}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white/5">
              <tr className="text-xs uppercase text-slate-500">
                <th className="p-4 text-left font-medium">{t("product")}</th>
                <th className="p-4 text-left font-medium">{t("category")}</th>
                <th className="p-4 text-left font-medium">{t("source")}</th>
                <th className="p-4 text-left font-medium">{t("stock")}</th>
                <th className="p-4 text-left font-medium">{t("cost_price")}</th>
                <th className="p-4 text-left font-medium">{t("selling_price")}</th>
                <th className="p-4 text-right font-medium">{t("action")}</th>
              </tr>
            </thead>
            
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="text-slate-500">{t("syncing_inventory")}</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-white/5 rounded-full">
                        <Package className="text-slate-600" size={24} />
                      </div>
                      <p className="text-slate-500">{t("no_stock_available")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr 
                    key={item._id} 
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {item.category ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.source ? (
                        <span className="text-slate-300">{item.source}</span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className={`font-bold text-lg ${
                        Number(item.stock) <= 0 
                          ? 'text-red-500' 
                          : Number(item.stock) <= 10 
                            ? 'text-yellow-500' 
                            : 'text-green-500'
                      }`}>
                        {item.stock}
                        {Number(item.stock) <= 10 && Number(item.stock) > 0 && (
                          <span className="text-xs text-yellow-500 ml-1">({t("low_stock")})</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400">
                        ৳ {Number(item.costPrice || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-green-400 font-medium">
                        ৳ {Number(item.sellingPrice || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => startEdit(item)}
                        className="px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-medium transition-colors flex items-center gap-2 ml-auto"
                      >
                        <Edit2 size={16} />
                        {t("edit")}
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