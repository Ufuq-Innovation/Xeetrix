"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toPng } from 'html-to-image';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  X, Plus, Trash2, TrendingUp, Search, 
  PieChart as PieIcon, Activity, ShoppingBag, CreditCard, ArrowUpRight,
  Globe, Store, Printer, Download, Eye, Truck, CheckCircle2, Clock, 
  Image as ImageIcon, Wallet, Calendar, CalendarDays, Filter, ChevronDown,
  Users, Package, DollarSign, BarChart3, TrendingDown
} from "lucide-react";

// ✅ Simple Date Picker Component (no external dependencies)
const SimpleDatePicker = ({ date, onChange }) => {
  return (
    <input
      type="date"
      value={date}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 bg-[#1a2230] border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
    />
  );
};

// ✅ Custom Date Range Picker Component
const CustomDateRangePicker = ({ 
  isOpen, 
  onClose, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  onApply 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <Calendar size={28} className="text-blue-500" />
              Select Custom Date Range
            </h3>
            <p className="text-slate-400 text-sm mt-1">Choose start and end dates</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl text-slate-400 transition-all"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Start Date</label>
            <SimpleDatePicker 
              date={startDate} 
              onChange={onStartDateChange} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">End Date</label>
            <SimpleDatePicker 
              date={endDate} 
              onChange={onEndDateChange} 
            />
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 mb-1">Selected Range</p>
            <p className="text-lg font-black text-white">
              {startDate} to {endDate}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 transition-all flex items-center gap-2"
          >
            <CalendarDays size={16} />
            Apply Date Range
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions to replace date-fns
const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd') return `${year}-${month}-${day}`;
  if (formatStr === 'dd/MM/yyyy') return `${day}/${month}/${year}`;
  if (formatStr === 'dd MMM') return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
  if (formatStr === 'dd MMM, yyyy') return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}, ${year}`;
  if (formatStr === 'EEEE, dd MMMM, yyyy') {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${days[d.getDay()]}, ${day} ${months[d.getMonth()]}, ${year}`;
  }
  if (formatStr === 'hh:mm a') {
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return `${day}/${month}/${year}`;
};

const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const startOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() + (day === 0 ? 0 : 7 - day);
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfMonth = (date) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfYear = (date) => {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfYear = (date) => {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export default function UnifiedDashboard() {
  const { theme, lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const receiptRef = useRef(null);
  
  const [mounted, setMounted] = useState(false);
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredData, setFilteredData] = useState(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // ✅ Custom Date Range State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(formatDate(subDays(new Date(), 7)));
  const [customEndDate, setCustomEndDate] = useState(formatDate(new Date()));
  
  // POS Drawer States
  const [transactionType, setTransactionType] = useState("online");
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paidAmount, setPaidAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 });
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [expenses, setExpenses] = useState({ discount: '', courier: '' });
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ Order Drawer Date State
  const [orderDate, setOrderDate] = useState(formatDate(new Date()));

  useEffect(() => { setMounted(true); }, []);

  const currency = useMemo(() => (typeof ctxCurrency === 'object' ? ctxCurrency.symbol : ctxCurrency) || "৳", [ctxCurrency]);

  // --- API Data Fetching ---
  const { data: dashboardData, isLoading: isLoadingDashboard, refetch: refetchDashboard } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => fetch('/api/dashboard').then(res => res.json()),
    refetchOnWindowFocus: false
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()).then(d => d.products || []),
    enabled: false // Disable for now to avoid errors
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        return data.success ? data.products : [];
      } catch (error) {
        console.error('Inventory fetch error:', error);
        return []; // Return empty array on error
      }
    },
    enabled: false // Disable for now
  });

  // ✅ Enhanced Time Filter Handler with Custom Date Range
  const handleTimeFilter = async (period) => {
    const periodLower = period.toLowerCase();
    setActiveFilter(periodLower);
    
    if (periodLower === 'custom') {
      setShowDatePicker(true);
      return;
    }
    
    setIsFilterLoading(true);
    
    let startDate, endDate;
    const now = new Date();
    
    switch(periodLower) {
      case 'today':
        startDate = formatDate(new Date());
        endDate = formatDate(new Date());
        toast.success('Today\'s data selected');
        break;
      case 'week':
        startDate = formatDate(startOfWeek(now));
        endDate = formatDate(endOfWeek(now));
        toast.success('This week\'s data selected');
        break;
      case 'month':
        startDate = formatDate(startOfMonth(now));
        endDate = formatDate(endOfMonth(now));
        toast.success('This month\'s data selected');
        break;
      case 'year':
        startDate = formatDate(startOfYear(now));
        endDate = formatDate(endOfYear(now));
        toast.success('This year\'s data selected');
        break;
      default:
        startDate = null;
        endDate = null;
        toast.success('All data selected');
    }
    
    try {
      await fetchFilteredData(periodLower, startDate, endDate);
    } catch (error) {
      toast.error('Failed to fetch filtered data');
    } finally {
      setIsFilterLoading(false);
    }
  };

  // ✅ Apply Custom Date Range
  const applyCustomDateRange = async () => {
    if (customStartDate && customEndDate) {
      setShowDatePicker(false);
      setActiveFilter('custom');
      setIsFilterLoading(true);
      
      try {
        await fetchFilteredData('custom', customStartDate, customEndDate);
        toast.success(`Custom range: ${customStartDate} - ${customEndDate}`);
      } catch (error) {
        toast.error('Failed to fetch filtered data');
      } finally {
        setIsFilterLoading(false);
      }
    }
  };

  // ✅ Fetch Filtered Data Function
  const fetchFilteredData = async (period, startDate = null, endDate = null) => {
    try {
      let url = `/api/dashboard?period=${period}`;
      
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      setFilteredData(data);
    } catch (error) {
      throw error;
    }
  };

  // ✅ Clear Custom Filter
  const clearFilter = () => {
    setActiveFilter('all');
    setFilteredData(null);
    toast.success('All data selected');
  };

  // --- Safe Stats Logic ---
  const stats = useMemo(() => {
    const dataToUse = filteredData || dashboardData;
    
    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };
    
    const currentData = dataToUse?.summary || {};
    const previousData = dashboardData?.previousPeriod || {};
    
    return {
      totalSales: currentData.totalSales ?? 0,
      netProfit: currentData.netProfit ?? 0,
      totalDue: currentData.totalDue ?? 0,
      totalExpense: currentData.totalExpense ?? 0,
      totalOrders: currentData.totalOrders ?? 0,
      averageOrderValue: currentData.averageOrderValue ?? 0,
      conversionRate: currentData.conversionRate ?? 0,
      cashInHand: currentData.cashInHand ?? 0,
      totalProducts: currentData.totalProducts ?? 0,
      totalCustomers: currentData.totalCustomers ?? 0,
      
      // Percentage Changes
      salesChange: calculateChange(currentData.totalSales || 0, previousData.totalSales || 0),
      profitChange: calculateChange(currentData.netProfit || 0, previousData.netProfit || 0),
      ordersChange: calculateChange(currentData.totalOrders || 0, previousData.totalOrders || 0),
      aovChange: calculateChange(currentData.averageOrderValue || 0, previousData.averageOrderValue || 0),
    };
  }, [dashboardData, filteredData]);

  // --- POS Drawer Functions ---
  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  useEffect(() => {
    if (showOrderDrawer) {
      setOrderId(generateId(transactionType));
      if (transactionType === "offline") {
        setPaymentStatus("Paid");
      } else {
        setPaymentStatus("COD");
      }
      // Set current date as default
      setOrderDate(formatDate(new Date()));
    }
  }, [showOrderDrawer, transactionType]);

  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const totalSell = subTotal - disc + cour;
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    const isConfirmedSell = (transactionType === "offline") || (paymentStatus === "Paid");
    const netProfit = isConfirmedSell ? ((subTotal - disc) - totalCost) : 0;

    return { 
      subTotal, 
      totalCost,
      totalSell, 
      netProfit, 
      dueAmount: (totalSell - currentPaid), 
      currentPaid, 
      isConfirmedSell 
    };
  }, [cart, expenses, transactionType, paymentStatus, paidAmount]);

  const downloadReceiptImage = async () => {
    if (receiptRef.current === null) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `INV-${lastSavedOrder?.orderId || 'POS'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded successfully");
    } catch (err) {
      toast.error("Failed to export image");
    }
  };

  const createOrderMutation = useMutation({
    mutationFn: async (newOrder) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboardStats']);
      setLastSavedOrder({ ...data.order });
      setShowReceipt(true);
      resetForm();
      toast.success("Transaction completed successfully");
    },
    onError: (error) => {
      toast.error("Transaction failed");
    }
  });

  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setExpenses({ discount: '', courier: '' });
    setPaidAmount("");
    setSearchQuery("");
    setOrderId(generateId(transactionType));
    setOrderDate(formatDate(new Date()));
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product._id);
    if (exists) {
      setCart(cart.map(item => item.id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { 
        id: product._id, 
        name: product.name, 
        price: product.sellingPrice, 
        qty: 1, 
        cost: product.costPrice || 0,
        stock: product.stock || 0
      }]);
    }
    setSearchQuery("");
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const updateCartQty = (id, newQty) => {
    if (newQty < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  // Chart Colors and Data
  const COLORS = ['#3b82f6', '#ec4899', '#eab308', '#10b981', '#8b5cf6'];
  const salesData = filteredData?.salesTrend || dashboardData?.salesTrend || [];
  const expenseData = filteredData?.expenseDistribution || dashboardData?.expenseDistribution || [];

  // Loading State
  if (!mounted || isLoadingDashboard) {
    return (
      <div className={`p-8 flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-[#090E14]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 space-y-10 max-w-[1600px] mx-auto text-slate-200 ${theme === 'dark' ? 'bg-[#090E14]' : 'bg-gray-50'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-500/20">
              <Activity className="text-white" size={32} />
            </div>
            Intelligence
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 ml-1">
            Live Business Control Room
          </p>
        </div>
        <button 
          onClick={() => setShowOrderDrawer(true)}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 px-10 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          Create New Order
        </button>
      </div>

      {/* ✅ Enhanced Time Filter Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 p-6 rounded-3xl border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-3">
              <Filter size={20} className="text-blue-500" />
              Data Filter
            </h2>
            <p className="text-slate-400 text-sm mt-1">Select time period</p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeFilter === 'custom' && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 text-xs font-bold bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-all flex items-center gap-2"
              >
                <X size={14} />
                Clear Filter
              </button>
            )}
            
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase">Active Filter</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-blue-500">
                  {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                </p>
                {activeFilter === 'custom' && (
                  <span className="text-xs text-slate-400 px-2 py-1 bg-white/5 rounded-lg">
                    {customStartDate} - {customEndDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {['All', 'Today', 'Week', 'Month', 'Year', 'Custom'].map((period) => (
            <button
              key={period}
              onClick={() => handleTimeFilter(period)}
              disabled={isFilterLoading}
              className={`
                px-6 py-3 rounded-xl text-sm font-black uppercase transition-all duration-300 
                flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${activeFilter === period.toLowerCase() 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                }
                ${period === 'Custom' ? 'border border-blue-500/30' : ''}
              `}
            >
              {period === 'Custom' ? <Calendar size={16} /> : 
               period === 'Today' ? <Clock size={16} /> :
               period === 'Week' ? <CalendarDays size={16} /> :
               period === 'Month' ? <CalendarDays size={16} /> :
               <Filter size={16} />}
              
              {period}
              
              {activeFilter === period.toLowerCase() && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
          
          {isFilterLoading && (
            <div className="px-6 py-3 rounded-xl bg-white/5 text-slate-400 text-sm font-bold flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* ✅ Custom Date Range Picker Modal */}
      <CustomDateRangePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        startDate={customStartDate}
        endDate={customEndDate}
        onStartDateChange={setCustomStartDate}
        onEndDateChange={setCustomEndDate}
        onApply={applyCustomDateRange}
      />

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-900/5 p-6 rounded-3xl border border-blue-500/20 shadow-lg shadow-blue-500/10 transition-all hover:shadow-blue-500/20 hover:border-blue-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl">
              <ShoppingBag className="text-blue-500" size={24} />
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${stats.salesChange >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {stats.salesChange >= 0 ? '+' : ''}{stats.salesChange}%
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Revenue
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-3xl font-black italic text-white">
              {(stats.totalSales ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-emerald-900/5 p-6 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10 transition-all hover:shadow-emerald-500/20 hover:border-emerald-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${stats.profitChange >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {stats.profitChange >= 0 ? '+' : ''}{stats.profitChange}%
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Net Profit
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-3xl font-black italic text-white">
              {(stats.netProfit ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-purple-900/5 p-6 rounded-3xl border border-purple-500/20 shadow-lg shadow-purple-500/10 transition-all hover:shadow-purple-500/20 hover:border-purple-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl">
              <Package className="text-purple-500" size={24} />
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${stats.ordersChange >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange}%
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Orders
          </h4>
          <p className="text-3xl font-black italic text-white">
            {(stats.totalOrders ?? 0).toLocaleString()}
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-900/5 p-6 rounded-3xl border border-amber-500/20 shadow-lg shadow-amber-500/10 transition-all hover:shadow-amber-500/20 hover:border-amber-500/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl">
              <CreditCard className="text-amber-500" size={24} />
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${stats.aovChange >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {stats.aovChange >= 0 ? '+' : ''}{stats.aovChange}%
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Average Order Value
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-3xl font-black italic text-white">
              {(stats.averageOrderValue ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Due */}
        <div className="bg-gradient-to-br from-red-500/10 via-red-600/5 to-red-900/5 p-6 rounded-3xl border border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-2xl">
              <CreditCard className="text-red-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-red-500/20 text-red-500 rounded-full">
              Due
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Due
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-2xl font-black italic text-white">
              {(stats.totalDue ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Cash in Hand */}
        <div className="bg-gradient-to-br from-green-500/10 via-green-600/5 to-green-900/5 p-6 rounded-3xl border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-2xl">
              <Wallet className="text-green-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-green-500/20 text-green-500 rounded-full">
              Available
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Cash in Hand
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold opacity-50">{currency}</span>
            <p className="text-2xl font-black italic text-white">
              {(stats.cashInHand ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-indigo-900/5 p-6 rounded-3xl border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <Package className="text-indigo-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-indigo-500/20 text-indigo-500 rounded-full">
              Products
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Products
          </h4>
          <p className="text-2xl font-black italic text-white">
            {(stats.totalProducts ?? 0).toLocaleString()}
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-gradient-to-br from-pink-500/10 via-pink-600/5 to-pink-900/5 p-6 rounded-3xl border border-pink-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-500/20 rounded-2xl">
              <Users className="text-pink-500" size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-pink-500/20 text-pink-500 rounded-full">
              Customers
            </span>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Total Customers
          </h4>
          <p className="text-2xl font-black italic text-white">
            {(stats.totalCustomers ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Performance Chart */}
        <div className="xl:col-span-2 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <BarChart3 size={24} className="text-blue-500" />
              Sales Performance
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-bold text-slate-400">
                {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Period
              </span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${currency}${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${currency}${value.toLocaleString()}`, 'Sales']}
                  contentStyle={{ 
                    backgroundColor: '#11161D', 
                    border: '1px solid #ffffff10', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  fill="url(#colorSales)" 
                  strokeWidth={3}
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-3 mb-8">
              <PieIcon size={24} className="text-pink-500" /> 
              Expense Distribution
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${currency}${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: '#11161D', 
                      border: '1px solid #ffffff10', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Total Expenses
              </span>
              <span className="font-black text-xl text-white">
                {currency}{(stats.totalExpense ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Pending Orders
            </h4>
            <span className="text-[10px] font-bold px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full">
              {filteredData?.statusCounts?.pending || dashboardData?.statusCounts?.pending || 0}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <span className="text-sm font-medium text-slate-300">COD Pending</span>
              <span className="font-bold text-white">
                {currency}{filteredData?.summary?.codPending || dashboardData?.summary?.codPending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <span className="text-sm font-medium text-slate-300">Processing</span>
              <span className="font-bold text-blue-500">
                {filteredData?.statusCounts?.processing || dashboardData?.statusCounts?.processing || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 rounded-3xl border border-white/5">
          <h4 className="text-sm font-black text-white flex items-center gap-2 mb-6">
            <Activity size={18} className="text-emerald-500" />
            Quick Stats
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                Low Stock
              </p>
              <p className="text-2xl font-black text-amber-500">
                {filteredData?.alerts?.lowStockCount || dashboardData?.alerts?.lowStockCount || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                Conversion Rate
              </p>
              <p className="text-2xl font-black text-white">
                {(stats.conversionRate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                Returns
              </p>
              <p className="text-2xl font-black text-red-500">
                {filteredData?.statusCounts?.returned || dashboardData?.statusCounts?.returned || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                Delivered
              </p>
              <p className="text-2xl font-black text-emerald-500">
                {filteredData?.statusCounts?.delivered || dashboardData?.statusCounts?.delivered || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Eye size={18} className="text-blue-500" />
              Recent Activity
            </h4>
            <span className="text-[10px] font-bold text-blue-500 animate-pulse">
              Live
            </span>
          </div>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {(filteredData?.recentActivity || dashboardData?.recentActivity || []).slice(0, 4).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-blue-500/20' : idx === 1 ? 'bg-emerald-500/20' : idx === 2 ? 'bg-purple-500/20' : 'bg-amber-500/20'}`}>
                  {activity.type === 'order' ? <ShoppingBag size={16} /> : 
                   activity.type === 'payment' ? <CreditCard size={16} /> : 
                   <Package size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.description}</p>
                  <p className="text-[10px] font-bold text-slate-400">{activity.time}</p>
                </div>
                <span className={`text-xs font-bold ${activity.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {activity.amount >= 0 ? '+' : ''}{currency}{Math.abs(activity.amount)?.toLocaleString()}
                </span>
              </div>
            ))}
            {(filteredData?.recentActivity || dashboardData?.recentActivity || []).length === 0 && (
              <p className="text-center text-slate-400 py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* POS Drawer */}
      {showOrderDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowOrderDrawer(false)} />
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#090E14] to-[#11161D] h-full shadow-2xl p-6 md:p-12 overflow-y-auto border-l border-white/5 animate-in slide-in-from-right duration-300">
            
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  New POS Order
                </h2>
                <p className="text-[10px] font-bold text-blue-500 uppercase mt-1 tracking-widest">
                  Transaction Mode
                </p>
              </div>
              <button 
                onClick={() => setShowOrderDrawer(false)} 
                className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all"
              >
                <X size={28}/>
              </button>
            </div>

            <div className="space-y-10">
              {/* Transaction Type */}
              <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5 w-full max-w-xs">
                <button 
                  onClick={() => setTransactionType("online")} 
                  className={`flex-1 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'online' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Online
                </button>
                <button 
                  onClick={() => setTransactionType("offline")} 
                  className={`flex-1 px-6 py-2 rounded-xl text-xs font-black transition-all ${transactionType === 'offline' ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Offline
                </button>
              </div>

              {/* Order ID and Date Row */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="font-mono text-sm font-black text-blue-500 bg-blue-500/10 px-6 py-3 rounded-xl border border-blue-500/20 inline-block">
                  {orderId}
                </div>
                
                {/* ✅ Date Picker for Order */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    <Calendar size={16} />
                    <span>Order Date</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="px-4 py-3 bg-[#1a2230] border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                    />
                    <button
                      onClick={() => setOrderDate(formatDate(new Date()))}
                      className="px-4 py-3 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 rounded-xl text-sm font-bold transition-all"
                    >
                      Today
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    {formatDate(orderDate, 'EEEE, dd MMMM, yyyy')}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Phone *
                  </label>
                  <input 
                    className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                    placeholder="01XXXXXXXXX" 
                    value={customerInfo.phone} 
                    onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    Name
                  </label>
                  <input 
                    className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                    placeholder="Customer Name" 
                    value={customerInfo.name} 
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                  />
                </div>
                
                {transactionType === "online" && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        Address
                      </label>
                      <textarea 
                        className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none min-h-[100px] focus:border-blue-500 transition-all" 
                        placeholder="Full delivery address" 
                        value={customerInfo.address} 
                        onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        Platform
                      </label>
                      <select 
                        value={orderSource} 
                        onChange={e => setOrderSource(e.target.value)} 
                        className="w-full px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Facebook">Facebook</option>
                        <option value="Website">Website</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        Payment Status
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                          value={paymentStatus} 
                          onChange={e => setPaymentStatus(e.target.value)} 
                          className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="COD">COD</option>
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                          <option value="Due">Due</option>
                        </select>
                        
                        {paymentStatus === "Partial" && (
                          <div className="relative flex-1 animate-in slide-in-from-right-2 duration-300">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                            <input 
                              type="number" 
                              className="w-full px-12 py-4 bg-[#1a2230] border border-emerald-500/30 rounded-2xl text-sm font-black outline-none focus:border-emerald-500 transition-all" 
                              placeholder="Paid Amount" 
                              value={paidAmount} 
                              onChange={e => setPaidAmount(e.target.value)} 
                              min="0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Product Search */}
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  className="w-full px-16 py-6 bg-[#11161D] border border-white/5 rounded-3xl text-sm font-bold outline-none focus:border-blue-500/50 transition-all" 
                  placeholder="Search products to add"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery && (
                  <div className="absolute top-full left-0 w-full bg-[#1a2230] mt-4 rounded-3xl border border-white/10 overflow-hidden z-50 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                    <div className="p-5 text-center text-slate-400">
                      Product search will be available with backend integration
                    </div>
                  </div>
                )}
              </div>

              {/* Product Selection */}
              <div className="mt-8 p-6 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <select 
                    className="flex-1 px-5 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                    value={selectedProduct.id} 
                    onChange={e => {
                      // Mock product selection
                      setSelectedProduct({ 
                        id: 'mock-1', 
                        name: 'Sample Product', 
                        qty: 1, 
                        stock: 10, 
                        price: 1000, 
                        cost: 700 
                      });
                    }}
                  >
                    <option value="">Select Product (Mock Data)</option>
                    <option value="mock-1">Sample Product - ৳1000 (Stock: 10)</option>
                    <option value="mock-2">Premium Product - ৳2500 (Stock: 5)</option>
                    <option value="mock-3">Basic Product - ৳500 (Stock: 20)</option>
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedProduct({...selectedProduct, qty: Math.max(1, selectedProduct.qty - 1)})}
                      className="px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-all"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      className="w-20 px-4 py-4 bg-[#1a2230] border border-white/10 rounded-2xl text-center font-black outline-none focus:border-blue-500 transition-all" 
                      value={selectedProduct.qty} 
                      min="1"
                      onChange={e => setSelectedProduct({...selectedProduct, qty: Math.max(1, Number(e.target.value))})} 
                    />
                    <button 
                      onClick={() => setSelectedProduct({...selectedProduct, qty: selectedProduct.qty + 1})}
                      className="px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => { 
                      if (!selectedProduct.id) return; 
                      setCart([...cart, {...selectedProduct}]); 
                      setSelectedProduct({ id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 }); 
                    }} 
                    disabled={!selectedProduct.id}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white font-black hover:from-blue-700 hover:to-blue-900 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                {/* Cart Items */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag size={48} className="text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">Cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group">
                        <div className="flex-1">
                          <p className="font-black text-white uppercase">{item.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateCartQty(item.id, item.qty - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-xs"
                              >
                                -
                              </button>
                              <span className="text-sm text-slate-300 min-w-[40px] text-center">{item.qty}</span>
                              <button 
                                onClick={() => updateCartQty(item.id, item.qty + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-xs"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm text-slate-400">
                              {currency}{item.price} × {item.qty} = {currency}{(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="p-3 hover:bg-red-500/20 rounded-xl text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary and Expenses */}
                <div className="border-t border-white/5 pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                        Discount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">-</span>
                        <input 
                          type="number" 
                          placeholder="0" 
                          className="w-full pl-10 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" 
                          value={expenses.discount} 
                          onChange={e => setExpenses({...expenses, discount: e.target.value})} 
                          min="0"
                        />
                      </div>
                    </div>
                    
                    {transactionType === "online" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Courier
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">+</span>
                          <input 
                            type="number" 
                            placeholder="0" 
                            className="w-full pl-10 pr-4 py-4 bg-black/20 border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" 
                            value={expenses.courier} 
                            onChange={e => setExpenses({...expenses, courier: e.target.value})} 
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-bold text-white">{currency}{summary.subTotal.toLocaleString()}</span>
                    </div>
                    
                    {expenses.discount && Number(expenses.discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Discount</span>
                        <span className="font-bold text-red-500">-{currency}{Number(expenses.discount).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {transactionType === "online" && expenses.courier && Number(expenses.courier) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Courier</span>
                        <span className="font-bold text-blue-500">+{currency}{Number(expenses.courier).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-white/5 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-white">Total</span>
                        <span className="text-2xl font-black text-white">{currency}{summary.totalSell.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-400">Profit</span>
                        <span className={`font-bold ${summary.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {currency}{summary.netProfit.toLocaleString()}
                        </span>
                      </div>
                      
                      {paymentStatus !== "Paid" && transactionType !== "offline" && (
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-slate-400">Due</span>
                          <span className="font-bold text-amber-500">{currency}{summary.dueAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={() => {
                  if (!customerInfo.phone) {
                    toast.error("Phone number is required");
                    return;
                  }
                  
                  if (cart.length === 0) {
                    toast.error("Cart is empty");
                    return;
                  }
                  
                  // Create mock order for demo
                  const mockOrder = {
                    orderId,
                    transactionType,
                    orderSource,
                    paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                    customerName: customerInfo.name,
                    customerPhone: customerInfo.phone,
                    customerAddress: customerInfo.address,
                    products: cart,
                    discount: Number(expenses.discount) || 0,
                    courier: transactionType === "online" ? (Number(expenses.courier) || 0) : 0,
                    totalSell: summary.totalSell,
                    netProfit: summary.netProfit,
                    dueAmount: summary.dueAmount,
                    paidAmount: summary.currentPaid,
                    isConfirmedSell: summary.isConfirmedSell,
                    orderDate: orderDate,
                    createdAt: new Date().toISOString()
                  };
                  
                  setLastSavedOrder(mockOrder);
                  setShowReceipt(true);
                  resetForm();
                  toast.success("Order created successfully (Demo)");
                }} 
                disabled={cart.length === 0}
                className={`w-full mt-8 py-6 rounded-3xl font-black uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed
                  ${transactionType === 'offline' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-900' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-blue-600/20 hover:from-blue-700 hover:to-blue-900'
                  }`}
              >
                {transactionType === 'offline' ? (
                  <>
                    <CheckCircle2 size={20} />
                    Confirm Sale (Demo)
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Create Order (Demo)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden text-slate-900 shadow-2xl animate-in zoom-in duration-300">
            <div ref={receiptRef} className="p-8 bg-white">
              <div className="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6">
                <h2 className="text-2xl font-black italic tracking-tighter text-blue-600">Xeetrix Control Room</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">{lastSavedOrder?.orderId || 'N/A'}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {formatDate(new Date(lastSavedOrder?.createdAt || new Date()), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-700 mb-2">Customer Info</h3>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600">
                    <span className="font-bold">Name:</span> {lastSavedOrder?.customerName || 'N/A'}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    <span className="font-bold">Phone:</span> {lastSavedOrder?.customerPhone || 'N/A'}
                  </p>
                  {lastSavedOrder?.customerAddress && (
                    <p className="text-xs font-medium text-slate-600">
                      <span className="font-bold">Address:</span> {lastSavedOrder.customerAddress}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="space-y-2 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold">
                  <span>Subtotal</span>
                  <span>{currency}{(Number(lastSavedOrder?.totalSell) - (Number(lastSavedOrder?.courier) || 0) + (Number(lastSavedOrder?.discount) || 0)).toLocaleString()}</span>
                </div>
                
                {lastSavedOrder?.discount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-red-500">
                    <span>Discount</span>
                    <span>-{currency}{(Number(lastSavedOrder?.discount) || 0).toLocaleString()}</span>
                  </div>
                )}
                
                {lastSavedOrder?.courier > 0 && (
                  <div className="flex justify-between text-xs font-bold text-blue-500">
                    <span>Courier</span>
                    <span>+{currency}{(Number(lastSavedOrder?.courier) || 0).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between font-black text-xl tracking-tighter text-slate-900">
                  <span>Total</span>
                  <span>{currency}{(Number(lastSavedOrder?.totalSell) || 0).toLocaleString()}</span>
                </div>
                
                {lastSavedOrder?.dueAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-amber-600 pt-2">
                    <span>Due</span>
                    <span>{currency}{(Number(lastSavedOrder?.dueAmount) || 0).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xs font-bold text-emerald-600 pt-2">
                  <span>Profit</span>
                  <span>{currency}{(Number(lastSavedOrder?.netProfit) || 0).toLocaleString()}</span>
                </div>
              </div>
              
              <p className="text-center text-[8px] font-black text-slate-300 uppercase italic">
                Thank you for your business!
              </p>
              <p className="text-center text-[8px] font-black text-slate-400 uppercase mt-1">
                Verified
              </p>
            </div>
            
            <div className="p-6 bg-slate-100 grid grid-cols-2 gap-3 border-t border-slate-200">
              <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
              >
                <Printer size={14}/> Print
              </button>
              <button 
                onClick={downloadReceiptImage} 
                className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all hover:bg-blue-700"
              >
                <ImageIcon size={14}/> Save Image
              </button>
              <button 
                onClick={() => setShowReceipt(false)} 
                className="col-span-2 py-3 bg-white border border-slate-300 rounded-2xl font-black uppercase text-[10px] text-slate-500 hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}