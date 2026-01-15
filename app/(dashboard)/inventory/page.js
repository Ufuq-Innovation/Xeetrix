"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Package, TrendingUp, DollarSign, Hash, Tag, User, Trash2, CheckCircle } from "lucide-react";

export default function InventoryPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // ১. মাউন্ট চেক
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ২. কারেন্সি অবজেক্ট হ্যান্ডলিং (Error #31 Fix - Enhanced)
  const lang = context?.lang || "en";
  const currency = useMemo(() => {
    const curr = context?.currency;
    
    // ব্যাকএন্ড কম্প্যাটিবিলিটির জন্য: কারেন্সি একটি স্ট্রিং হতে পারে
    if (typeof curr === 'string') {
      return curr;
    }
    
    // যদি কারেন্সি একটি অবজেক্ট হয়
    if (curr && typeof curr === 'object') {
      // বিভিন্ন ফরম্যাট সাপোর্ট
      if (curr.symbol) return curr.symbol;
      if (curr.code) return curr.code;
      if (curr.currency) return curr.currency;
    }
    
    // ডিফল্ট
    return "৳";
  }, [context?.currency]);

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState = {
    name: "", 
    stock: "", 
    sku: "", 
    costPrice: "", 
    sellingPrice: "", 
    description: "", 
    category: "", 
    source: ""
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // ৩. ডাটা ফেচিং (Improved with error handling)
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["inventory", lang],
    queryFn: async () => {
      try {
        const res = await fetch("/api/inventory");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch inventory");
        }
        
        return data.products || [];
      } catch (error) {
        console.error("Inventory fetch error:", error);
        toast.error(t("fetch_error") || "Failed to load inventory");
        return [];
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Form inputs configuration
  const inputs = useMemo(() => [
    { 
      name: "name", 
      label: t("product_name"), 
      required: true, 
      placeholder: t("product_name_placeholder") || "Enter product name" 
    },
    { 
      name: "category", 
      label: t("category"), 
      icon: Tag, 
      placeholder: t("category_placeholder") || "Category" 
    },
    { 
      name: "source", 
      label: t("source_supplier"), 
      icon: User, 
      placeholder: t("source_placeholder") || "Supplier name" 
    },
    { 
      name: "stock", 
      label: t("stock_quantity"), 
      type: "number", 
      required: true,
      min: 0 
    },
    { 
      name: "costPrice", 
      label: `${t("cost_price") || "Cost Price"} (${currency})`, 
      type: "number",
      min: 0,
      step: 0.01
    },
    { 
      name: "sellingPrice", 
      label: `${t("selling_price") || "Selling Price"} (${currency})`, 
      type: "number",
      min: 0,
      step: 0.01
    },
  ], [t, currency]);

  // Stats calculation
  const statsData = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    
    const stats = safeProducts.reduce((acc, item) => {
      const stock = Number(item?.stock) || 0;
      const cost = Number(item?.costPrice) || 0;
      const selling = Number(item?.sellingPrice) || 0;
      
      acc.totalStock += stock;
      acc.totalCostValue += cost * stock;
      acc.totalSellingValue += selling * stock;
      acc.profitPotential += (selling - cost) * stock;
      
      if (stock <= 0) acc.outOfStock += 1;
      if (stock <= 10 && stock > 0) acc.lowStock += 1;
      
      return acc;
    }, { 
      totalStock: 0, 
      totalCostValue: 0, 
      totalSellingValue: 0,
      profitPotential: 0,
      outOfStock: 0,
      lowStock: 0 
    });

    return [
      { 
        label: t("total_products"), 
        val: safeProducts.length, 
        icon: Hash,
        trend: "total"
      },
      { 
        label: t("total_stock"), 
        val: stats.totalStock.toLocaleString(), 
        icon: Package,
        trend: "stock"
      },
      { 
        label: t("inventory_value"), 
        val: `${currency} ${stats.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
        icon: DollarSign,
        trend: "value"
      },
      { 
        label: t("out_of_stock"), 
        val: stats.outOfStock, 
        icon: TrendingUp, 
        alert: stats.outOfStock > 0,
        className: stats.outOfStock > 0 ? 'text-red-500' : 'text-slate-400'
      }
    ];
  }, [products, t, currency]);

  // Create/Update mutation
  const productMutation = useMutation({
    mutationFn: async (body) => {
      setIsSubmitting(true);
      try {
        const endpoint = editingId ? "/api/inventory" : "/api/inventory";
        const method = editingId ? "PUT" : "POST";
        
        const res = await fetch(endpoint, {
          method,
          headers: { 
            "Content-Type": "application/json",
            "Accept-Language": lang 
          },
          body: JSON.stringify({
            ...body,
            // Ensure numeric fields are converted
            stock: Number(body.stock) || 0,
            costPrice: Number(body.costPrice) || 0,
            sellingPrice: Number(body.sellingPrice) || 0,
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to ${editingId ? 'update' : 'create'} product`);
        }
        
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries(["inventory"]);
        setEditingId(null);
        setFormData(initialFormState);
        toast.success(editingId ? t("update_success") : t("add_success"));
      }
    },
    onError: (error) => {
      toast.error(error.message || t("operation_failed"));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/inventory?id=${id}`, {
        method: "DELETE",
        headers: { "Accept-Language": lang },
      });
      return res.json();
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries(["inventory"]);
        toast.success(t("delete_success"));
      } else {
        toast.error(res.message || t("delete_failed"));
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error(t("product_name_required"));
      return;
    }
    
    if (formData.stock === "" || Number(formData.stock) < 0) {
      toast.error(t("valid_stock_required"));
      return;
    }
    
    productMutation.mutate(
      editingId ? { ...formData, id: editingId } : formData
    );
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      stock: item.stock || "",
      sku: item.sku || "",
      costPrice: item.costPrice || "",
      sellingPrice: item.sellingPrice || "",
      description: item.description || "",
      category: item.category || "",
      source: item.source || ""
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(t("confirm_delete") || `Delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-10 text-white">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <span>{t("loading") || "Loading inventory..."}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-white">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-red-500 font-bold text-lg mb-2">
            {t("error_loading") || "Error loading inventory"}
          </h3>
          <p className="text-slate-400 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {t("retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">
            {t("inventory") || "Inventory"}
          </h1>
          <p className="text-slate-400 mt-1">
            {t("manage_your_stock") || "Manage your stock and products"}
          </p>
        </div>
        {editingId && (
          <div className="flex gap-2">
            <button 
              onClick={handleCancel}
              className="text-red-500 font-bold uppercase text-[10px] tracking-widest border border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"
            >
              {t("cancel") || "Cancel"}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <div 
            key={i} 
            className="bg-[#11161D] p-5 rounded-2xl border border-white/5 shadow-xl hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1 overflow-hidden flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest truncate">
                  {stat.label}
                </p>
                <p className={`text-xl md:text-2xl font-black truncate ${stat.className || 'text-white'}`}>
                  {stat.val}
                </p>
              </div>
              {stat.icon && (
                <div className="ml-4 p-2 bg-white/5 rounded-xl">
                  <stat.icon size={20} className="text-slate-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form 
        onSubmit={handleSubmit}
        className="bg-[#11161D] p-6 rounded-2xl border border-white/5 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-white mb-6">
          {editingId ? t("edit_product") || "Edit Product" : t("add_new_product") || "Add New Product"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inputs.map((input) => (
            <div key={input.name} className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">
                {input.label}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={input.type || "text"}
                required={input.required}
                min={input.min}
                step={input.step}
                className="w-full p-4 bg-[#1a2230] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                placeholder={input.placeholder}
                value={formData[input.name] || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [input.name]: e.target.value 
                })}
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-8">
          <button 
            type="submit" 
            disabled={productMutation.isPending || isSubmitting}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {productMutation.isPending || isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>{t("processing") || "Processing..."}</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>{editingId ? t("update") : t("add_to_stock")}</span>
              </>
            )}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold uppercase tracking-widest transition-all"
            >
              {t("cancel") || "Cancel"}
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-white/5">
              <tr>
                {["product", "category", "source", "stock", "cost_price", "selling_price", "actions"].map(key => (
                  <th 
                    key={key} 
                    className="p-5 text-left text-[10px] uppercase text-slate-500 tracking-widest font-bold"
                  >
                    {t(key) || key.replace('_', ' ').toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">{t("no_products") || "No products found"}</p>
                    <p className="text-sm mt-2">{t("add_first_product") || "Add your first product to get started"}</p>
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr 
                    key={item._id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-5">
                      <div>
                        <div className="font-black text-slate-200 uppercase">
                          {item?.name || "N/A"}
                        </div>
                        {item?.sku && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      {item?.category ? (
                        <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium">
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="p-5 text-slate-400">
                      {item?.source || "N/A"}
                    </td>
                    <td className="p-5">
                      <div className={`font-bold ${Number(item?.stock) <= 0 ? 'text-red-500' : Number(item?.stock) <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {item?.stock}
                        {Number(item?.stock) <= 10 && item?.stock > 0 && (
                          <span className="text-[10px] text-yellow-500/70 ml-2">(Low)</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-slate-400">
                      {currency} {Number(item?.costPrice || 0).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </td>
                    <td className="p-5 font-bold text-green-400">
                      {currency} {Number(item?.sellingPrice || 0).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500/20 transition-all"
                          title={t("edit") || "Edit"}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id, item.name)}
                          disabled={deleteMutation.isPending}
                          className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                          title={t("delete") || "Delete"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {products.length > 0 && (
          <div className="p-5 border-t border-white/5 text-sm text-slate-500">
            Showing {products.length} products
          </div>
        )}
      </div>
    </div>
  );
}