"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Truck, Package, Clock, CheckCircle, XCircle, User,
  Phone, Calendar, Search, RefreshCw, Loader2, Edit2, 
  Trash2, PlusCircle, Home, Mail, CreditCard, MapPin
} from "lucide-react";

export default function CourierPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showCourierForm, setShowCourierForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);

  // Delivery form
  const [deliveryForm, setDeliveryForm] = useState({
    orderId: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    packageType: "parcel",
    packageWeight: "",
    packageValue: "",
    deliveryCharge: "",
    paymentMethod: "cash_on_delivery",
    status: "pending",
    deliveryDate: new Date().toISOString().split('T')[0]
  });

  // Courier form
  const [courierForm, setCourierForm] = useState({
    name: "",
    phone: "",
    vehicleType: "bike",
    vehicleNumber: "",
    address: "",
    status: "active"
  });

  // Assign form
  const [assignForm, setAssignForm] = useState({
    courierId: "",
    deliveryIds: []
  });

  /* ===================== INPUT HANDLERS ===================== */
  const handleDeliveryInput = useCallback((e) => {
    const { name, value } = e.target;
    setDeliveryForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCourierInput = useCallback((e) => {
    const { name, value } = e.target;
    setCourierForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAssignInput = useCallback((e) => {
    const { name, value } = e.target;
    setAssignForm(prev => ({ ...prev, [name]: value }));
  }, []);

  /* ===================== API QUERIES ===================== */
  // Fetch deliveries
  const { 
    data: deliveriesData = { deliveries: [] }, 
    isLoading: deliveriesLoading,
    refetch: refetchDeliveries 
  } = useQuery({
    queryKey: ["deliveries", activeTab, searchTerm],
    queryFn: async () => {
      let url = `/api/courier/deliveries?status=${activeTab}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      const res = await fetch(url);
      return res.json();
    }
  });

  // Fetch couriers
  const { 
    data: couriersData = { couriers: [] }, 
    isLoading: couriersLoading 
  } = useQuery({
    queryKey: ["couriers"],
    queryFn: async () => {
      const res = await fetch("/api/courier/couriers");
      return res.json();
    }
  });

  // Fetch stats
  const { 
    data: statsData = { stats: {} } 
  } = useQuery({
    queryKey: ["courier-stats"],
    queryFn: async () => {
      const res = await fetch("/api/courier/stats");
      return res.json();
    }
  });

  const deliveries = deliveriesData.deliveries || [];
  const couriers = couriersData.couriers || [];
  const stats = statsData.stats || {};

  /* ===================== MUTATIONS ===================== */
  // Delivery mutation
  const deliveryMutation = useMutation({
    mutationFn: async (formData) => {
      const method = selectedDelivery ? "PUT" : "POST";
      const url = "/api/courier/deliveries";
      const payload = selectedDelivery 
        ? { ...formData, id: selectedDelivery._id }
        : formData;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deliveries"]);
      queryClient.invalidateQueries(["courier-stats"]);
      setShowDeliveryForm(false);
      setSelectedDelivery(null);
      resetDeliveryForm();
      toast.success(selectedDelivery ? "Updated" : "Created");
    },
    onError: (error) => toast.error(error.message)
  });

  // Courier mutation
  const courierMutation = useMutation({
    mutationFn: async (formData) => {
      const method = selectedCourier ? "PUT" : "POST";
      const url = "/api/courier/couriers";
      const payload = selectedCourier 
        ? { ...formData, id: selectedCourier._id }
        : formData;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["couriers"]);
      setShowCourierForm(false);
      setSelectedCourier(null);
      resetCourierForm();
      toast.success(selectedCourier ? "Updated" : "Added");
    },
    onError: (error) => toast.error(error.message)
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/courier/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["deliveries"]);
      setShowAssignForm(false);
      toast.success(data.message);
    },
    onError: (error) => toast.error(error.message)
  });

  // Delete delivery mutation
  const deleteDeliveryMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/courier/deliveries?id=${id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["deliveries"]);
      queryClient.invalidateQueries(["courier-stats"]);
      toast.success("Deleted");
    },
    onError: (error) => toast.error(error.message)
  });

  /* ===================== HELPER FUNCTIONS ===================== */
  const resetDeliveryForm = () => {
    setDeliveryForm({
      orderId: "",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      packageType: "parcel",
      packageWeight: "",
      packageValue: "",
      deliveryCharge: "",
      paymentMethod: "cash_on_delivery",
      status: "pending",
      deliveryDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetCourierForm = () => {
    setCourierForm({
      name: "",
      phone: "",
      vehicleType: "bike",
      vehicleNumber: "",
      address: "",
      status: "active"
    });
  };

  const handleEditDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryForm({
      orderId: delivery.orderId || "",
      customerName: delivery.customerName || "",
      customerPhone: delivery.customerPhone || "",
      customerAddress: delivery.customerAddress || "",
      packageType: delivery.packageType || "parcel",
      packageWeight: delivery.packageWeight || "",
      packageValue: delivery.packageValue || "",
      deliveryCharge: delivery.deliveryCharge || "",
      paymentMethod: delivery.paymentMethod || "cash_on_delivery",
      status: delivery.status || "pending",
      deliveryDate: delivery.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setShowDeliveryForm(true);
  };

  const handleEditCourier = (courier) => {
    setSelectedCourier(courier);
    setCourierForm({
      name: courier.name || "",
      phone: courier.phone || "",
      vehicleType: courier.vehicleType || "bike",
      vehicleNumber: courier.vehicleNumber || "",
      address: courier.address || "",
      status: courier.status || "active"
    });
    setShowCourierForm(true);
  };

  const handleDeleteDelivery = (id) => {
    if (confirm("Delete this delivery?")) {
      deleteDeliveryMutation.mutate(id);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch("/api/courier/deliveries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      
      const data = await res.json();
      if (data.success) {
        queryClient.invalidateQueries(["deliveries"]);
        queryClient.invalidateQueries(["courier-stats"]);
        toast.success(`Status: ${status}`);
      }
    } catch (error) {
      toast.error("Failed");
    }
  };

  const handleAssignDelivery = (deliveryId) => {
    setAssignForm({
      courierId: couriers[0]?._id || "",
      deliveryIds: [deliveryId]
    });
    setShowAssignForm(true);
  };

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    deliveryMutation.mutate(deliveryForm);
  };

  const handleCourierSubmit = (e) => {
    e.preventDefault();
    courierMutation.mutate(courierForm);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.courierId) {
      toast.error("Select courier");
      return;
    }
    assignMutation.mutate(assignForm);
  };

  const formatCurrency = (amount) => {
    return `৳ ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'in_transit': return 'bg-blue-500/10 text-blue-500';
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'returned': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const statsCards = [
    {
      label: "Pending",
      value: stats.pendingDeliveries || 0,
      icon: Package,
      color: "text-yellow-500"
    },
    {
      label: "In Transit",
      value: stats.inTransitDeliveries || 0,
      icon: Truck,
      color: "text-blue-500"
    },
    {
      label: "Delivered Today",
      value: stats.deliveredToday || 0,
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      label: "Active Couriers",
      value: stats.activeCouriers || 0,
      icon: User,
      color: "text-purple-500"
    }
  ];

  if (deliveriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Courier Management</h1>
            <p className="text-slate-400 mt-1">Manage deliveries and couriers</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCourierForm(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
            >
              <User size={16} />
              Add Courier
            </button>
            
            <button
              onClick={() => setShowDeliveryForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <PlusCircle size={16} />
              New Delivery
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={stat.color} size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Search & Tabs */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="all">All</option>
              </select>
              
              <button
                onClick={() => refetchDeliveries()}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg"
              >
                <RefreshCw size={18} className={deliveriesLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-bold">Deliveries ({deliveries.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            {deliveries.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="mx-auto text-slate-600 mb-3" size={40} />
                <p className="text-slate-400">No deliveries found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="p-3 text-left text-sm text-slate-400">Order ID</th>
                    <th className="p-3 text-left text-sm text-slate-400">Customer</th>
                    <th className="p-3 text-left text-sm text-slate-400">Details</th>
                    <th className="p-3 text-left text-sm text-slate-400">Status</th>
                    <th className="p-3 text-left text-sm text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery._id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="p-3">
                        <div className="font-bold">{delivery.orderId}</div>
                        <div className="text-xs text-slate-500">{formatDate(delivery.createdAt)}</div>
                      </td>
                      
                      <td className="p-3">
                        <div className="font-bold">{delivery.customerName}</div>
                        <div className="text-sm text-slate-400">{delivery.customerPhone}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">
                          {delivery.customerAddress}
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-slate-400">Type: </span>
                            {delivery.packageType}
                          </div>
                          <div className="text-sm">
                            <span className="text-slate-400">Charge: </span>
                            <span className="text-green-500">{formatCurrency(delivery.deliveryCharge)}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {delivery.paymentMethod}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      
                      <td className="p-3">
                        <div className="flex gap-2">
                          {delivery.status === 'pending' && (
                            <button
                              onClick={() => handleAssignDelivery(delivery._id)}
                              className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded"
                              title="Assign"
                            >
                              <User size={14} />
                            </button>
                          )}
                          
                          {delivery.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(delivery._id, 'in_transit')}
                              className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded"
                              title="Start Delivery"
                            >
                              <Truck size={14} />
                            </button>
                          )}
                          
                          {delivery.status === 'in_transit' && (
                            <button
                              onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                              className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded"
                              title="Mark Delivered"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEditDelivery(delivery)}
                            className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteDelivery(delivery._id)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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

        {/* Couriers */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Couriers ({couriers.length})</h2>
            <button
              onClick={() => setShowCourierForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add Courier
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {couriers.map((courier) => (
              <div key={courier._id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">{courier.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        courier.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {courier.status}
                      </span>
                      <span className="text-sm text-slate-400">{courier.vehicleType}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditCourier(courier)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-500" />
                    {courier.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-slate-500" />
                    {courier.vehicleNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <Home size={14} className="text-slate-500" />
                    <span className="truncate">{courier.address}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {couriers.length === 0 && (
              <div className="col-span-full p-6 text-center">
                <Truck className="mx-auto text-slate-600 mb-3" size={40} />
                <p className="text-slate-400">No couriers added</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Form Modal */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{selectedDelivery ? "Edit Delivery" : "New Delivery"}</h2>
                <button
                  onClick={() => {
                    setShowDeliveryForm(false);
                    setSelectedDelivery(null);
                  }}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleDeliverySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={deliveryForm.customerName}
                    onChange={handleDeliveryInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    value={deliveryForm.customerPhone}
                    onChange={handleDeliveryInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Address *</label>
                  <textarea
                    name="customerAddress"
                    rows="2"
                    required
                    value={deliveryForm.customerAddress}
                    onChange={handleDeliveryInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Package Type</label>
                    <select
                      name="packageType"
                      value={deliveryForm.packageType}
                      onChange={handleDeliveryInput}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="parcel">Parcel</option>
                      <option value="document">Document</option>
                      <option value="fragile">Fragile</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Delivery Charge</label>
                    <input
                      type="number"
                      name="deliveryCharge"
                      value={deliveryForm.deliveryCharge}
                      onChange={handleDeliveryInput}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeliveryForm(false);
                      setSelectedDelivery(null);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deliveryMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                  >
                    {deliveryMutation.isLoading && <Loader2 className="animate-spin" size={16} />}
                    {selectedDelivery ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Courier Form Modal */}
      {showCourierForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{selectedCourier ? "Edit Courier" : "Add Courier"}</h2>
                <button
                  onClick={() => {
                    setShowCourierForm(false);
                    setSelectedCourier(null);
                  }}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCourierSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={courierForm.name}
                    onChange={handleCourierInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={courierForm.phone}
                    onChange={handleCourierInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={courierForm.vehicleType}
                      onChange={handleCourierInput}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="bike">Bike</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Vehicle Number *</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      required
                      value={courierForm.vehicleNumber}
                      onChange={handleCourierInput}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Address</label>
                  <textarea
                    name="address"
                    rows="2"
                    value={courierForm.address}
                    onChange={handleCourierInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourierForm(false);
                      setSelectedCourier(null);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={courierMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                  >
                    {courierMutation.isLoading && <Loader2 className="animate-spin" size={16} />}
                    {selectedCourier ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Form Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-sm">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Assign Delivery</h2>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Select Courier *</label>
                  <select
                    name="courierId"
                    required
                    value={assignForm.courierId}
                    onChange={handleAssignInput}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Select a courier</option>
                    {couriers.map(courier => (
                      <option key={courier._id} value={courier._id}>
                        {courier.name} ({courier.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignForm(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                  >
                    {assignMutation.isLoading && <Loader2 className="animate-spin" size={16} />}
                    Assign
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