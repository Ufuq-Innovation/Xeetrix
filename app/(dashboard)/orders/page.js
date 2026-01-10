"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toPng } from 'html-to-image'; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  X, Plus, Search, Trash2, Globe, Store, Printer, Download, Eye, Truck, 
  CheckCircle2, Clock, Image as ImageIcon, Wallet, ShoppingBag, TrendingUp,
  Filter, ChevronDown, ChevronUp, Calendar, Edit, MoreVertical, ArrowUpDown,
  FileText, Users, Package, CreditCard, Truck as TruckIcon, CheckCircle,
  AlertCircle, Mail, Phone, MapPin, BarChart3, PieChart, Activity,
  ArrowUp, ArrowDown, SortAsc, SortDesc, Filter as FilterIcon,
  DownloadCloud, Upload, RefreshCw, Settings, User, Tag, Percent,
  DollarSign, Shield, Star, Heart, Globe as GlobeIcon, Store as StoreIcon
} from "lucide-react";
import { format } from 'date-fns';

export default function AdvancedOrderPage() {
  const { theme, lang, currency: ctxCurrency } = useApp();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const receiptRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [transactionType, setTransactionType] = useState("online");
  const [paymentStatus, setPaymentStatus] = useState("COD");
  const [deliveryStatus, setDeliveryStatus] = useState("Pending");
  const [orderSource, setOrderSource] = useState("Facebook");
  const [paidAmount, setPaidAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderId, setOrderId] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ 
    id: '', name: '', qty: 1, stock: 0, price: 0, cost: 0 
  });
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', phone: '', address: '', email: '' 
  });
  const [expenses, setExpenses] = useState({ 
    discount: '', courier: '', tax: '', shipping: '' 
  });
  
  // ✅ Date Picker States
  const [orderDate, setOrderDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(null);
  
  // ✅ Advanced Table Filters
  const [tableFilters, setTableFilters] = useState({
    search: '',
    status: 'all',
    payment: 'all',
    dateRange: 'all',
    amountRange: 'all',
    source: 'all'
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  useEffect(() => {
    setMounted(true);
    setOrderId(generateId(transactionType));
    
    if (transactionType === "offline") {
      setPaymentStatus("Paid");
      setDeliveryStatus("Delivered");
    } else {
      setPaymentStatus("COD");
      setDeliveryStatus("Pending");
    }
  }, [transactionType]);

  const generateId = (type) => {
    const prefix = type === "online" ? "ORD" : "SL";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${new Date().getFullYear()}-${timestamp}-${random}`;
  };

  const currency = useMemo(() => 
    (typeof ctxCurrency === 'object' ? ctxCurrency.symbol : ctxCurrency) || "৳", 
    [ctxCurrency]
  );

  // ✅ Optimized API Data Fetching
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      return data.success ? data.products : [];
    },
    staleTime: 30000,
  });

  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      return data.success ? data.orders : [];
    },
    refetchOnWindowFocus: false,
  });

  // ✅ Enhanced Summary Calculation
  const summary = useMemo(() => {
    const subTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const totalCost = cart.reduce((acc, i) => acc + (i.cost * i.qty), 0);
    const disc = Number(expenses.discount) || 0;
    const cour = transactionType === "online" ? (Number(expenses.courier) || 0) : 0;
    const tax = Number(expenses.tax) || 0;
    const shipping = Number(expenses.shipping) || 0;
    
    const totalSell = subTotal - disc + cour + tax + shipping;
    const currentPaid = transactionType === "offline" ? totalSell : 
                        (paymentStatus === "Paid" ? totalSell : 
                         (paymentStatus === "Partial" ? (Number(paidAmount) || 0) : 0));
    
    const isConfirmedSell = (transactionType === "offline") || 
                           (paymentStatus === "Paid" && deliveryStatus === "Delivered");
    
    const netProfit = isConfirmedSell ? ((subTotal - disc) - totalCost) : 0;
    const profitMargin = subTotal > 0 ? ((netProfit / subTotal) * 100).toFixed(1) : 0;

    return { 
      subTotal, 
      totalCost,
      totalSell, 
      netProfit, 
      profitMargin,
      dueAmount: (totalSell - currentPaid), 
      currentPaid, 
      isConfirmedSell,
      itemCount: cart.reduce((acc, i) => acc + i.qty, 0)
    };
  }, [cart, expenses, transactionType, paymentStatus, deliveryStatus, paidAmount]);

  // ✅ Enhanced Receipt Download
  const downloadReceiptImage = async () => {
    if (receiptRef.current === null) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff', 
        pixelRatio: 3,
        quality: 1.0
      });
      const link = document.createElement('a');
      link.download = `INV-${lastSavedOrder?.orderId || 'POS'}-${format(new Date(), 'yyyyMMdd-HHmmss')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Receipt image downloaded successfully!");
    } catch (err) {
      toast.error("Failed to export receipt image");
      console.error('Receipt download error:', err);
    }
  };

  // ✅ Print Receipt
  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${lastSavedOrder?.orderId || 'POS'}</title>
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1.6cm; }
              }
              body { font-family: 'Courier New', monospace; }
              .receipt { max-width: 80mm; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
              .items { width: 100%; border-collapse: collapse; }
              .items td { padding: 4px 0; }
              .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${receiptRef.current.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // ✅ Create Order Mutation
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
      const orderWithDate = {
        ...data.order,
        orderDate: format(orderDate, 'yyyy-MM-dd'),
        deliveryDate: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : null
      };
      setLastSavedOrder(orderWithDate);
      setShowReceipt(true);
      resetForm();
      toast.success("Order created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create order");
      console.error('Order creation error:', error);
    }
  });

  // ✅ Reset Form
  const resetForm = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', address: '', email: '' });
    setExpenses({ discount: '', courier: '', tax: '', shipping: '' });
    setPaidAmount("");
    setSearchQuery("");
    setOrderDate(new Date());
    setDeliveryDate(null);
    setOrderId(generateId(transactionType));
  };

  // ✅ Product Search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return inventory.slice(0, 10);
    return inventory.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [inventory, searchQuery]);

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product._id);
    if (exists) {
      if (exists.qty >= product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }
      setCart(cart.map(item => 
        item.id === product._id 
          ? { ...item, qty: item.qty + 1 } 
          : item
      ));
    } else {
      if (product.stock <= 0) {
        toast.error("Product out of stock");
        return;
      }
      setCart([...cart, { 
        id: product._id, 
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice, 
        qty: 1, 
        cost: product.costPrice || 0,
        stock: product.stock
      }]);
    }
    setSearchQuery("");
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, newQty) => {
    if (newQty < 1) {
      removeFromCart(id);
      return;
    }
    const product = cart.find(item => item.id === id);
    if (product && newQty > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, qty: newQty } : item
    ));
  };

  // ✅ Enhanced Orders Filtering & Sorting
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply filters
    if (tableFilters.search) {
      const searchLower = tableFilters.search.toLowerCase();
      result = result.filter(order => 
        (order.customerName || '').toLowerCase().includes(searchLower) ||
        (order.orderId || '').toLowerCase().includes(searchLower) ||
        (order.customerPhone || '').toLowerCase().includes(searchLower) ||
        (order.customerEmail || '').toLowerCase().includes(searchLower)
      );
    }

    if (tableFilters.status !== 'all') {
      result = result.filter(order => order.deliveryStatus === tableFilters.status);
    }

    if (tableFilters.payment !== 'all') {
      result = result.filter(order => order.paymentStatus === tableFilters.payment);
    }

    if (tableFilters.source !== 'all') {
      result = result.filter(order => order.orderSource === tableFilters.source);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'createdAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (sortConfig.key === 'totalSell') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [orders, tableFilters, sortConfig]);

  // ✅ Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ Export Orders
  const exportOrders = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Amount', 'Payment', 'Status', 'Source'];
    const csvData = filteredAndSortedOrders.map(order => [
      order.orderId,
      format(new Date(order.createdAt), 'yyyy-MM-dd'),
      order.customerName,
      order.customerPhone,
      order.totalSell,
      order.paymentStatus,
      order.deliveryStatus,
      order.orderSource
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success("Orders exported successfully!");
  };

  if (!mounted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#090E14]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 space-y-8 max-w-[2000px] mx-auto ${theme === 'dark' ? 'bg-[#090E14] text-slate-200' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* ✅ Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-600'} shadow-lg shadow-blue-500/20`}>
              <ShoppingBag className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Order Management System
              </h1>
              <p className="text-sm font-medium opacity-60 mt-1">Create, manage, and track all your orders in one place</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => refetch()}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={exportOrders}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
          >
            <DownloadCloud size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ✅ Order Creation Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column - Order Form */}
        <div className="xl:col-span-3 space-y-6">
          <div className={`rounded-3xl border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-white/5' : 'bg-white border-gray-200'} p-6 md:p-8 shadow-xl`}>
            
            {/* Order Type & ID */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex gap-2">
                <button 
                  onClick={() => setTransactionType("online")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    transactionType === 'online' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/30' 
                      : theme === 'dark' 
                        ? 'bg-white/5 text-slate-400 hover:bg-white/10' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <GlobeIcon size={16} />
                  Online Order
                </button>
                <button 
                  onClick={() => setTransactionType("offline")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    transactionType === 'offline' 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-500/30' 
                      : theme === 'dark' 
                        ? 'bg-white/5 text-slate-400 hover:bg-white/10' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <StoreIcon size={16} />
                  Offline Sale
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="font-mono text-lg font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {orderId}
                </div>
                <div className="text-xs opacity-60">Order ID</div>
              </div>
            </div>

            {/* Order Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Calendar size={16} />
                  Order Date *
                </label>
                <DatePicker
                  selected={orderDate}
                  onChange={(date) => setOrderDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                      : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                  }`}
                  wrapperClassName="w-full"
                />
              </div>
              
              {transactionType === "online" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <TruckIcon size={16} />
                    Expected Delivery Date
                  </label>
                  <DatePicker
                    selected={deliveryDate}
                    onChange={(date) => setDeliveryDate(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={orderDate}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                        : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                    }`}
                    wrapperClassName="w-full"
                    placeholderText="Select delivery date"
                  />
                </div>
              )}
            </div>

            {/* Product Search */}
            <div className="relative mb-8">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                placeholder="Search products by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                    : 'bg-white border border-gray-200 focus:border-blue-500'
                }`}
              />
              
              {searchQuery && filteredProducts.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 max-h-96 overflow-y-auto ${
                  theme === 'dark' 
                    ? 'bg-[#1a2230] border-white/10' 
                    : 'bg-white border-gray-200'
                }`}>
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className={`w-full p-4 text-left transition-all border-b last:border-b-0 ${
                        theme === 'dark' 
                          ? 'border-white/5 hover:bg-white/5' 
                          : 'border-gray-100 hover:bg-gray-50'
                      } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-bold text-sm">{product.name}</div>
                          <div className="text-xs opacity-60 mt-1">
                            SKU: {product.sku || 'N/A'} | Stock: {product.stock} | 
                            Cost: {currency}{product.costPrice || 0} | 
                            Price: {currency}{product.sellingPrice}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            product.stock <= 0 
                              ? 'bg-red-500/20 text-red-500' 
                              : product.stock <= 10 
                                ? 'bg-amber-500/20 text-amber-500' 
                                : 'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {product.stock <= 0 ? 'Out of Stock' : `${product.stock} available`}
                          </span>
                          <Plus size={16} className="text-blue-500" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                      : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <User size={16} />
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                      : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
              
              {transactionType === "online" && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <MapPin size={16} />
                      Delivery Address
                    </label>
                    <textarea
                      placeholder="Full delivery address with area, city, and zip code"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all resize-none ${
                        theme === 'dark' 
                          ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                          : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="customer@email.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                          : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <GlobeIcon size={16} />
                      Order Source
                    </label>
                    <select
                      value={orderSource}
                      onChange={(e) => setOrderSource(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                          : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Website">Website</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone Call</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Cart Items */}
            <div className={`rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} p-6 mb-8`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Cart Items ({cart.length})
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Clear Cart
                  </button>
                )}
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`} />
                  <p className={`font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>Your cart is empty</p>
                  <p className="text-sm opacity-60 mt-1">Search and add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-xs opacity-60 mt-1">
                          SKU: {item.sku || 'N/A'} | Stock: {item.stock}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              theme === 'dark' 
                                ? 'bg-white/10 hover:bg-white/20' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              theme === 'dark' 
                                ? 'bg-white/10 hover:bg-white/20' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold">{currency}{(item.price * item.qty).toLocaleString()}</div>
                          <div className="text-xs opacity-60">{currency}{item.price} each</div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Percent size={16} />
                  Discount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={expenses.discount}
                  onChange={(e) => setExpenses({...expenses, discount: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#1a2230] border border-white/10 focus:border-red-500' 
                      : 'bg-gray-50 border border-gray-200 focus:border-red-500'
                  }`}
                  min="0"
                />
              </div>
              
              {transactionType === "online" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <TruckIcon size={16} />
                    Courier Charge
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={expenses.courier}
                    onChange={(e) => setExpenses({...expenses, courier: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                        : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                    }`}
                    min="0"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Tag size={16} />
                  Tax
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={expenses.tax}
                  onChange={(e) => setExpenses({...expenses, tax: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                      : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                  }`}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <TruckIcon size={16} />
                  Shipping
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={expenses.shipping}
                  onChange={(e) => setExpenses({...expenses, shipping: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                      : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                  }`}
                  min="0"
                />
              </div>
            </div>

            {/* Payment & Submit */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <CreditCard size={16} />
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                      theme === 'dark' 
                        ? 'bg-[#1a2230] border border-white/10 focus:border-blue-500' 
                        : 'bg-gray-50 border border-gray-200 focus:border-blue-500'
                    }`}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Due">Due</option>
                  </select>
                </div>
                
                {paymentStatus === "Partial" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Wallet size={16} />
                      Paid Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Enter paid amount"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold outline-none transition-all ${
                        theme === 'dark' 
                          ? 'bg-[#1a2230] border border-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-gray-50 border border-emerald-200 focus:border-emerald-500'
                      }`}
                      min="0"
                      max={summary.totalSell}
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  if (!customerInfo.phone) {
                    toast.error("Phone number is required");
                    return;
                  }
                  if (cart.length === 0) {
                    toast.error("Please add products to cart");
                    return;
                  }
                  
                  const orderData = {
                    orderId,
                    transactionType,
                    orderSource,
                    paymentStatus: transactionType === "offline" ? "Paid" : paymentStatus,
                    deliveryStatus: transactionType === "offline" ? "Delivered" : deliveryStatus,
                    customerName: customerInfo.name,
                    customerPhone: customerInfo.phone,
                    customerAddress: customerInfo.address,
                    customerEmail: customerInfo.email,
                    products: cart,
                    discount: Number(expenses.discount) || 0,
                    courier: Number(expenses.courier) || 0,
                    tax: Number(expenses.tax) || 0,
                    shipping: Number(expenses.shipping) || 0,
                    totalSell: summary.totalSell,
                    netProfit: summary.netProfit,
                    profitMargin: summary.profitMargin,
                    dueAmount: summary.dueAmount,
                    paidAmount: summary.currentPaid,
                    isConfirmedSell: summary.isConfirmedSell,
                    orderDate: format(orderDate, 'yyyy-MM-dd'),
                    deliveryDate: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : null
                  };
                  
                  createOrderMutation.mutate(orderData);
                }}
                disabled={createOrderMutation.isLoading || cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  createOrderMutation.isLoading 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  transactionType === 'offline'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/30'
                }`}
              >
                {createOrderMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {transactionType === 'offline' ? (
                      <>
                        <CheckCircle size={20} />
                        Confirm Sale
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Create Order
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="xl:col-span-1 space-y-6">
          {/* Summary Card */}
          <div className={`rounded-3xl border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-white/5' : 'bg-white border-gray-200'} p-6 shadow-xl sticky top-6`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={20} />
              Order Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">Subtotal</span>
                <span className="font-bold">{currency}{summary.subTotal.toLocaleString()}</span>
              </div>
              
              {Number(expenses.discount) > 0 && (
                <div className="flex justify-between items-center text-red-500">
                  <span className="text-sm">Discount</span>
                  <span className="font-bold">-{currency}{Number(expenses.discount).toLocaleString()}</span>
                </div>
              )}
              
              {Number(expenses.courier) > 0 && (
                <div className="flex justify-between items-center text-blue-500">
                  <span className="text-sm">Courier</span>
                  <span className="font-bold">+{currency}{Number(expenses.courier).toLocaleString()}</span>
                </div>
              )}
              
              {Number(expenses.tax) > 0 && (
                <div className="flex justify-between items-center text-amber-500">
                  <span className="text-sm">Tax</span>
                  <span className="font-bold">+{currency}{Number(expenses.tax).toLocaleString()}</span>
                </div>
              )}
              
              {Number(expenses.shipping) > 0 && (
                <div className="flex justify-between items-center text-purple-500">
                  <span className="text-sm">Shipping</span>
                  <span className="font-bold">+{currency}{Number(expenses.shipping).toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-black text-blue-500">
                    {currency}{summary.totalSell.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">Paid</span>
                  <span className="font-bold text-emerald-500">
                    {currency}{summary.currentPaid.toLocaleString()}
                  </span>
                </div>
                
                {summary.dueAmount > 0 && (
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="opacity-70">Due</span>
                    <span className="font-bold text-red-500">
                      {currency}{summary.dueAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={`p-4 rounded-xl mt-4 ${
                summary.isConfirmedSell 
                  ? theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                  : theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold flex items-center gap-2">
                    {summary.isConfirmedSell ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <Clock size={14} className="text-amber-500" />
                    )}
                    {summary.isConfirmedSell ? 'Realized Profit' : 'Expected Profit'}
                  </span>
                  <span className={`text-lg font-bold ${summary.isConfirmedSell ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {currency}{summary.netProfit.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs opacity-70">
                  Margin: {summary.profitMargin}% | Items: {summary.itemCount}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`rounded-3xl border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-white/5' : 'bg-white border-gray-200'} p-6 shadow-xl`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity size={20} />
              Quick Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl text-center ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-black text-blue-500">{cart.length}</div>
                <div className="text-xs opacity-70 mt-1">Items in Cart</div>
              </div>
              
              <div className={`p-4 rounded-xl text-center ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-black text-emerald-500">{summary.itemCount}</div>
                <div className="text-xs opacity-70 mt-1">Total Quantity</div>
              </div>
              
              <div className={`p-4 rounded-xl text-center ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-black text-purple-500">{inventory.length}</div>
                <div className="text-xs opacity-70 mt-1">Products in Stock</div>
              </div>
              
              <div className={`p-4 rounded-xl text-center ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-black text-amber-500">{orders.length}</div>
                <div className="text-xs opacity-70 mt-1">Total Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Orders History Section */}
      <div className={`rounded-3xl border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-white/5' : 'bg-white border-gray-200'} p-6 shadow-xl`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText size={24} />
              Order History
            </h2>
            <p className="text-sm opacity-70 mt-1">
              Total: {orders.length} orders • Showing: {filteredAndSortedOrders.length} • 
              Amount: {currency}{filteredAndSortedOrders.reduce((sum, o) => sum + (Number(o.totalSell) || 0), 0).toLocaleString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* View Mode Toggle */}
            <div className={`flex rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-bold transition-all ${
                  viewMode === 'table' 
                    ? theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'text-slate-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 text-sm font-bold transition-all ${
                  viewMode === 'card' 
                    ? theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'text-slate-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cards
              </button>
            </div>
            
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <FilterIcon size={16} />
              Filters
              {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className={`mb-6 p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Search</label>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={tableFilters.search}
                  onChange={(e) => setTableFilters({...tableFilters, search: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg text-sm outline-none ${
                    theme === 'dark' 
                      ? 'bg-white/10 border border-white/10 focus:border-blue-500' 
                      : 'bg-white border border-gray-200 focus:border-blue-500'
                  }`}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold">Status</label>
                <select
                  value={tableFilters.status}
                  onChange={(e) => setTableFilters({...tableFilters, status: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg text-sm outline-none ${
                    theme === 'dark' 
                      ? 'bg-white/10 border border-white/10 focus:border-blue-500' 
                      : 'bg-white border border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold">Payment</label>
                <select
                  value={tableFilters.payment}
                  onChange={(e) => setTableFilters({...tableFilters, payment: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg text-sm outline-none ${
                    theme === 'dark' 
                      ? 'bg-white/10 border border-white/10 focus:border-blue-500' 
                      : 'bg-white border border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="all">All Payment</option>
                  <option value="COD">COD</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Due">Due</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold">Source</label>
                <select
                  value={tableFilters.source}
                  onChange={(e) => setTableFilters({...tableFilters, source: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg text-sm outline-none ${
                    theme === 'dark' 
                      ? 'bg-white/10 border border-white/10 focus:border-blue-500' 
                      : 'bg-white border border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="all">All Sources</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Website">Website</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone">Phone</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setTableFilters({
                  search: '',
                  status: 'all',
                  payment: 'all',
                  dateRange: 'all',
                  amountRange: 'all',
                  source: 'all'
                })}
                className="px-4 py-2 text-sm font-bold text-red-500 hover:text-red-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className={`text-left ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-gray-200'}`}>
                <tr>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => requestSort('orderId')}
                      className="flex items-center gap-1 font-bold text-sm"
                    >
                      Order ID
                      {sortConfig.key === 'orderId' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => requestSort('createdAt')}
                      className="flex items-center gap-1 font-bold text-sm"
                    >
                      Date & Time
                      {sortConfig.key === 'createdAt' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => requestSort('customerName')}
                      className="flex items-center gap-1 font-bold text-sm"
                    >
                      Customer
                      {sortConfig.key === 'customerName' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() => requestSort('totalSell')}
                      className="flex items-center gap-1 font-bold text-sm"
                    >
                      Amount
                      {sortConfig.key === 'totalSell' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className={`mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`} />
                        <p className={`font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                          No orders found
                        </p>
                        <p className="text-sm opacity-60 mt-1">
                          {tableFilters.search ? 'Try changing your search criteria' : 'Create your first order'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedOrders.map((order) => (
                    <tr 
                      key={order._id}
                      className={`transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-sm">{order.orderId}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {order.transactionType === 'online' ? 'Online' : 'Offline'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-xs opacity-60">
                          {format(new Date(order.createdAt), 'hh:mm a')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold">{order.customerName || 'Walk-in Customer'}</div>
                        <div className="text-xs opacity-60 mt-1">{order.customerPhone || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-lg">{currency}{Number(order.totalSell || 0).toLocaleString()}</div>
                        {order.paymentStatus === 'Paid' ? (
                          <div className="text-xs text-emerald-500 font-bold">Paid</div>
                        ) : order.paymentStatus === 'Partial' ? (
                          <div className="text-xs text-amber-500 font-bold">
                            Partial: {currency}{Number(order.paidAmount || 0).toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-xs text-red-500 font-bold">Due: {currency}{Number(order.dueAmount || 0).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.paymentStatus === 'Paid'
                            ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-700'
                            : order.paymentStatus === 'Partial'
                            ? theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-700'
                            : theme === 'dark' ? 'bg-red-500/10 text-red-500' : 'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.deliveryStatus === 'Delivered'
                            ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-700'
                            : order.deliveryStatus === 'Processing'
                            ? theme === 'dark' ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-100 text-blue-700'
                            : order.deliveryStatus === 'Shipped'
                            ? theme === 'dark' ? 'bg-purple-500/10 text-purple-500' : 'bg-purple-100 text-purple-700'
                            : theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {order.orderSource === 'Facebook' && (
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <GlobeIcon size={14} className="text-blue-500" />
                            </div>
                          )}
                          {order.orderSource === 'Instagram' && (
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                              <StoreIcon size={14} className="text-pink-500" />
                            </div>
                          )}
                          {order.orderSource === 'Website' && (
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <GlobeIcon size={14} className="text-emerald-500" />
                            </div>
                          )}
                          <span className="text-sm font-bold">{order.orderSource}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // View order details
                              toast.success(`Viewing order ${order.orderId}`);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-white/10' 
                                : 'hover:bg-gray-100'
                            }`}
                            title="View Order"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Edit order
                              toast.info(`Editing order ${order.orderId}`);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-white/10' 
                                : 'hover:bg-gray-100'
                            }`}
                            title="Edit Order"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Print invoice
                              toast.success(`Invoice for ${order.orderId} ready to print`);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-white/10' 
                                : 'hover:bg-gray-100'
                            }`}
                            title="Print Invoice"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedOrders.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <FileText size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
                  No orders found
                </p>
              </div>
            ) : (
              filteredAndSortedOrders.map((order) => (
                <div
                  key={order._id}
                  className={`rounded-2xl border p-6 transition-all hover:shadow-lg ${
                    theme === 'dark' 
                      ? 'bg-white/5 border-white/10 hover:border-white/20' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-mono font-bold text-lg">{order.orderId}</div>
                      <div className="text-sm opacity-60 mt-1">
                        {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        order.paymentStatus === 'Paid'
                          ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-700'
                          : theme === 'dark' ? 'bg-red-500/10 text-red-500' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-bold text-lg">{order.customerName || 'Walk-in Customer'}</div>
                    <div className="text-sm opacity-70">{order.customerPhone || 'N/A'}</div>
                    {order.customerEmail && (
                      <div className="text-sm opacity-70">{order.customerEmail}</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-2xl font-black">{currency}{Number(order.totalSell || 0).toLocaleString()}</div>
                      <div className="text-xs opacity-60">Total Amount</div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.deliveryStatus === 'Delivered'
                          ? theme === 'dark' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-700'
                          : order.deliveryStatus === 'Processing'
                          ? theme === 'dark' ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-100 text-blue-700'
                          : theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.deliveryStatus}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Status</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {order.orderSource === 'Facebook' && (
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <GlobeIcon size={14} className="text-blue-500" />
                        </div>
                      )}
                      {order.orderSource === 'Instagram' && (
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <StoreIcon size={14} className="text-pink-500" />
                        </div>
                      )}
                      <span className="text-sm font-bold">{order.orderSource}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-white/10' 
                            : 'hover:bg-gray-100'
                        }`}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'hover:bg-white/10' 
                            : 'hover:bg-gray-100'
                        }`}
                        title="Print Invoice"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedOrders.length > 0 && (
          <div className={`flex justify-between items-center mt-8 pt-6 border-t ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="text-sm opacity-70">
              Showing {filteredAndSortedOrders.length} of {orders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button className={`px-4 py-2 rounded-lg text-sm font-bold ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-bold">1</span>
              <button className={`px-4 py-2 rounded-lg text-sm font-bold ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Receipt Modal */}
      {showReceipt && lastSavedOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-gray-800 shadow-2xl animate-scale-in">
            <div ref={receiptRef} className="p-8">
              {/* Receipt Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-blue-600">XEETRIX STORE</h2>
                <p className="text-sm text-gray-600 mt-1">Order Receipt</p>
                <div className="mt-2">
                  <div className="font-mono text-lg font-bold">{lastSavedOrder.orderId}</div>
                  <div className="text-xs text-gray-500">
                    Date: {format(new Date(lastSavedOrder.orderDate || new Date()), 'dd/MM/yyyy')} • 
                    Time: {format(new Date(), 'hh:mm a')}
                  </div>
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-700 mb-2">Customer Information</div>
                <div className="text-sm">
                  <div><span className="font-medium">Name:</span> {lastSavedOrder.customerName || 'Walk-in Customer'}</div>
                  <div><span className="font-medium">Phone:</span> {lastSavedOrder.customerPhone || 'N/A'}</div>
                  {lastSavedOrder.customerAddress && (
                    <div><span className="font-medium">Address:</span> {lastSavedOrder.customerAddress}</div>
                  )}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-700 mb-2">Order Summary</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-bold">{currency}{summary.subTotal.toLocaleString()}</span>
                  </div>
                  
                  {lastSavedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span className="font-bold">-{currency}{Number(lastSavedOrder.discount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {lastSavedOrder.courier > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Courier</span>
                      <span className="font-bold">+{currency}{Number(lastSavedOrder.courier || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {lastSavedOrder.tax > 0 && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Tax</span>
                      <span className="font-bold">+{currency}{Number(lastSavedOrder.tax || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {lastSavedOrder.shipping > 0 && (
                    <div className="flex justify-between text-sm text-purple-600">
                      <span>Shipping</span>
                      <span className="font-bold">+{currency}{Number(lastSavedOrder.shipping || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{currency}{Number(lastSavedOrder.totalSell || 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-1">
                      <span>Paid</span>
                      <span className="text-emerald-600 font-bold">
                        {currency}{Number(lastSavedOrder.paidAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    {lastSavedOrder.dueAmount > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Due</span>
                        <span className="text-red-600 font-bold">
                          {currency}{Number(lastSavedOrder.dueAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-700 mb-2">Payment Details</div>
                <div className="text-sm">
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      lastSavedOrder.paymentStatus === 'Paid' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : lastSavedOrder.paymentStatus === 'Partial'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {lastSavedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-1"><span className="font-medium">Method:</span> 
                    {lastSavedOrder.transactionType === 'offline' ? ' Cash' : ' Online'}
                  </div>
                  {lastSavedOrder.profitMargin && (
                    <div className="mt-1"><span className="font-medium">Profit Margin:</span> {lastSavedOrder.profitMargin}%</div>
                  )}
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center border-t border-gray-300 pt-4">
                <p className="text-xs text-gray-500">Thank you for your business!</p>
                <p className="text-xs text-gray-400 mt-1">For any queries, contact: support@xeetrix.com</p>
                <p className="text-[10px] text-gray-300 mt-2">Receipt ID: {lastSavedOrder.orderId} • Generated on {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 grid grid-cols-2 gap-3 border-t border-gray-200">
              <button
                onClick={printReceipt}
                className="bg-gray-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
              >
                <Printer size={16} />
                Print Receipt
              </button>
              <button
                onClick={downloadReceiptImage}
                className="bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Save Image
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="col-span-2 py-3 bg-white border border-gray-300 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}