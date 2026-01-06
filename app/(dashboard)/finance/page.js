"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { Trash2, ArrowDownCircle } from "lucide-react";

export default function FinancePage() {
  const { t } = useTranslation("common");
  const { lang } = useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalExpense: 0,
  });

  const [expenseData, setExpenseData] = useState({
    title: "",
    amount: "",
    category: "Marketing",
  });

  /* ===================== FETCH ===================== */
  const fetchData = async () => {
    try {
      setFetching(true);
      const [resExp, resStats] = await Promise.all([
        fetch("/api/finance"),
        fetch("/api/dashboard"),
      ]);

      const dataExp = await resExp.json();
      const dataStats = await resStats.json();

      if (dataExp.success) setExpenses(dataExp.expenses);
      if (dataStats.success) setStats(dataStats.stats);
    } catch {
      toast.error(t("fetch_failed"));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  /* ===================== ADD EXPENSE ===================== */
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    toast.loading(t("saving"), { id: "expense" });

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      if (!res.ok) throw new Error();

      setExpenseData({ title: "", amount: "", category: "Marketing" });
      await fetchData();

      toast.success(t("expense_added"), { id: "expense" });
    } catch {
      toast.error(t("expense_save_failed"), { id: "expense" });
    } finally {
      setLoading(false);
    }
  };

  /* ===================== DELETE EXPENSE (TOAST CONFIRM) ===================== */
  const confirmDeleteExpense = (id) => {
    toast.warning(t("confirm_delete"), {
      action: {
        label: t("delete"),
        onClick: async () => {
          toast.loading(t("deleting"), { id: "delete-expense" });
          try {
            const res = await fetch(`/api/finance?id=${id}`, {
              method: "DELETE",
            });
            if (!res.ok) throw new Error();
            await fetchData();
            toast.success(t("expense_deleted"), { id: "delete-expense" });
          } catch {
            toast.error(t("delete_failed"), { id: "delete-expense" });
          }
        },
      },
      duration: 5000,
    });
  };

  /* ===================== UI ===================== */
  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white">
          {t("finance_control")}
        </h1>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">{t("total_sales")}</p>
            <p className="text-xl font-bold text-white">৳ {stats.totalSales}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD EXPENSE - Left Side */}
        <div className="lg:col-span-2 bg-[#11161D] p-6 rounded-2xl border border-white/5">
          <h3 className="text-xl font-bold text-slate-200 mb-6">
            {t("new_expense")}
          </h3>

          <form onSubmit={handleExpenseSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("description")}
              </label>
              <input
                required
                placeholder={t("expense_desc_placeholder")}
                className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={expenseData.title}
                onChange={(e) =>
                  setExpenseData({ ...expenseData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t("amount")}
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder={t("amount_placeholder")}
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={expenseData.amount}
                  onChange={(e) =>
                    setExpenseData({ ...expenseData, amount: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t("category")}
                </label>
                <select
                  className="w-full p-3.5 bg-[#1a2230] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                  value={expenseData.category}
                  onChange={(e) =>
                    setExpenseData({ ...expenseData, category: e.target.value })
                  }
                >
                  <option value="Marketing">{t("marketing")}</option>
                  <option value="Rent">{t("rent")}</option>
                  <option value="Salary">{t("salary")}</option>
                  <option value="Others">{t("others")}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold uppercase text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? t("saving") : t("save_transaction")}
            </button>
          </form>
        </div>

        {/* CASH FLOW - Right Side */}
        <div className="bg-gradient-to-br from-[#11161D] to-[#0d1219] p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="text-center mb-8">
            <p className="text-sm uppercase text-slate-500 tracking-wider">
              {t("net_cash_flow")}
            </p>
            <h2
              className={`text-5xl md:text-6xl font-black mt-2 ${
                stats.totalProfit >= 0 
                  ? "text-green-500" 
                  : "text-red-500"
              }`}
            >
              ৳ {stats.totalProfit.toLocaleString()}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-slate-400">{t("order_profit")}</span>
              <span className="text-white font-semibold">
                ৳ {(Number(stats.totalProfit) + Number(stats.totalExpense || 0)).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-red-400">{t("total_expenses")}</span>
              <span className="text-red-400 font-semibold">
                ৳ {stats.totalExpense || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION LOG */}
      <div className="bg-[#11161D] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <ArrowDownCircle className="text-blue-500" size={20} />
              {t("transaction_log")}
            </h3>
            <span className="text-sm text-slate-500">
              {expenses.length} {t("transactions")}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-white/5">
              <tr className="text-xs uppercase text-slate-500">
                <th className="p-4 text-left font-medium">{t("description")}</th>
                <th className="p-4 text-left font-medium">{t("category")}</th>
                <th className="p-4 text-right font-medium">{t("amount")}</th>
                <th className="p-4 text-right font-medium">{t("action")}</th>
              </tr>
            </thead>

            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="text-slate-500">{t("syncing_records")}</p>
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-white/5 rounded-full">
                        <ArrowDownCircle className="text-slate-600" size={24} />
                      </div>
                      <p className="text-slate-500">{t("no_transactions")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr 
                    key={exp._id} 
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{exp.title}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(exp.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                        {t(exp.category.toLowerCase())}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-red-400 font-bold text-lg">
                        ৳ {exp.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => confirmDeleteExpense(exp._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t("delete")}
                      >
                        <Trash2 size={18} />
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