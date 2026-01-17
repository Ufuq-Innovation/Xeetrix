"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit2,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  Star,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Eye,
  MoreVertical,
  ChevronDown,
  Download,
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function CustomerPage() {
  const { t } = useTranslation("common");
  const { lang, currency } = useApp();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive, vip
  const [sortBy, setSortBy] = useState("recent"); // recent, name, purchases, spent
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    status: "active",
    customerType: "regular", // regular, vip, wholesale
    notes: "",
    taxNumber: "",
    company: ""
  });

  // Stats state
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    totalPurchases: 0,
    totalSpent: 0,
    avgPurchaseValue: 0
  });

  /* ===================== FETCH DATA ===================== */
  const fetchCustomers = async () => {
    try {
      setFetching(true);
      let url = "/api/customers";
      
      // Add query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);
      params.append("sort", sortBy);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setCustomers(data.customers || []);
        setStats(data.stats || {});
      } else {
        throw new Error(data.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
      toast.error(t("fetch_failed") || "Failed to load customers");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [lang, filterStatus, sortBy]);

  /* ===================== SEARCH HANDLER ===================== */
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm !== "") {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  /* ===================== CUSTOMER FORM HANDLERS ===================== */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      country: customer.country || "",
      status: customer.status || "active",
      customerType: customer.customerType || "regular",
      notes: customer.notes || "",
      taxNumber: customer.taxNumber || "",
      company: customer.company || ""
    });
    setShowForm(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    // You can implement a modal or separate view page here
    toast.info(`Viewing ${customer.name}`, {
      description: "Customer details loaded"
    });
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      const toastId = toast.loading(t("deleting") || "Deleting customer...");
      
      const res = await fetch(`/api/customers?id=${customerToDelete._id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }
      
      await fetchCustomers();
      toast.success(t("customer_deleted") || "Customer deleted successfully", { 
        id: toastId 
      });
    } catch (error) {
      toast.error(error.message || t("delete_failed") || "Delete failed");
    } finally {
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    }
  };

  /* ===================== FORM SUBMISSION ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!customerForm.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    
    if (!customerForm.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading(t("saving") || "Saving customer...");
    
    try {
      const method = selectedCustomer ? "PUT" : "POST";
      const url = "/api/customers";
      
      const payload = selectedCustomer 
        ? { ...customerForm, id: selectedCustomer._id }
        : customerForm;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Save failed");
      }
      
      // Reset form
      setCustomerForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        status: "active",
        customerType: "regular",
        notes: "",
        taxNumber: "",
        company: ""
      });
      
      setSelectedCustomer(null);
      setShowForm(false);
      await fetchCustomers();
      
      toast.success(
        selectedCustomer 
          ? (t("customer_updated") || "Customer updated successfully")
          : (t("customer_added") || "Customer added successfully"),
        { id: toastId }
      );
    } catch (error) {
      toast.error(error.message || t("save_failed") || "Save failed", { 
        id: toastId 
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===================== IMPORT HANDLERS ===================== */
  const handleImportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast.error("Please upload a CSV or Excel file");
        return;
      }
      setImportFile(file);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Importing customers...");
    
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      
      const res = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Import failed");
      }
      
      await fetchCustomers();
      setShowImport(false);
      setImportFile(null);
      
      toast.success(`Successfully imported ${data.imported} customers`, { 
        id: toastId 
      });
    } catch (error) {
      toast.error(error.message || "Import failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /* ===================== EXPORT HANDLERS ===================== */
  const handleExport = async () => {
    try {
      toast.loading("Preparing export...", { id: "export" });
      
      const res = await fetch("/api/customers/export");
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Export completed successfully", { id: "export" });
    } catch (error) {
      toast.error("Export failed", { id: "export" });
    }
  };

  /* ===================== STATS CARDS ===================== */
  const statsCards = [
    {
      label: t("total_customers") || "Total Customers",
      value: stats.totalCustomers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: "+12%"
    },
    {
      label: t("active_customers") || "Active Customers",
      value: stats.activeCustomers || 0,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "+8%"
    },
    {
      label: t("vip_customers") || "VIP Customers",
      value: stats.vipCustomers || 0,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      change: "+15%"
    },
    {
      label: t("total_spent") || "Total Spent",
      value: `${currency?.symbol || currency?.code || "৳"} ${(stats.totalSpent || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: "+22%"
    }
  ];

  /* ===================== FILTER OPTIONS ===================== */
  const statusOptions = [
    { value: "all", label: t("all_customers") || "All Customers" },
    { value: "active", label: t("active") || "Active" },
    { value: "inactive", label: t("inactive") || "Inactive" },
    { value: "vip", label: t("vip") || "VIP" }
  ];

  const sortOptions = [
    { value: "recent", label: t("recent") || "Most Recent" },
    { value: "name", label: t("name_az") || "Name (A-Z)" },
    { value: "purchases", label: t("most_purchases") || "Most Purchases" },
    { value: "spent", label: t("most_spent") || "Most Spent" }
  ];

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

  /* ===================== LOADING STATE ===================== */
  if (fetching && customers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic">
              {t("customer_management") || "Customer Management"}
            </h1>
            <p className="text-slate-400 mt-2">
              {t("manage_customers") || "Manage your customers and relationships"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2"
            >
              <Upload size={16} />
              {t("import") || "Import"}
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2"
            >
              <Download size={16} />
              {t("export") || "Export"}
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
            >
              <UserPlus size={16} />
              {t("add_customer") || "Add Customer"}
            </button>
          </div>
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
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <TrendingUp size={12} />
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder={t("search_customers") || "Search customers by name, email, or phone..."}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={fetchCustomers}
                disabled={fetching}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
                title={t("refresh") || "Refresh"}
              >
                <RefreshCw size={18} className={fetching ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {t("customer_list") || "Customer List"}
              </h2>
              <span className="text-sm text-slate-500">
                {customers.length} {t("customers") || "customers"}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto text-slate-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">
                  {t("no_customers") || "No Customers Found"}
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm 
                    ? (t("no_results") || "No results match your search")
                    : (t("add_first_customer") || "Add your first customer to get started")
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    {t("add_first_customer") || "Add First Customer"}
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-800/50">
                  <tr className="text-left">
                    <th className="p-4 text-slate-400 font-medium">Customer</th>
                    <th className="p-4 text-slate-400 font-medium">Contact</th>
                    <th className="p-4 text-slate-400 font-medium">Location</th>
                    <th className="p-4 text-slate-400 font-medium">Status</th>
                    <th className="p-4 text-slate-400 font-medium">Purchases</th>
                    <th className="p-4 text-slate-400 font-medium">Total Spent</th>
                    <th className="p-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr 
                      key={customer._id} 
                      className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            customer.customerType === 'vip' ? 'bg-yellow-500/10' :
                            customer.customerType === 'wholesale' ? 'bg-purple-500/10' :
                            'bg-blue-500/10'
                          }`}>
                            {customer.customerType === 'vip' ? (
                              <Star className="text-yellow-500" size={16} />
                            ) : customer.customerType === 'wholesale' ? (
                              <ShoppingBag className="text-purple-500" size={16} />
                            ) : (
                              <Users className="text-blue-500" size={16} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {customer.name}
                              {customer.company && (
                                <span className="text-sm text-slate-500 ml-2">
                                  ({customer.company})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Joined: {formatDate(customer.createdAt || customer.joinedDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={12} className="text-slate-500" />
                            <span className="text-slate-300 truncate max-w-[150px]">
                              {customer.email || "No email"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={12} className="text-slate-500" />
                            <span className="text-slate-300">
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Location */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin size={12} className="text-slate-500" />
                          <span className="truncate max-w-[120px]">
                            {customer.city || "N/A"}
                            {customer.country && `, ${customer.country}`}
                          </span>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : customer.status === 'inactive'
                            ? 'bg-red-500/10 text-red-400'
                            : customer.status === 'vip'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {customer.status === 'active' && <UserCheck size={10} className="mr-1" />}
                          {customer.status === 'inactive' && <UserX size={10} className="mr-1" />}
                          {customer.status === 'vip' && <Star size={10} className="mr-1" />}
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </td>
                      
                      {/* Purchase Stats */}
                      <td className="p-4">
                        <div className="text-center">
                          <div className="text-white font-bold">
                            {customer.totalPurchases || 0}
                          </div>
                          <div className="text-xs text-slate-500">orders</div>
                        </div>
                      </td>
                      
                      {/* Total Spent */}
                      <td className="p-4">
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {formatCurrency(customer.totalSpent || 0)}
                          </div>
                          <div className="text-xs text-green-500">
                            Avg: {formatCurrency(customer.averageOrderValue || 0)}
                          </div>
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-slate-300"
                            title={t("view") || "View"}
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg"
                            title={t("edit") || "Edit"}
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                            title={t("delete") || "Delete"}
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-slate-300">
                            <MoreVertical size={16} />
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

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedCustomer ? t("edit_customer") || "Edit Customer" : t("add_customer") || "Add Customer"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedCustomer(null);
                    setCustomerForm({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      country: "",
                      status: "active",
                      customerType: "regular",
                      notes: "",
                      taxNumber: "",
                      company: ""
                    });
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("customer_name") || "Customer Name"} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={customerForm.name}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("email") || "Email"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerForm.email}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="customer@example.com"
                    />
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("phone") || "Phone"} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={customerForm.phone}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="+880 1XXX XXX XXX"
                    />
                  </div>
                  
                  {/* Company */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("company") || "Company"}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={customerForm.company}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Company name (optional)"
                    />
                  </div>
                  
                  {/* Tax Number */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("tax_number") || "Tax Number"}
                    </label>
                    <input
                      type="text"
                      name="taxNumber"
                      value={customerForm.taxNumber}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Tax/VAT number"
                    />
                  </div>
                  
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("address") || "Address"}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={customerForm.address}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Street address"
                    />
                  </div>
                  
                  {/* City */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("city") || "City"}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerForm.city}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="City"
                    />
                  </div>
                  
                  {/* Country */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("country") || "Country"}
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={customerForm.country}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Country"
                    />
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("status") || "Status"}
                    </label>
                    <select
                      name="status"
                      value={customerForm.status}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  
                  {/* Customer Type */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("customer_type") || "Customer Type"}
                    </label>
                    <select
                      name="customerType"
                      value={customerForm.customerType}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    >
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  
                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">
                      {t("notes") || "Notes"}
                    </label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={customerForm.notes}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                      placeholder="Additional notes about the customer..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedCustomer(null);
                      setCustomerForm({
                        name: "",
                        email: "",
                        phone: "",
                        address: "",
                        city: "",
                        country: "",
                        status: "active",
                        customerType: "regular",
                        notes: "",
                        taxNumber: "",
                        company: ""
                      });
                    }}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    {t("cancel") || "Cancel"}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : selectedCustomer ? (
                      <CheckCircle size={16} />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {loading 
                      ? (t("saving") || "Saving...") 
                      : selectedCustomer 
                        ? (t("update_customer") || "Update Customer") 
                        : (t("add_customer") || "Add Customer")
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-red-500/30 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t("confirm_delete") || "Confirm Delete"}
                  </h3>
                  <p className="text-slate-400">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-white">{customerToDelete.name}</span>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCustomerToDelete(null);
                  }}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                >
                  {t("cancel") || "Cancel"}
                </button>
                
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  {t("delete") || "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {t("import_customers") || "Import Customers"}
                </h2>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportFile(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleImportSubmit}>
                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl text-center hover:border-blue-500 transition-colors">
                    <Upload className="mx-auto text-slate-500 mb-3" size={32} />
                    <p className="text-slate-400 mb-2">
                      {t("drop_file") || "Drop your CSV or Excel file here, or"}
                    </p>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block">
                        {t("browse_files") || "Browse Files"}
                      </span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleImportChange}
                        className="hidden"
                      />
                    </label>
                    {importFile && (
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                        <p className="text-green-400 text-sm">
                          Selected: {importFile.name}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Size: {(importFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">
                      {t("import_instructions") || "Import Instructions"}
                    </h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• CSV/Excel format required</li>
                      <li>• Include columns: Name, Email, Phone (required)</li>
                      <li>• Optional: Address, City, Company, Notes</li>
                      <li>• Maximum file size: 5MB</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImport(false);
                      setImportFile(null);
                    }}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    {t("cancel") || "Cancel"}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!importFile || loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Upload size={16} />
                    )}
                    {loading ? t("importing") || "Importing..." : t("import") || "Import"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}