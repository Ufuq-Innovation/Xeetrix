"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { 
  Trash2, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  PlusCircle,
  Filter,
  Calendar,
  RefreshCw,
  Loader2,
  PieChart,
  Download,
  MoreVertical
} from "lucide-react";

export default function FinancePage() {
  const { t } = useTranslation("common");
  const { lang, currency } = useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalExpense: 0,
    totalIncome: 0,
    netBalance: 0,
    transactionCount: 0
  });

  const [filter, setFilter] = useState("all"); // all, today, week, month, year
  const [showForm, setShowForm] = useState(false);
  
  const [transactionData, setTransactionData] = useState({
    type: "expense",
    title: "",
    amount: "",
    category: "Marketing",
    description: "",
    paymentMethod: "cash",
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories = [
    "Marketing", "Rent", "Salary", "Utilities", "Supplies", 
    "Equipment", "Travel", "Software", "Maintenance", "Others"
  ];

  const incomeCategories = [
    "Sales", "Services", "Freelance", "Investment", "Commission",
    "Bonus", "Interest", "Rent Income", "Refund", "Others"
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank Transfer" },
    { value: "card", label: "Credit Card" },
    { value: "mobile", label: "Mobile Banking" },
    { value: "check", label: "Check" }
  ];

  /* ===================== FETCH DATA ===================== */
  const fetchData = async () => {
    try {
      setFetching(true);
      
      let url = "/api/finance";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      
      const [resFinance, resDashboard] = await Promise.all([
        fetch(url),
        fetch("/api/dashboard")
      ]);

      const dataFinance = await resFinance.json();
      const dataDashboard = await resDashboard.json();

      if (dataFinance.success) {
        setExpenses(dataFinance.expenses || []);
        setTransactions(dataFinance.transactions || []);
        
        // Calculate stats from transactions
        if (dataFinance.transactions) {
          const summary = dataFinance.transactions.reduce((acc, transaction) => {
            const amount = Number(transaction.amount) || 0;
            if (transaction.type === 'income') {
              acc.totalIncome += amount;
            } else if (transaction.type === 'expense') {
              acc.totalExpense += amount;
            }
            return acc;
          }, { totalIncome: 0, totalExpense: 0 });
          
          setStats(prev => ({
            ...prev,
            totalIncome: summary.totalIncome,
            totalExpense: summary.totalExpense,
            netBalance: summary.totalIncome - summary.totalExpense,
            transactionCount: dataFinance.transactions.length
          }));
        }
      }
      
      if (dataDashboard.success) {
        setStats(prev => ({
          ...prev,
          totalSales: dataDashboard.stats?.totalSales || 0,
          totalProfit: dataDashboard.stats?.totalProfit || 0
        }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(t("fetch_failed") || "Failed to load data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang, filter]);

  /* ===================== ADD TRANSACTION ===================== */
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionData.title.trim() || !transactionData.amount || Number(transactionData.amount) <= 0) {
      toast.error("Please fill all required fields with valid data");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading(t("saving") || "Saving transaction...");

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...transactionData,
          amount: Number(transactionData.amount)
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save transaction");
      }

      // Reset form
      setTransactionData({
        type: "expense",
        title: "",
        amount: "",
        category: "Marketing",
        description: "",
        paymentMethod: "cash",
        date: new Date().toISOString().split('T')[0]
      });
      
      setShowForm(false);
      await fetchData();

      toast.success(
        t("transaction_added") || `${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully`, 
        { id: toastId }
      );
    } catch (error) {
      toast.error(error.message || t("transaction_save_failed") || "Failed to save transaction", { 
        id: toastId 
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===================== DELETE TRANSACTION ===================== */
  const confirmDeleteTransaction = (id, title) => {
    toast.warning(t("confirm_delete") || "Are you sure?", {
      description: `Delete "${title}"?`,
      action: {
        label: t("delete") || "Delete",
        onClick: async () => {
          const toastId = toast.loading(t("deleting") || "Deleting...");
          try {
            const res = await fetch(`/api/finance?id=${id}`, {
              method: "DELETE",
            });
            
            const data = await res.json();
            
            if (!res.ok || !data.success) {
              throw new Error(data.message || "Delete failed");
            }
            
            await fetchData();
            toast.success(t("transaction_deleted") || "Transaction deleted", { 
              id: toastId 
            });
          } catch (error) {
            toast.error(error.message || t("delete_failed") || "Delete failed", { 
              id: toastId 
            });
          }
        },
      },
      cancel: {
        label: t("cancel") || "Cancel",
        onClick: () => {}
      },
      duration: 5000,
    });
  };

  /* ===================== HELPER FUNCTIONS ===================== */
  const formatCurrency = (amount) => {
    const symbol = typeof currency === 'string' ? currency : 
                  (currency?.symbol || currency?.code || "৳");
    return `${symbol} ${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  /* ===================== STATS CARDS ===================== */
  const statsCards = [
    {
      label: t("total_income") || "Total Income",
      value: stats.totalIncome,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "up"
    },
    {
      label: t("total_expense") || "Total Expense",
      value: stats.totalExpense,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      trend: "down"
    },
    {
      label: t("net_balance") || "Net Balance",
      value: stats.netBalance,
      icon: DollarSign,
      color: stats.netBalance >= 0 ? "text-blue-500" : "text-orange-500",
      bgColor: stats.netBalance >= 0 ? "bg-blue-500/10" : "bg-orange-500/10",
      trend: stats.netBalance >= 0 ? "up" : "down"
    },
    {
      label: t("transactions") || "Transactions",
      value: stats.transactionCount,
      icon: Wallet,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "count"
    }
  ];

  /* ===================== FILTER OPTIONS ===================== */
  const filterOptions = [
    { value: "all", label: t("all_time") || "All Time" },
    { value: "today", label: t("today") || "Today" },
    { value: "week", label: t("this_week") || "This Week" },
    { value: "month", label: t("this_month") || "This Month" },
    { value: "year", label: t("this_year") || "This Year" }
  ];

  /* ===================== UI ===================== */
  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white">
            {t("finance_control") || "Finance Control"}
          </h1>
          <p className="text-slate-400 mt-2">
            {t("manage_income_expenses") || "Manage your income and expenses"}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
          >
            <PlusCircle size={16} />
            {t("new_transaction") || "New Transaction"}
          </button>
          
          <button
            onClick={fetchData}
            disabled={fetching}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl"
            title={t("refresh") || "Refresh"}
          >
            <RefreshCw size={16} className={fetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-slate-300 hover:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 p-5 rounded-2xl border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.trend === "count" 
                    ? stat.value 
                    : formatCurrency(stat.value)
                  }
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={stat.color} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">
            {t("new_transaction") || "New Transaction"}
          </h3>

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {["income", "expense"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTransactionData({
                  ...transactionData,
                  type,
                  category: type === 'income' ? "Sales" : "Marketing"
                })}
                className={`py-3 rounded-lg font-medium ${
                  transactionData.type === type
                    ? type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-800 text-slate-300'
                }`}
              >
                {type === 'income' ? (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUpCircle size={18} />
                    {t("income") || "Income"}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownCircle size={18} />
                    {t("expense") || "Expense"}
                  </div>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleTransactionSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("description") || "Description"} *
              </label>
              <input
                required
                placeholder={t("transaction_desc_placeholder") || "Enter transaction description"}
                className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                value={transactionData.title}
                onChange={(e) => setTransactionData({ 
                  ...transactionData, 
                  title: e.target.value 
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Amount */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t("amount") || "Amount"} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    {typeof currency === 'string' ? currency : 
                     (currency?.symbol || currency?.code || "৳")}
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-10 p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ 
                      ...transactionData, 
                      amount: e.target.value 
                    })}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t("category") || "Category"} *
                </label>
                <select
                  className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                  value={transactionData.category}
                  onChange={(e) => setTransactionData({ 
                    ...transactionData, 
                    category: e.target.value 
                  })}
                >
                  {transactionData.type === 'income' 
                    ? incomeCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    : expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                  }
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Payment Method */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t("payment_method") || "Payment Method"}
                </label>
                <select
                  className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={transactionData.paymentMethod}
                  onChange={(e) => setTransactionData({ 
                    ...transactionData, 
                    paymentMethod: e.target.value 
                  })}
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t("date") || "Date"}
                </label>
                <input
                  type="date"
                  className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({ 
                    ...transactionData, 
                    date: e.target.value 
                  })}
                />
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t("notes") || "Notes (Optional)"}
              </label>
              <textarea
                rows="2"
                placeholder={t("add_notes_placeholder") || "Add any additional notes..."}
                className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                value={transactionData.description}
                onChange={(e) => setTransactionData({ 
                  ...transactionData, 
                  description: e.target.value 
                })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : transactionData.type === 'income' ? (
                <ArrowUpCircle size={18} />
              ) : (
                <ArrowDownCircle size={18} />
              )}
              {loading 
                ? (t("saving") || "Saving...") 
                : transactionData.type === 'income' 
                  ? (t("add_income") || "Add Income") 
                  : (t("add_expense") || "Add Expense")
              }
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-gray-800">
          <div className="text-center mb-8">
            <p className="text-sm uppercase text-slate-500 tracking-wider">
              {t("financial_summary") || "Financial Summary"}
            </p>
            <h2 className={`text-5xl md:text-6xl font-black mt-2 ${
              stats.netBalance >= 0 
                ? "text-green-500" 
                : "text-red-500"
            }`}>
              {formatCurrency(stats.netBalance)}
            </h2>
            <p className="text-slate-400 mt-2">
              {stats.netBalance >= 0 ? "Positive Balance" : "Negative Balance"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <span className="text-slate-400">{t("total_income") || "Total Income"}</span>
              </div>
              <span className="text-green-500 font-semibold">
                {formatCurrency(stats.totalIncome)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="text-red-500" size={16} />
                </div>
                <span className="text-slate-400">{t("total_expense") || "Total Expense"}</span>
              </div>
              <span className="text-red-500 font-semibold">
                {formatCurrency(stats.totalExpense)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t("total_sales") || "Total Sales"}</span>
                <span className="text-white font-semibold">
                  {formatCurrency(stats.totalSales)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-slate-400">{t("total_profit") || "Total Profit"}</span>
                <span className={`font-semibold ${
                  stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatCurrency(stats.totalProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button className="w-full mt-6 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center gap-2 text-slate-300">
            <Download size={16} />
            {t("export_report") || "Export Report"}
          </button>
        </div>
      </div>

      {/* TRANSACTION LOG */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <ArrowDownCircle className="text-blue-500" size={20} />
              {t("transaction_log") || "Transaction Log"}
            </h3>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {transactions.length} {t("transactions") || "transactions"}
              </span>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-800/50">
              <tr className="text-xs uppercase text-slate-500">
                <th className="p-4 text-left font-medium">{t("date") || "Date"}</th>
                <th className="p-4 text-left font-medium">{t("description") || "Description"}</th>
                <th className="p-4 text-left font-medium">{t("category") || "Category"}</th>
                <th className="p-4 text-left font-medium">{t("payment") || "Payment"}</th>
                <th className="p-4 text-right font-medium">{t("amount") || "Amount"}</th>
                <th className="p-4 text-right font-medium">{t("action") || "Action"}</th>
              </tr>
            </thead>

            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                      <p className="text-slate-500">{t("loading_transactions") || "Loading transactions..."}</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-800/50 rounded-full">
                        <ArrowDownCircle className="text-slate-600" size={24} />
                      </div>
                      <p className="text-slate-500">{t("no_transactions") || "No transactions found"}</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                      >
                        {t("add_first_transaction") || "Add First Transaction"}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr 
                    key={transaction._id} 
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="text-sm text-slate-400">
                        {formatDate(transaction.date || transaction.createdAt)}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{transaction.title}</div>
                        {transaction.description && (
                          <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {transaction.category}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-slate-400 capitalize">
                        {transaction.paymentMethod?.replace('_', ' ')}
                      </div>
                    </td>
                    
                    <td className="p-4 text-right">
                      <div className={`font-bold flex items-center justify-end gap-1 ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle size={14} />
                        ) : (
                          <ArrowDownCircle size={14} />
                        )}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    
                    <td className="p-4 text-right">
                      <button
                        onClick={() => confirmDeleteTransaction(transaction._id, transaction.title)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t("delete") || "Delete"}
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