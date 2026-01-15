"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Edit2, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Hash, 
  Tag, 
  User, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  PlusCircle,
  XCircle
} from "lucide-react";

export default function InventoryPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  // Mount check for SSR compatibility
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Currency handling - FINAL FIXED VERSION
  const lang = context?.lang || "en";
  const currency = useMemo(() => {
    const curr = context?.currency;
    
    if (!curr) return "৳";
    
    // Handle string format
    if (typeof curr === "string") return curr;
    
    // Handle object format
    if (typeof curr === "object" && curr !== null) {
      return curr.symbol || curr.code || curr.currency || "৳";
    }
    
    return "৳";
  }, [context?.currency]);

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState = {
    name: "", 
    stock: "0", 
    sku: "", 
    costPrice: "0", 
    sellingPrice: "0", 
    description: "", 
    category: "", 
    source: ""
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // Fetch products - FINAL VERSION
  const { 
    data: products = [], 
    isLoading, 
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/inventory");
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "API returned unsuccessful response");
        }
        
        return Array.isArray(data.products) ? data.products : [];
      } catch (error) {
        console.error("Inventory fetch error:", error);
        
        toast.error(t("fetch_error") || "Failed to load inventory", {
          description: error.message,
          duration: 5000,
          position: "top-right",
        });
        
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Form inputs configuration
  const inputs = useMemo(() => [
    { 
      name: "name", 
      label: t("product_name") || "Product Name", 
      required: true, 
      placeholder: t("product_name_placeholder") || "Enter product name",
      type: "text"
    },
    { 
      name: "category", 
      label: t("category") || "Category", 
      icon: Tag, 
      placeholder: t("category_placeholder") || "Electronics, Clothing, etc.",
      type: "text"
    },
    { 
      name: "source", 
      label: t("source_supplier") || "Supplier", 
      icon: User, 
      placeholder: t("source_placeholder") || "Supplier name",
      type: "text"
    },
    { 
      name: "stock", 
      label: t("stock_quantity") || "Stock Quantity", 
      type: "number", 
      required: true,
      min: "0",
      placeholder: "0"
    },
    { 
      name: "costPrice", 
      label: `${t("cost_price") || "Cost Price"} (${currency})`, 
      type: "number",
      min: "0",
      step: "0.01",
      placeholder: "0.00"
    },
    { 
      name: "sellingPrice", 
      label: `${t("selling_price") || "Selling Price"} (${currency})`, 
      type: "number",
      min: "0",
      step: "0.01",
      placeholder: "0.00"
    },
  ], [t, currency]);

  // Stats calculation - FINAL VERSION
  const statsData = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    
    const stats = safeProducts.reduce((acc, item) => {
      const stock = Math.max(0, Number(item?.stock) || 0);
      const cost = Math.max(0, Number(item?.costPrice) || 0);
      const selling = Math.max(0, Number(item?.sellingPrice) || 0);
      
      acc.totalStock += stock;
      acc.totalCostValue += cost * stock;
      acc.totalSellingValue += selling * stock;
      acc.profitPotential += (selling - cost) * stock;
      
      if (stock === 0) acc.outOfStock += 1;
      if (stock > 0 && stock <= 10) acc.lowStock += 1;
      
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
        label: t("total_products") || "Total Products", 
        value: safeProducts.length.toLocaleString(), 
        icon: Hash,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        trend: "total"
      },
      { 
        label: t("total_stock") || "Total Stock", 
        value: stats.totalStock.toLocaleString(), 
        icon: Package,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        trend: "stock"
      },
      { 
        label: t("inventory_value") || "Inventory Value", 
        value: `${currency} ${stats.totalCostValue.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`, 
        icon: DollarSign,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        trend: "value"
      },
      { 
        label: t("stock_alerts") || "Stock Alerts", 
        value: (stats.outOfStock + stats.lowStock).toString(), 
        icon: AlertTriangle,
        color: (stats.outOfStock + stats.lowStock) > 0 ? "text-red-400" : "text-slate-400",
        bgColor: (stats.outOfStock + stats.lowStock) > 0 ? "bg-red-500/10" : "bg-slate-500/10",
        alert: (stats.outOfStock + stats.lowStock) > 0,
        description: stats.outOfStock > 0 || stats.lowStock > 0 
          ? `${stats.outOfStock} out, ${stats.lowStock} low` 
          : "All good"
      }
    ];
  }, [products, t, currency]);

  // Create/Update mutation - FINAL VERSION
  const productMutation = useMutation({
    mutationFn: async (body) => {
      setIsSubmitting(true);
      
      try {
        const method = editingId ? "PUT" : "POST";
        const url = "/api/inventory";
        
        // Prepare data with proper number conversion
        const payload = {
          ...body,
          stock: Math.max(0, Number(body.stock) || 0),
          costPrice: Math.max(0, Number(body.costPrice) || 0),
          sellingPrice: Math.max(0, Number(body.sellingPrice) || 0),
        };
        
        // Remove empty fields for update
        if (editingId) {
          Object.keys(payload).forEach(key => {
            if (payload[key] === "" || payload[key] === undefined) {
              delete payload[key];
            }
          });
        }
        
        const response = await fetch(url, {
          method,
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Operation failed with status ${response.status}`);
        }
        
        return data;
      } catch (error) {
        console.error("Mutation error:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["inventory"]);
      
      // Reset form
      setEditingId(null);
      setFormData(initialFormState);
      
      // Show success toast
      const action = editingId ? "updated" : "added";
      const productName = variables.name || "Product";
      
      toast.success(`${productName} ${action} successfully`, {
        description: `Stock: ${variables.stock} | Price: ${currency}${variables.sellingPrice || 0}`,
        duration: 3000,
        position: "top-right",
      });
    },
    onError: (error) => {
      toast.error("Operation Failed", {
        description: error.message || "Please try again",
        duration: 4000,
        position: "top-right",
      });
    },
  });

  // Delete mutation - FINAL FIXED VERSION
  const deleteMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      try {
        // TRY BOTH METHODS FOR COMPATIBILITY
        let response;
        
        // Method 1: Try with body first (most common)
        try {
          response = await fetch("/api/inventory", {
            method: "DELETE",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          });
        } catch (bodyError) {
          // Method 2: Try with query parameter
          response = await fetch(`/api/inventory?id=${id}`, {
            method: "DELETE",
          });
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Delete failed");
        }
        
        return { id, name, data };
      } catch (error) {
        console.error("Delete error:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["inventory"]);
      
      // Show success toast with undo option
      toast.success("Product Deleted", {
        description: `${result.name} has been removed`,
        duration: 5000,
        position: "top-right",
        action: {
          label: "Undo",
          onClick: () => {
            toast.info("Undo would restore the product here", {
              duration: 3000,
            });
          },
        },
      });
    },
    onError: (error, variables) => {
      toast.error("Delete Failed", {
        description: `Could not delete ${variables.name}`,
        duration: 4000,
        position: "top-right",
      });
    },
  });

  // Handle form submission - FINAL VERSION
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Product name is required",
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    
    const stock = Number(formData.stock);
    if (isNaN(stock) || stock < 0) {
      toast.error("Validation Error", {
        description: "Please enter a valid stock quantity (0 or more)",
        duration: 3000,
        position: "top-right",
      });
      return;
    }
    
    // Prepare mutation data
    const mutationData = editingId 
      ? { ...formData, id: editingId }
      : formData;
    
    productMutation.mutate(mutationData);
  };

  // Handle edit button click
  const handleEdit = (product) => {
    if (!product?._id) return;
    
    setEditingId(product._id);
    setFormData({
      name: product.name || "",
      stock: product.stock?.toString() || "0",
      sku: product.sku || "",
      costPrice: product.costPrice?.toString() || "0",
      sellingPrice: product.sellingPrice?.toString() || "0",
      description: product.description || "",
      category: product.category || "",
      source: product.source || ""
    });
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    
    toast.info("Edit cancelled", {
      duration: 2000,
      position: "top-right",
    });
  };

  // Handle delete with confirmation - FINAL VERSION
  const handleDelete = (id, name) => {
    if (!id || !name) return;
    
    // Custom confirmation modal
    const deleteConfirmId = `delete-confirm-${id}`;
    
    toast.custom(
      (t) => (
        <div className="w-full max-w-md bg-gray-900 rounded-xl border border-red-500/30 p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg mt-1">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg mb-1">
                Delete Product
              </h3>
              
              <p className="text-slate-300 text-sm mb-4">
                Are you sure you want to delete <span className="font-semibold text-white">"{name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    toast.info("Deletion cancelled", { 
                      duration: 2000,
                      position: "top-right" 
                    });
                  }}
                  className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    deleteMutation.mutate({ id, name });
                  }}
                  disabled={deleteMutation.isLoading}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        id: deleteConfirmId,
        duration: 10000,
        position: "top-center",
      }
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle refresh data
  const handleRefresh = () => {
    refetch();
    toast.info("Refreshing inventory...", {
      duration: 2000,
      position: "top-right",
    });
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading application...</p>
        </div>
      </div>
    );
  }

  // Loading state for data
  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Loading Inventory</h2>
          <p className="text-slate-400">Please wait while we load your products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Inventory</h2>
          <p className="text-slate-300 mb-6">{error?.message || "An unknown error occurred"}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tighter leading-tight">
            {t("inventory") || "Inventory Management"}
          </h1>
          <p className="text-slate-400 mt-2">
            {t("manage_your_stock") || "Track, manage, and optimize your inventory"}
          </p>
        </div>
        
        <div className="flex gap-3">
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
            >
              <XCircle size={16} />
              Cancel Edit
            </button>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`bg-gray-900 p-5 rounded-2xl border ${stat.alert ? 'border-red-500/20' : 'border-gray-800'} hover:border-gray-700 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider truncate">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold truncate ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-slate-500 truncate">
                    {stat.description}
                  </p>
                )}
              </div>
              
              <div className={`ml-4 p-3 rounded-xl ${stat.bgColor} flex-shrink-0`}>
                <stat.icon size={22} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editingId ? (
              <>
                <Edit2 size={22} className="text-yellow-500" />
                Edit Product
              </>
            ) : (
              <>
                <PlusCircle size={22} className="text-blue-500" />
                Add New Product
              </>
            )}
          </h2>
          
          {editingId && (
            <div className="text-sm text-slate-500">
              Editing: <span className="font-mono text-blue-400">{editingId.substring(0, 8)}...</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inputs.map((input) => (
            <div key={input.name} className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                {input.label}
                {input.required && <span className="text-red-500">*</span>}
              </label>
              
              <div className="relative">
                {input.icon && (
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <input.icon size={18} className="text-slate-500" />
                  </div>
                )}
                
                <input
                  type={input.type}
                  name={input.name}
                  required={input.required}
                  min={input.min}
                  step={input.step}
                  placeholder={input.placeholder}
                  value={formData[input.name]}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 ${input.icon ? 'pl-12' : ''}`}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
          <div className="text-sm text-slate-500">
            {editingId ? "Update product details" : "Fill all required fields (*)"}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || productMutation.isLoading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting || productMutation.isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : editingId ? (
              <>
                <Edit2 size={18} />
                Update Product
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Add to Inventory
              </>
            )}
          </button>
        </div>
      </form>

      {/* Products Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Products List</h3>
            <p className="text-sm text-slate-500 mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} in inventory
            </p>
          </div>
          
          {products.length > 0 && (
            <button
              onClick={handleRefresh}
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh List
            </button>
          )}
        </div>
        
        {/* Table Container */}
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            // Empty State
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-800 rounded-2xl inline-block mb-6">
                  <Package size={48} className="text-slate-500" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">No Products Yet</h4>
                <p className="text-slate-400 mb-6">
                  Start by adding your first product to manage inventory
                </p>
                <button
                  onClick={() => {
                    const formElement = document.querySelector('form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <PlusCircle size={18} />
                  Add First Product
                </button>
              </div>
            </div>
          ) : (
            // Products Table
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-800/50">
                <tr>
                  {["product", "category", "supplier", "stock", "cost", "price", "actions"].map((column) => (
                    <th
                      key={column}
                      className="p-4 text-left text-xs font-semibold uppercase text-slate-400 tracking-wider"
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-800">
                {products.map((product) => {
                  const stock = Number(product.stock) || 0;
                  const isLowStock = stock > 0 && stock <= 10;
                  const isOutOfStock = stock === 0;
                  
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-800/30 transition-colors group"
                    >
                      {/* Product Name */}
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-white truncate max-w-[200px]">
                            {product.name || "Unnamed Product"}
                          </div>
                          {product.sku && (
                            <div className="text-xs text-slate-500 mt-1">
                              SKU: {product.sku}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Category */}
                      <td className="p-4">
                        {product.category ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">—</span>
                        )}
                      </td>
                      
                      {/* Supplier */}
                      <td className="p-4 text-slate-300">
                        {product.source || <span className="text-slate-500 italic">—</span>}
                      </td>
                      
                      {/* Stock */}
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${
                          isOutOfStock
                            ? 'bg-red-500/10 text-red-400'
                            : isLowStock
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {stock.toLocaleString()}
                          {isLowStock && <AlertTriangle size={12} className="ml-1" />}
                        </div>
                      </td>
                      
                      {/* Cost Price */}
                      <td className="p-4">
                        <div className="text-slate-300">
                          {currency} {(Number(product.costPrice) || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </td>
                      
                      {/* Selling Price */}
                      <td className="p-4">
                        <div className="font-bold text-green-400">
                          {currency} {(Number(product.sellingPrice) || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit product"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            disabled={deleteMutation.isLoading}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Delete product"
                          >
                            {deleteMutation.isLoading && deleteMutation.variables?.id === product._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Table Footer */}
        {products.length > 0 && (
          <div className="p-4 border-t border-gray-800 text-sm text-slate-500">
            <div className="flex items-center justify-between">
              <div>
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}