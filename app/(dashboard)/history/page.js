"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, History, CheckSquare, Square, Search } from "lucide-react";

export default function HistoryPage() {
  const { lang } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* ===================== FETCH ===================== */
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", lang],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      const data = await res.json();
      return data.success ? data.orders : [];
    },
  });

  /* ===================== SINGLE DELETE ===================== */
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onMutate: () => toast.loading(t("deleting_order"), { id: "delete" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success(t("order_deleted"), { id: "delete" });
    },
    onError: () => toast.error(t("delete_failed"), { id: "delete" }),
  });

  /* ===================== BULK DELETE ===================== */
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/orders?id=${id}`, { method: "DELETE" })
        )
      );
    },
    onMutate: () => toast.loading(t("bulk_deleting"), { id: "bulk" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setSelectedOrders([]);
      toast.success(t("bulk_delete_success"), { id: "bulk" });
    },
    onError: () => toast.error(t("bulk_delete_failed"), { id: "bulk" }),
  });

  /* ===================== TOAST CONFIRM HANDLERS ===================== */
  const confirmDelete = (id) => {
    toast.warning(t("confirm_delete"), {
      action: {
        label: t("delete"),
        onClick: () => deleteMutation.mutate(id),
      },
      duration: 5000,
    });
  };

  const confirmBulkDelete = () => {
    toast.warning(t("confirm_bulk_delete"), {
      action: {
        label: t("delete"),
        onClick: () => bulkDeleteMutation.mutate(selectedOrders),
      },
      duration: 6000,
    });
  };

  /* ===================== FILTER ===================== */
  const filteredOrders = orders.filter(
    (o) =>
      (o.customerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (o.customerPhone || "").includes(searchTerm)
  );

  const toggleSelect = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ===================== UI ===================== */
  return (
    <div className="space-y-10 p-4 md:p-0">
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <h1 className="text-4xl font-black italic uppercase flex items-center gap-3">
          <History className="text-blue-500" />
          {t("order_history")}
        </h1>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("search_customer_placeholder")}
              className="w-full bg-[#11161D] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none"
            />
          </div>

          {selectedOrders.length > 0 && (
            <button
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2"
            >
              <Trash2 size={14} />
              {t("delete")} ({selectedOrders.length})
            </button>
          )}
        </div>
      </header>

      <div className="bg-[#11161D] rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead className="text-xs text-slate-500 uppercase border-b border-white/5">
            <tr>
              <th className="p-6 w-10">
                <button
                  onClick={() =>
                    setSelectedOrders(
                      selectedOrders.length === filteredOrders.length
                        ? []
                        : filteredOrders.map((o) => o._id)
                    )
                  }
                >
                  {selectedOrders.length === filteredOrders.length &&
                  filteredOrders.length ? (
                    <CheckSquare className="text-blue-500" />
                  ) : (
                    <Square />
                  )}
                </button>
              </th>
              <th className="p-6">{t("customer_profile")}</th>
              <th className="p-6">{t("product_details")}</th>
              <th className="p-6 text-right">{t("revenue")}</th>
              <th className="p-6 text-right">{t("net_profit")}</th>
              <th className="p-6 text-right">{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="p-20 text-center text-slate-500">
                  {t("syncing_history")}
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-20 text-center text-slate-500">
                  {t("no_records_found")}
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr
                  key={o._id}
                  className={`border-b border-white/5 ${
                    selectedOrders.includes(o._id) && "bg-blue-500/5"
                  }`}
                >
                  <td className="p-6">
                    <button onClick={() => toggleSelect(o._id)}>
                      {selectedOrders.includes(o._id) ? (
                        <CheckSquare className="text-blue-500" />
                      ) : (
                        <Square />
                      )}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="font-bold">{o.customerName}</div>
                    <div className="text-xs text-slate-500">{o.customerPhone}</div>
                  </td>
                  <td className="p-6">
                    {o.productName} × {o.quantity}
                  </td>
                  <td className="p-6 text-right">
                    ৳ {(o.sellingPrice * o.quantity).toLocaleString()}
                  </td>
                  <td className="p-6 text-right text-green-500 font-bold">
                    ৳ {o.netProfit?.toLocaleString()}
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => confirmDelete(o._id)}>
                      <Trash2 className="hover:text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
