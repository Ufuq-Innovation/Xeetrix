// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from 'date-fns';

// Mock data for development
const mockOrders = [
  { 
    _id: '1', 
    totalSell: 1500, 
    status: 'delivered', 
    paymentMethod: 'COD', 
    paymentStatus: 'paid',
    customerName: 'John Doe',
    products: [{ product: { costPrice: 100 }, quantity: 2 }],
    createdAt: new Date(),
    dueAmount: 0
  },
  // Add more mock data as needed
];

const mockProducts = [
  { _id: '1', name: 'Product 1', stock: 50, lowStockThreshold: 10 },
  { _id: '2', name: 'Product 2', stock: 5, lowStockThreshold: 10 },
];

const mockExpenses = [
  { category: 'marketing', amount: 500 },
  { category: 'operations', amount: 300 },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // For now, use mock data
    const orders = mockOrders;
    const products = mockProducts;
    const expenses = mockExpenses;
    
    // Calculate stats from mock data
    const totalSales = orders.reduce((sum, order) => sum + (order.totalSell || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Sales trend data based on period
    let salesTrend = [];
    if (period === 'year') {
      salesTrend = Array.from({ length: 12 }, (_, i) => ({
        _id: format(new Date(2024, i, 1), 'MMM'),
        sales: Math.floor(Math.random() * 5000) + 1000
      }));
    } else if (period === 'month') {
      salesTrend = Array.from({ length: 4 }, (_, i) => ({
        _id: `Week ${i + 1}`,
        sales: Math.floor(Math.random() * 3000) + 500
      }));
    } else {
      salesTrend = Array.from({ length: 7 }, (_, i) => ({
        _id: format(subDays(new Date(), 6 - i), 'dd MMM'),
        sales: Math.floor(Math.random() * 1000) + 200
      }));
    }
    
    // Expense distribution
    const expenseDistribution = [
      { name: 'Marketing', value: expenses.filter(e => e.category === 'marketing').reduce((sum, e) => sum + e.amount, 0) || 500 },
      { name: 'Operations', value: expenses.filter(e => e.category === 'operations').reduce((sum, e) => sum + e.amount, 0) || 300 },
      { name: 'Salaries', value: 2000 },
      { name: 'Utilities', value: 800 },
      { name: 'Other', value: 400 },
    ].filter(e => e.value > 0);
    
    // Recent activity
    const recentActivity = orders.slice(0, 4).map(order => ({
      type: 'order',
      description: `New order from ${order.customerName || 'Customer'}`,
      amount: order.totalSell,
      time: format(new Date(order.createdAt), 'hh:mm a')
    }));
    
    // Alerts
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 10));
    
    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalSales,
        netProfit: totalSales * 0.3, // 30% profit for demo
        totalDue: orders.filter(o => o.paymentStatus === 'due').reduce((sum, o) => sum + o.dueAmount, 0) || 500,
        totalExpense,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        conversionRate: 2.5,
        cashInHand: 15000,
        totalProducts,
        totalCustomers: 45,
        codPending: 1200,
      },
      previousPeriod: {
        totalSales: totalSales * 0.85, // 15% less for previous period
        netProfit: totalSales * 0.3 * 0.85,
        totalOrders: Math.floor(totalOrders * 0.85),
        averageOrderValue: totalOrders > 0 ? (totalSales * 0.85) / Math.floor(totalOrders * 0.85) : 0,
      },
      statusCounts: {
        pending: 2,
        processing: 3,
        delivered: 15,
        cancelled: 1,
        returned: 0,
      },
      salesTrend,
      expenseDistribution,
      recentActivity,
      alerts: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5).map(p => ({
          name: p.name,
          stock: p.stock,
          threshold: p.lowStockThreshold || 10
        }))
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      mockData: true 
    }, { status: 500 });
  }
}