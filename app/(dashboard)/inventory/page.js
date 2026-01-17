"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Edit2, Package, TrendingUp, DollarSign, Hash, Tag, User, 
  Trash2, CheckCircle, AlertTriangle, Loader2, RefreshCw, 
  PlusCircle, XCircle, Save, ArrowUp
} from "lucide-react";

export default function InventoryPage() {
  const context = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Currency handling
  const lang = context?.lang || "en";
  const currency = useMemo(() => {
    const curr = context?.currency;
    if (typeof curr === 'string') return curr;
    if (curr && typeof curr === 'object') {
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

  // Fetch products
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
          throw new Error(`HTTP ${response.status}: Failed to fetch`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "API error");
        }
        
        return Array.isArray(data.products) ? data.products : [];
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load inventory", {
          description: error.message,
          duration: 4000,
        });
        return [];
      }
    },
    retry: 1,
  });

  // Form inputs
  const inputs = useMemo(() => [
    { 
      name: "name", 
      label: t("product_name") || "Product Name", 
      required: true, 
      placeholder: "Enter product name",
      type: "text"
    },
    { 
      name: "category", 
      label: t("category") || "Category", 
      placeholder: "Electronics, Clothing, etc.",
      type: "text"
    },
    { 
      name: "source", 
      label: t("source_supplier") || "Supplier", 
      placeholder: "Supplier name",
      type: "text"
    },
    { 
      name: "stock", 
      label: t("stock_quantity") || "Stock", 
      type: "number", 
      required: true,
      min: "0",
      placeholder: "0"
    },
    { 
      name: "costPrice", 
      label: `${t("cost_price") || "Cost"} (${currency})`, 
      type: "number",
      min: "0",
      step: "0.01",
      placeholder: "0.00"
    },
    { 
      name: "sellingPrice", 
      label: `${t("selling_price") || "Price"} (${currency})`, 
      type: "number",
      min: "0",
      step: "0.01",
      placeholder: "0.00"
    },
  ], [t, currency]);

  // Stats calculation
  const statsData = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    
    const stats = safeProducts.reduce((acc, item) => {
      const stock = Number(item?.stock) || 0;
      const cost = Number(item?.costPrice) || 0;
      
      acc.totalStock += stock;
      acc.totalValue += cost * stock;
      if (stock <= 0) acc.outOfStock += 1;
      if (stock > 0 && stock <= 10) acc.lowStock += 1;
      
      return acc;
    }, { 
      totalStock: 0, 
      totalValue: 0, 
      outOfStock: 0, 
      lowStock: 0 
    });

    return [
      { 
        label: "Total Products", 
        value: safeProducts.length, 
        icon: Hash,
        color: "text-blue-400"
      },
      { 
        label: "Total Stock", 
        value: stats.totalStock.toLocaleString(), 
        icon: Package,
        color: "text-green-400"
      },
      { 
        label: "Inventory Value", 
        value: `${currency} ${stats.totalValue.toLocaleString()}`, 
        icon: DollarSign,
        color: "text-purple-400"
      },
      { 
        label: "Stock Alerts", 
        value: stats.outOfStock + stats.lowStock, 
        icon: AlertTriangle, 
        color: (stats.outOfStock + stats.lowStock) > 0 ? "text-red-400" : "text-slate-400",
        alert: (stats.outOfStock + stats.lowStock) > 0
      }
    ];
  }, [products, currency]);

  // Create/Update mutation
  const productMutation = useMutation({
    mutationFn: async (body) => {
      setIsSubmitting(true);
      try {
        const method = editingId ? "PUT" : "POST";
        const url = "/api/inventory";
        
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Operation failed");
        }
        
        return data;
      } catch (error) {
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["inventory"]);
      setEditingId(null);
      setFormData(initialFormState);
      
      toast.success(editingId ? "Product Updated" : "Product Added", {
        description: `${variables.name} has been ${editingId ? 'updated' : 'added'} successfully`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error("Operation Failed", {
        description: error.message,
        duration: 4000,
      });
    },
  });

  // DELETE MUTATION - FINAL FIXED VERSION
  const deleteMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      console.log("Attempting to delete:", { id, name });
      
      // Method 1: Try with body
      try {
        const response = await fetch("/api/inventory", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Delete failed: ${response.status}`);
        }
        
        return { id, name, data };
      } catch (bodyError) {
        console.log("Method 1 failed, trying Method 2:", bodyError);
        
        // Method 2: Try with query parameter
        const response = await fetch(`/api/inventory?id=${id}`, {
          method: "DELETE",
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Delete failed: ${response.status}`);
        }
        
        return { id, name, data };
      }
    },
    onSuccess: (result) => {
      console.log("Delete successful:", result);
      queryClient.invalidateQueries(["inventory"]);
      
      toast.success("Product Deleted", {
        description: `${result.name} has been removed`,
        duration: 3000,
        action: {
          label: "Undo",
          onClick: () => toast.info("Undo would restore product here"),
        },
      });
    },
    onError: (error, variables) => {
      console.error("Delete error:", error);
      
      toast.error("Delete Failed", {
        description: `${variables.name}: ${error.message}`,
        duration: 5000,
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Product name is required",
      });
      return;
    }
    
    const mutationData = editingId 
      ? { ...formData, id: editingId }
      : formData;
    
    productMutation.mutate(mutationData);
  };

  // Handle edit
  const handleEdit = (product) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialFormState);
    toast.info("Edit cancelled");
  };

  // Handle delete - SIMPLE AND WORKING VERSION
  const handleDelete = (id, name) => {
    if (!id) {
      toast.error("Cannot delete", {
        description: "Product ID is missing",
      });
      return;
    }
    
    // Simple confirmation
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id, name });
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic">Inventory</h1>
            <p className="text-slate-400 mt-2">Manage your products and stock</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            
            {editingId && (
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, i) => (
            <div key={i} className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg">
                  <stat.icon className={stat.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit2 className="text-yellow-500" size={20} />
                Edit Product
              </>
            ) : (
              <>
                <PlusCircle className="text-blue-500" size={20} />
                Add New Product
              </>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {inputs.map((input) => (
              <div key={input.name} className="space-y-2">
                <label className="text-sm text-slate-300">
                  {input.label}
                  {input.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={input.type}
                  name={input.name}
                  required={input.required}
                  min={input.min}
                  step={input.step}
                  placeholder={input.placeholder}
                  value={formData[input.name]}
                  onChange={handleInputChange}
                  className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-800">
            <button
              type="submit"
              disabled={isSubmitting || productMutation.isLoading}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-bold flex items-center gap-2"
            >
              {isSubmitting || productMutation.isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : editingId ? (
                <>
                  <Save size={18} />
                  Update Product
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>

        {/* Products Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Products</h3>
                <p className="text-slate-400 text-sm">
                  {products.length} product{products.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto text-slate-600 mb-4" size={48} />
                <h4 className="text-xl font-bold mb-2">No Products</h4>
                <p className="text-slate-400">Add your first product to get started</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="p-4 text-left text-slate-400">Product</th>
                    <th className="p-4 text-left text-slate-400">Category</th>
                    <th className="p-4 text-left text-slate-400">Supplier</th>
                    <th className="p-4 text-left text-slate-400">Stock</th>
                    <th className="p-4 text-left text-slate-400">Cost</th>
                    <th className="p-4 text-left text-slate-400">Price</th>
                    <th className="p-4 text-left text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="p-4">
                        <div className="font-bold">{product.name}</div>
                        {product.sku && (
                          <div className="text-sm text-slate-500">SKU: {product.sku}</div>
                        )}
                      </td>
                      <td className="p-4">
                        {product.category ? (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">
                        {product.source || "—"}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg font-bold ${
                          Number(product.stock) <= 0
                            ? 'bg-red-500/10 text-red-400'
                            : Number(product.stock) <= 10
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        {currency} {Number(product.costPrice || 0).toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-green-400">
                        {currency} {Number(product.sellingPrice || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            disabled={deleteMutation.isLoading}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteMutation.isLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}