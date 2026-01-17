"use client";

import React, { useState, useEffect } from "react";
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
  Edit2,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  Star,
  TrendingUp,
  Eye,
  MoreVertical,
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    company: "",
    status: "active",
    customerType: "regular",
    notes: "",
    taxNumber: ""
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    totalPurchases: 0,
    totalSpent: 0,
    avgPurchaseValue: 0
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setFetching(true);
      let url = `/api/customers?sort=${sortBy}`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterStatus !== "all") url += `&status=${filterStatus}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setCustomers(data.customers || []);
        setStats(data.stats || {});
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Failed to load customers");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [lang, filterStatus, sortBy]);

  // Search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({ ...prev, [name]: value }));
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
      company: customer.company || "",
      status: customer.status || "active",
      customerType: customer.customerType || "regular",
      notes: customer.notes || "",
      taxNumber: customer.taxNumber || ""
    });
    setShowForm(true);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      const toastId = toast.loading("Deleting customer...");
      
      const res = await fetch(`/api/customers?id=${customerToDelete._id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      await fetchCustomers();
      toast.success("Customer deleted", { id: toastId });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerForm.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    
    if (!customerForm.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Saving customer...");
    
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
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      setCustomerForm({
        name: "", email: "", phone: "", address: "", city: "", country: "",
        company: "", status: "active", customerType: "regular", notes: "", taxNumber: ""
      });
      
      setSelectedCustomer(null);
      setShowForm(false);
      await fetchCustomers();
      
      toast.success(selectedCustomer ? "Customer updated" : "Customer added", { 
        id: toastId 
      });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Import handler
  const handleImportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error("Only CSV files are allowed");
        return;
      }
      setImportFile(file);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error("Please select a CSV file");
      return;
    }
    
    setImporting(true);
    const toastId = toast.loading("Importing customers...");
    
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      
      const res = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      await fetchCustomers();
      setShowImport(false);
      setImportFile(null);
      
      toast.success(`Imported ${data.summary?.imported || 0} customers`, { 
        id: toastId 
      });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setImporting(false);
    }
  };

  // Export handler
  const handleExport = async () => {
    try {
      toast.loading("Preparing export...", { id: "export" });
      
      const res = await fetch("/api/customers/export");
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Export completed", { id: "export" });
    } catch (error) {
      toast.error("Export failed", { id: "export" });
    }
  };

  // Stats cards
  const statsCards = [
    {
      label: "Total Customers",
      value: stats.totalCustomers || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Active Customers",
      value: stats.activeCustomers || 0,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      label: "VIP Customers",
      value: stats.vipCustomers || 0,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "Total Spent",
      value: `${currency?.symbol || "৳"} ${(stats.totalSpent || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  // Loading state
  if (fetching && customers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
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
              Customer Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage your customers and relationships
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="vip">VIP</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="purchases">Most Purchases</option>
                <option value="spent">Most Spent</option>
              </select>
              
              <button
                onClick={fetchCustomers}
                disabled={fetching}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
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
              <h2 className="text-xl font-bold">Customer List</h2>
              <span className="text-sm text-slate-500">
                {customers.length} customers
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto text-slate-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Customers Found
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm ? "No results match your search" : "Add your first customer to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Add First Customer
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="p-4 text-left text-slate-400">Customer</th>
                    <th className="p-4 text-left text-slate-400">Contact</th>
                    <th className="p-4 text-left text-slate-400">Location</th>
                    <th className="p-4 text-left text-slate-400">Status</th>
                    <th className="p-4 text-left text-slate-400">Purchases</th>
                    <th className="p-4 text-left text-slate-400">Total Spent</th>
                    <th className="p-4 text-left text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            customer.customerType === 'vip' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                          }`}>
                            {customer.customerType === 'vip' ? (
                              <Star className="text-yellow-500" size={16} />
                            ) : (
                              <Users className="text-blue-500" size={16} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">
                              {customer.name}
                              {customer.company && (
                                <span className="text-sm text-slate-500 ml-2">({customer.company})</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={12} className="text-slate-500" />
                            <span className="text-slate-300">
                              {customer.email || "No email"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={12} className="text-slate-500" />
                            <span className="text-slate-300">{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin size={12} className="text-slate-500" />
                          <span>{customer.city || "N/A"}{customer.country && `, ${customer.country}`}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'active' ? 'bg-green-500/10 text-green-400' :
                          customer.status === 'inactive' ? 'bg-red-500/10 text-red-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {customer.status === 'active' && <UserCheck size={10} className="mr-1" />}
                          {customer.status === 'inactive' && <UserX size={10} className="mr-1" />}
                          {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-center">
                          <div className="text-white font-bold">{customer.totalPurchases || 0}</div>
                          <div className="text-xs text-slate-500">orders</div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {currency?.symbol || "৳"} {(customer.totalSpent || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-green-500">
                            Avg: {currency?.symbol || "৳"} {(customer.averageOrderValue || 0).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 size={16} />
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
                  {selectedCustomer ? "Edit Customer" : "Add Customer"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedCustomer(null);
                    setCustomerForm({
                      name: "", email: "", phone: "", address: "", city: "", country: "",
                      company: "", status: "active", customerType: "regular", notes: "", taxNumber: ""
                    });
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Customer Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={customerForm.name}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={customerForm.email}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="customer@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={customerForm.phone}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="+880 1XXX XXX XXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={customerForm.company}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tax Number</label>
                    <input
                      type="text"
                      name="taxNumber"
                      value={customerForm.taxNumber}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Tax/VAT number"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={customerForm.address}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={customerForm.city}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={customerForm.country}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Status</label>
                    <select
                      name="status"
                      value={customerForm.status}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Customer Type</label>
                    <select
                      name="customerType"
                      value={customerForm.customerType}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={customerForm.notes}
                      onChange={handleInputChange}
                      className="w-full p-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                      placeholder="Additional notes..."
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
                        name: "", email: "", phone: "", address: "", city: "", country: "",
                        company: "", status: "active", customerType: "regular", notes: "", taxNumber: ""
                      });
                    }}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
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
                    {loading ? "Saving..." : selectedCustomer ? "Update Customer" : "Add Customer"}
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
                    Confirm Delete
                  </h3>
                  <p className="text-slate-400">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-white">{customerToDelete.name}</span>?
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
                  Cancel
                </button>
                
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
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
                <h2 className="text-xl font-bold">Import Customers</h2>
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
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl text-center">
                    <Upload className="mx-auto text-slate-500 mb-3" size={32} />
                    <p className="text-slate-400 mb-2">
                      Drop your CSV file here, or
                    </p>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-block">
                        Browse Files
                      </span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportChange}
                        className="hidden"
                      />
                    </label>
                    {importFile && (
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                        <p className="text-green-400 text-sm">
                          Selected: {importFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">CSV Format</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Required columns: Name, Phone</li>
                      <li>• Optional: Email, Address, City, Country, Company</li>
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
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!importFile || importing}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Upload size={16} />
                    )}
                    {importing ? "Importing..." : "Import"}
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