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

  // এই inputs অ্যারেটি এখন ডাইনামিক কারেন্সি সাপোর্ট করবে
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

  if (!mounted) return null;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header, Stats Cards, Form and Table remains same as your provided structure */}
      {/* ... (Rest of the JSX) */}
    </div>
  );
}