"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Truck, Package, Clock, CheckCircle, XCircle, MapPin, User,
  Phone, DollarSign, Calendar, Search, Filter, RefreshCw,
  Loader2, Edit2, Trash2, Eye, PlusCircle, Download, Upload,
  Printer, QrCode, Bell, AlertCircle, TrendingUp, BarChart3,
  Users, Home, Navigation, Route, Mail, Map, Shield, Star,
  CreditCard, Wallet, Gift, Box, Archive, Settings, MoreVertical
} from "lucide-react";

export default function CourierPage() {
  const { t } = useTranslation("common");
  const { lang, currency } = useApp();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showCourierForm, setShowCourierForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [selectedForAssign, setSelectedForAssign] = useState([]);

  // Delivery form state
  const [deliveryForm, setDeliveryForm] = useState({
    orderId: `ORD-${Date.now().toString().slice(-6)}`,
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerCity: "",
    customerZone: "",
    packageType: "parcel",
    packageWeight: "1",
    packageValue: "500",
    deliveryCharge: "100",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    specialInstructions: "",
    deliveryDate: new Date().toISOString().split('T')[0],
    priority: "normal",
    assignedTo: "",
    pickupLocation: "Warehouse A"
  });

  // Courier form state
  const [courierForm, setCourierForm] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "bike",
    vehicleNumber: "",
    licenseNumber: "",
    nidNumber: "",
    address: "",
    status: "active",
    salaryType: "commission",
    commissionRate: "15",
    baseSalary: "0",
    joiningDate: new Date().toISOString().split('T')[0]
  });

  // Assign form state
  const [assignForm, setAssignForm] = useState({
    courierId: "",
    deliveryIds: [],
    pickupTime: new Date().toISOString().slice(0, 16),
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    notes: ""
  });

  /* ===================== INPUT HANDLERS ===================== */
  const handleDeliveryInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setDeliveryForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCourierInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCourierForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleAssignInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setAssignForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /* ===================== API CALLS ===================== */
  // Fetch deliveries - MOCK DATA
  const { 
    data: deliveriesData = { deliveries: [], success: true }, 
    isLoading: deliveriesLoading,
    refetch: refetchDeliveries 
  } = useQuery({
    queryKey: ["deliveries", activeTab, searchTerm],
    queryFn: async () => {
      // Mock data
      const mockDeliveries = [
        {
          _id: "1",
          orderId: "ORD-2024-001",
          customerName: "John Doe",
          customerPhone: "+8801712345678",
          customerAddress: "123 Main St, Dhaka",
          customerCity: "Dhaka",
          customerZone: "Gulshan",
          packageType: "parcel",
          packageWeight: "2",
          packageValue: "1500",
          deliveryCharge: "120",
          paymentMethod: "cash_on_delivery",
          paymentStatus: "pending",
          status: "pending",
          priority: "normal",
          deliveryDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          assignedCourier: null
        },
        {
          _id: "2",
          orderId: "ORD-2024-002",
          customerName: "Jane Smith",
          customerPhone: "+8801812345678",
          customerAddress: "456 Park Ave, Chittagong",
          customerCity: "Chittagong",
          customerZone: "Agrabad",
          packageType: "document",
          packageWeight: "0.5",
          packageValue: "500",
          deliveryCharge: "80",
          paymentMethod: "online",
          paymentStatus: "paid",
          status: "in_transit",
          priority: "express",
          deliveryDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          assignedCourier: { _id: "c1", name: "Rahim" }
        },
        {
          _id: "3",
          orderId: "ORD-2024-003",
          customerName: "Bob Johnson",
          customerPhone: "+8801912345678",
          customerAddress: "789 Road, Sylhet",
          customerCity: "Sylhet",
          customerZone: "Mirpur",
          packageType: "fragile",
          packageWeight: "5",
          packageValue: "3000",
          deliveryCharge: "200",
          paymentMethod: "cash_on_delivery",
          paymentStatus: "pending",
          status: "delivered",
          priority: "urgent",
          deliveryDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          assignedCourier: { _id: "c2", name: "Karim" }
        }
      ];

      // Filter based on activeTab
      let filtered = mockDeliveries;
      if (activeTab !== "all") {
        filtered = mockDeliveries.filter(d => 
          activeTab === "pending" ? d.status === "pending" :
          activeTab === "in-transit" ? d.status === "in_transit" :
          activeTab === "delivered" ? d.status === "delivered" :
          activeTab === "returned" ? d.status === "returned" : true
        );
      }

      // Filter based on searchTerm
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(d => 
          d.orderId.toLowerCase().includes(term) ||
          d.customerName.toLowerCase().includes(term) ||
          d.customerPhone.includes(term)
        );
      }

      return { 
        success: true, 
        deliveries: filtered,
        stats: {
          pendingDeliveries: mockDeliveries.filter(d => d.status === "pending").length,
          inTransitDeliveries: mockDeliveries.filter(d => d.status === "in_transit").length,
          deliveredToday: mockDeliveries.filter(d => d.status === "delivered").length,
          activeCouriers: 2
        }
      };
    }
  });

  // Fetch couriers - MOCK DATA
  const { 
    data: couriersData = { couriers: [], success: true }, 
    isLoading: couriersLoading 
  } = useQuery({
    queryKey: ["couriers"],
    queryFn: async () => {
      // Mock data
      const mockCouriers = [
        {
          _id: "c1",
          name: "Rahim Ahmed",
          phone: "+8801711111111",
          email: "rahim@example.com",
          vehicleType: "bike",
          vehicleNumber: "DHA-11-9999",
          licenseNumber: "LIC12345",
          nidNumber: "1234567890",
          address: "Mirpur, Dhaka",
          status: "active",
          salaryType: "commission",
          commissionRate: "15",
          baseSalary: "0",
          joiningDate: new Date(Date.now() - 90 * 86400000).toISOString(),
          totalDeliveries: 45,
          successfulDeliveries: 42
        },
        {
          _id: "c2",
          name: "Karim Khan",
          phone: "+8801722222222",
          email: "karim@example.com",
          vehicleType: "car",
          vehicleNumber: "CTG-22-8888",
          licenseNumber: "LIC67890",
          nidNumber: "0987654321",
          address: "Agrabad, Chittagong",
          status: "active",
          salaryType: "fixed",
          commissionRate: "0",
          baseSalary: "15000",
          joiningDate: new Date(Date.now() - 60 * 86400000).toISOString(),
          totalDeliveries: 32,
          successfulDeliveries: 30
        }
      ];

      return { 
        success: true, 
        couriers: mockCouriers,
        stats: {
          pendingDeliveries: 1,
          inTransitDeliveries: 1,
          deliveredToday: 1,
          activeCouriers: 2
        }
      };
    }
  });

  // Fetch stats
  const { 
    data: statsData = {} 
  } = useQuery({
    queryKey: ["courier-stats"],
    queryFn: async () => {
      return {
        success: true,
        stats: {
          pendingDeliveries: 1,
          inTransitDeliveries: 1,
          deliveredToday: 1,
          activeCouriers: 2,
          totalRevenue: 400,
          monthlyGrowth: "15%"
        }
      };
    }
  });

  const deliveries = deliveriesData.deliveries || [];
  const couriers = couriersData.couriers || [];
  const stats = statsData.stats || {};

  /* ===================== MUTATIONS ===================== */
  // Delivery mutation
  const deliveryMutation = useMutation({
    mutationFn: async (formData) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: selectedDelivery ? "Delivery updated" : "Delivery created" 
          });
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["deliveries"]);
      queryClient.invalidateQueries(["courier-stats"]);
      
      setShowDeliveryForm(false);
      setSelectedDelivery(null);
      setDeliveryForm({
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        customerCity: "",
        customerZone: "",
        packageType: "parcel",
        packageWeight: "1",
        packageValue: "500",
        deliveryCharge: "100",
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        specialInstructions: "",
        deliveryDate: new Date().toISOString().split('T')[0],
        priority: "normal",
        assignedTo: "",
        pickupLocation: "Warehouse A"
      });
      
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    }
  });

  // Courier mutation
  const courierMutation = useMutation({
    mutationFn: async (formData) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: selectedCourier ? "Courier updated" : "Courier added" 
          });
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["couriers"]);
      queryClient.invalidateQueries(["courier-stats"]);
      
      setShowCourierForm(false);
      setSelectedCourier(null);
      setCourierForm({
        name: "",
        phone: "",
        email: "",
        vehicleType: "bike",
        vehicleNumber: "",
        licenseNumber: "",
        nidNumber: "",
        address: "",
        status: "active",
        salaryType: "commission",
        commissionRate: "15",
        baseSalary: "0",
        joiningDate: new Date().toISOString().split('T')[0]
      });
      
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    }
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async (formData) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: "Deliveries assigned successfully" 
          });
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["deliveries"]);
      setShowAssignForm(false);
      setSelectedForAssign([]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    }
  });

  // Delete delivery mutation
  const deleteDeliveryMutation = useMutation({
    mutationFn: async (id) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: "Delivery deleted" 
          });
        }, 500);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["deliveries"]);
      queryClient.invalidateQueries(["courier-stats"]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    }
  });

  /* ===================== HANDLERS ===================== */
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
    if (!assignForm.courierId || assignForm.deliveryIds.length === 0) {
      toast.error("Please select courier and deliveries");
      return;
    }
    assignMutation.mutate(assignForm);
  };

  const handleEditDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryForm({
      orderId: delivery.orderId || "",
      customerName: delivery.customerName || "",
      customerPhone: delivery.customerPhone || "",
      customerAddress: delivery.customerAddress || "",
      customerCity: delivery.customerCity || "",
      customerZone: delivery.customerZone || "",
      packageType: delivery.packageType || "parcel",
      packageWeight: delivery.packageWeight || "1",
      packageValue: delivery.packageValue || "500",
      deliveryCharge: delivery.deliveryCharge || "100",
      paymentMethod: delivery.paymentMethod || "cash_on_delivery",
      paymentStatus: delivery.paymentStatus || "pending",
      specialInstructions: delivery.specialInstructions || "",
      deliveryDate: delivery.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      priority: delivery.priority || "normal",
      assignedTo: delivery.assignedTo || "",
      pickupLocation: delivery.pickupLocation || "Warehouse A"
    });
    setShowDeliveryForm(true);
  };

  const handleEditCourier = (courier) => {
    setSelectedCourier(courier);
    setCourierForm({
      name: courier.name || "",
      phone: courier.phone || "",
      email: courier.email || "",
      vehicleType: courier.vehicleType || "bike",
      vehicleNumber: courier.vehicleNumber || "",
      licenseNumber: courier.licenseNumber || "",
      nidNumber: courier.nidNumber || "",
      address: courier.address || "",
      status: courier.status || "active",
      salaryType: courier.salaryType || "commission",
      commissionRate: courier.commissionRate?.toString() || "15",
      baseSalary: courier.baseSalary || "0",
      joiningDate: courier.joiningDate?.split('T')[0] || new Date().toISOString().split('T')[0]
    });
    setShowCourierForm(true);
  };

  const handleAssignDelivery = (deliveryIds) => {
    setSelectedForAssign(deliveryIds);
    setAssignForm(prev => ({
      ...prev,
      deliveryIds: deliveryIds,
      courierId: couriers[0]?._id || "",
      pickupTime: new Date().toISOString().slice(0, 16),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      notes: ""
    }));
    setShowAssignForm(true);
  };

  const handleDeleteDelivery = (id) => {
    if (confirm("Are you sure you want to delete this delivery?")) {
      deleteDeliveryMutation.mutate(id);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      toast.success(`Status updated to ${status}`);
      queryClient.invalidateQueries(["deliveries"]);
      queryClient.invalidateQueries(["courier-stats"]);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  /* ===================== STATS CARDS ===================== */
  const statsCards = [
    {
      label: "Pending Deliveries",
      value: stats.pendingDeliveries || 0,
      icon: Package,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "In Transit",
      value: stats.inTransitDeliveries || 0,
      icon: Truck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Delivered Today",
      value: stats.deliveredToday || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Active Couriers",
      value: stats.activeCouriers || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  /* ===================== TABS ===================== */
  const tabs = [
    { id: "pending", label: "Pending", icon: Clock },
    { id: "in-transit", label: "In Transit", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle },
    { id: "returned", label: "Returned", icon: XCircle },
    { id: "all", label: "All", icon: Package }
  ];

  /* ===================== HELPER FUNCTIONS ===================== */
  const formatCurrency = (amount) => {
    return `৳ ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'partially_paid': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500';
      case 'express': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (deliveriesLoading) {
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
            <h1 className="text-3xl md:text-4xl font-black uppercase italic bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Courier & Delivery Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage deliveries, couriers, and track shipments in real-time
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCourierForm(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl flex items-center gap-2 border border-gray-700 transition-all duration-200"
            >
              <User size={18} />
              Add Courier
            </button>
            
            <button
              onClick={() => setShowDeliveryForm(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <PlusCircle size={18} />
              New Delivery
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={stat.color} size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Tabs */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, or Phone..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="px-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 appearance-none w-40"
                >
                  {tabs.map(tab => (
                    <option key={tab.id} value={tab.id}>{tab.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter size={16} className="text-slate-500" />
                </div>
              </div>
              
              <button
                onClick={() => refetchDeliveries()}
                className="px-5 py-3.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all duration-200"
                title="Refresh"
              >
                <RefreshCw size={18} className={deliveriesLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Deliveries</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                {deliveries.length} deliveries
              </span>
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <Settings size={18} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {deliveries.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto text-gray-600 mb-4" size={60} />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Deliveries Found
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  {searchTerm ? "No results match your search" : "Get started by creating your first delivery"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowDeliveryForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200"
                  >
                    Create First Delivery
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="p-4 text-left text-slate-400 font-medium">Order ID</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Customer</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Package</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Payment</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Delivery</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Status</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery._id} className="border-t border-gray-800 hover:bg-gray-900/30 transition-all duration-150">
                      <td className="p-4">
                        <div className="font-mono font-bold text-white bg-gray-900 px-3 py-1.5 rounded-lg inline-block">
                          {delivery.orderId}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {formatDate(delivery.createdAt)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-white">{delivery.customerName}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                            <Phone size={12} />
                            {delivery.customerPhone}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[180px] mt-1">
                            <MapPin size={10} className="inline mr-1" />
                            {delivery.customerAddress}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                              {delivery.packageType.toUpperCase()}
                            </div>
                            <div className="text-sm text-slate-300">
                              {delivery.packageWeight} kg
                            </div>
                          </div>
                          <div className="text-sm text-green-500 font-medium">
                            {formatCurrency(delivery.packageValue)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-2">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(delivery.paymentStatus)}`}>
                            {delivery.paymentStatus.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="text-sm font-bold text-white">
                            Charge: {formatCurrency(delivery.deliveryCharge)}
                          </div>
                          <div className="text-xs text-slate-400 capitalize flex items-center gap-1">
                            <CreditCard size={10} />
                            {delivery.paymentMethod.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="text-sm flex items-center gap-2">
                            <Calendar size={14} className="text-slate-500" />
                            <span className="text-white">{formatDate(delivery.deliveryDate)}</span>
                          </div>
                          {delivery.priority !== 'normal' && (
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                              {delivery.priority.toUpperCase()}
                            </span>
                          )}
                          {delivery.assignedCourier && (
                            <div className="text-xs text-blue-400 flex items-center gap-1">
                              <User size={12} />
                              {delivery.assignedCourier.name}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-2">
                          {delivery.status === 'pending' && (
                            <button
                              onClick={() => handleAssignDelivery([delivery._id])}
                              className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-all duration-200"
                              title="Assign"
                            >
                              <User size={16} />
                            </button>
                          )}
                          
                          {delivery.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(delivery._id, 'in_transit')}
                              className="p-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-all duration-200"
                              title="Start Delivery"
                            >
                              <Truck size={16} />
                            </button>
                          )}
                          
                          {delivery.status === 'in_transit' && (
                            <button
                              onClick={() => handleStatusUpdate(delivery._id, 'delivered')}
                              className="p-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg transition-all duration-200"
                              title="Mark as Delivered"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEditDelivery(delivery)}
                            className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg transition-all duration-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteDelivery(delivery._id)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all duration-200"
                            title="Delete"
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

        {/* Couriers Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Couriers</h2>
              <p className="text-slate-400 text-sm mt-1">Manage your delivery partners</p>
            </div>
            <button
              onClick={() => setShowCourierForm(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <PlusCircle size={18} />
              Add Courier
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {couriers.map((courier) => (
              <div key={courier._id} className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{courier.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        courier.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {courier.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                      </span>
                      <span className="text-sm text-slate-400 capitalize px-2 py-1 bg-gray-800 rounded">
                        {courier.vehicleType}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditCourier(courier)}
                    className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-slate-500" />
                    <span className="text-slate-300">{courier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck size={16} className="text-slate-500" />
                    <span className="text-slate-300">{courier.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Home size={16} className="text-slate-500" />
                    <span className="text-slate-300 truncate">{courier.address}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-sm text-slate-400">Deliveries</p>
                    <p className="text-xl font-bold text-white">{courier.totalDeliveries || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Success Rate</p>
                    <p className="text-xl font-bold text-green-500">
                      {courier.totalDeliveries > 0 
                        ? `${Math.round((courier.successfulDeliveries / courier.totalDeliveries) * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {couriers.length === 0 && (
              <div className="col-span-full p-12 text-center">
                <Truck className="mx-auto text-gray-600 mb-4" size={60} />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Couriers Added
                </h3>
                <p className="text-slate-400 mb-6">
                  Add your first courier to start assigning deliveries
                </p>
                <button
                  onClick={() => setShowCourierForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200"
                >
                  Add First Courier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Form Modal */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedDelivery ? "Edit Delivery" : "New Delivery"}
                </h2>
                <button
                  onClick={() => {
                    setShowDeliveryForm(false);
                    setSelectedDelivery(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleDeliverySubmit}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Order ID *</label>
                      <input
                        type="text"
                        name="orderId"
                        required
                        value={deliveryForm.orderId}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="ORD-2024-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Priority</label>
                      <select
                        name="priority"
                        value={deliveryForm.priority}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="express">Express</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Customer Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={deliveryForm.customerName}
                      onChange={handleDeliveryInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Customer Phone *</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        required
                        value={deliveryForm.customerPhone}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="+8801712345678"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Customer City</label>
                      <input
                        type="text"
                        name="customerCity"
                        value={deliveryForm.customerCity}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="Dhaka"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Customer Address *</label>
                    <textarea
                      name="customerAddress"
                      rows="2"
                      required
                      value={deliveryForm.customerAddress}
                      onChange={handleDeliveryInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                      placeholder="Full address including area and landmark"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Package Type</label>
                      <select
                        name="packageType"
                        value={deliveryForm.packageType}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="parcel">Parcel</option>
                        <option value="document">Document</option>
                        <option value="fragile">Fragile</option>
                        <option value="electronics">Electronics</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="packageWeight"
                        value={deliveryForm.packageWeight}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="2.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Package Value</label>
                      <input
                        type="number"
                        name="packageValue"
                        value={deliveryForm.packageValue}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Delivery Charge</label>
                      <input
                        type="number"
                        name="deliveryCharge"
                        value={deliveryForm.deliveryCharge}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={deliveryForm.paymentMethod}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="cash_on_delivery">Cash on Delivery</option>
                        <option value="online">Online Payment</option>
                        <option value="card">Card Payment</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Delivery Date</label>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={deliveryForm.deliveryDate}
                        onChange={handleDeliveryInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Special Instructions</label>
                    <textarea
                      name="specialInstructions"
                      rows="2"
                      value={deliveryForm.specialInstructions}
                      onChange={handleDeliveryInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeliveryForm(false);
                        setSelectedDelivery(null);
                      }}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deliveryMutation.isLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                    >
                      {deliveryMutation.isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : null}
                      {selectedDelivery ? "Update Delivery" : "Create Delivery"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Courier Form Modal */}
      {showCourierForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedCourier ? "Edit Courier" : "Add New Courier"}
                </h2>
                <button
                  onClick={() => {
                    setShowCourierForm(false);
                    setSelectedCourier(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCourierSubmit}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={courierForm.name}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={courierForm.phone}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="+8801712345678"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={courierForm.email}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="courier@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Vehicle Type</label>
                      <select
                        name="vehicleType"
                        value={courierForm.vehicleType}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="bike">Bike</option>
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                        <option value="truck">Truck</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={courierForm.vehicleNumber}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="DHA-11-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">NID Number</label>
                      <input
                        type="text"
                        name="nidNumber"
                        value={courierForm.nidNumber}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Address</label>
                    <textarea
                      name="address"
                      rows="2"
                      value={courierForm.address}
                      onChange={handleCourierInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                      placeholder="Full residential address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Salary Type</label>
                      <select
                        name="salaryType"
                        value={courierForm.salaryType}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="commission">Commission Based</option>
                        <option value="fixed">Fixed Salary</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    
                    {courierForm.salaryType === 'commission' || courierForm.salaryType === 'mixed' ? (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Commission Rate (%)</label>
                        <input
                          type="number"
                          name="commissionRate"
                          value={courierForm.commissionRate}
                          onChange={handleCourierInputChange}
                          className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          placeholder="15"
                        />
                      </div>
                    ) : null}
                    
                    {courierForm.salaryType === 'fixed' || courierForm.salaryType === 'mixed' ? (
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Base Salary</label>
                        <input
                          type="number"
                          name="baseSalary"
                          value={courierForm.baseSalary}
                          onChange={handleCourierInputChange}
                          className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          placeholder="15000"
                        />
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Joining Date</label>
                      <input
                        type="date"
                        name="joiningDate"
                        value={courierForm.joiningDate}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Status</label>
                      <select
                        name="status"
                        value={courierForm.status}
                        onChange={handleCourierInputChange}
                        className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCourierForm(false);
                        setSelectedCourier(null);
                      }}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={courierMutation.isLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                    >
                      {courierMutation.isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : null}
                      {selectedCourier ? "Update Courier" : "Add Courier"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Form Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Assign Deliveries</h2>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAssignSubmit}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Select Courier *</label>
                    <select
                      name="courierId"
                      required
                      value={assignForm.courierId}
                      onChange={handleAssignInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value="">Select a courier</option>
                      {couriers.map(courier => (
                        <option key={courier._id} value={courier._id}>
                          {courier.name} ({courier.vehicleType})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Pickup Time *</label>
                    <input
                      type="datetime-local"
                      name="pickupTime"
                      required
                      value={assignForm.pickupTime}
                      onChange={handleAssignInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Estimated Delivery</label>
                    <input
                      type="datetime-local"
                      name="estimatedDelivery"
                      value={assignForm.estimatedDelivery}
                      onChange={handleAssignInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={assignForm.notes}
                      onChange={handleAssignInputChange}
                      className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                      placeholder="Any special instructions for the courier..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAssignForm(false)}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={assignMutation.isLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                    >
                      {assignMutation.isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : null}
                      Assign Deliveries
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}