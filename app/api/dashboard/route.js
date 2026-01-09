import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Expense from '@/models/Expense';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from 'date-fns';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Calculate date ranges
    const now = new Date();
    let dateFilter = {};
    let previousPeriodFilter = {};
    
    // Current period filter
    if (period === 'custom' && startDate && endDate) {
      const customStart = new Date(startDate);
      const customEnd = new Date(endDate);
      customEnd.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          $gte: customStart,
          $lte: customEnd
        }
      };
      
      // For custom range, previous period is same duration before start date
      const duration = customEnd.getTime() - customStart.getTime();
      const previousStart = new Date(customStart.getTime() - duration);
      const previousEnd = new Date(customStart.getTime() - 1);
      
      previousPeriodFilter = {
        createdAt: {
          $gte: previousStart,
          $lte: previousEnd
        }
      };
      
    } else if (period === 'today') {
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const yesterdayStart = startOfDay(subDays(now, 1));
      const yesterdayEnd = endOfDay(subDays(now, 1));
      
      dateFilter = { createdAt: { $gte: todayStart, $lte: todayEnd } };
      previousPeriodFilter = { createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } };
      
    } else if (period === 'week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const lastWeekStart = startOfWeek(subDays(now, 7));
      const lastWeekEnd = endOfWeek(subDays(now, 7));
      
      dateFilter = { createdAt: { $gte: weekStart, $lte: weekEnd } };
      previousPeriodFilter = { createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd } };
      
    } else if (period === 'month') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subDays(now, 30));
      const lastMonthEnd = endOfMonth(subDays(now, 30));
      
      dateFilter = { createdAt: { $gte: monthStart, $lte: monthEnd } };
      previousPeriodFilter = { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } };
      
    } else if (period === 'year') {
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      const lastYearStart = startOfYear(subDays(now, 365));
      const lastYearEnd = endOfYear(subDays(now, 365));
      
      dateFilter = { createdAt: { $gte: yearStart, $lte: yearEnd } };
      previousPeriodFilter = { createdAt: { $gte: lastYearStart, $lte: lastYearEnd } };
    }
    
    // Fetch current period data
    const [
      orders,
      previousOrders,
      products,
      customers,
      expenses,
    ] = await Promise.all([
      Order.find(dateFilter).populate('products.product'),
      Order.find(previousPeriodFilter),
      Product.find(),
      Customer.find(),
      Expense.find(dateFilter),
    ]);
    
    // Calculate current period stats
    const totalSales = orders.reduce((sum, order) => sum + (order.totalSell || 0), 0);
    const totalCost = orders.reduce((sum, order) => {
      const orderCost = order.products?.reduce((cost, p) => {
        const productCost = p.product?.costPrice || p.costPrice || 0;
        return cost + (productCost * p.quantity);
      }, 0) || 0;
      return sum + orderCost;
    }, 0);
    const netProfit = totalSales - totalCost;
    
    // Calculate previous period stats
    const previousTotalSales = previousOrders.reduce((sum, order) => sum + (order.totalSell || 0), 0);
    const previousTotalCost = previousOrders.reduce((sum, order) => {
      const orderCost = order.products?.reduce((cost, p) => {
        const productCost = p.product?.costPrice || p.costPrice || 0;
        return cost + (productCost * p.quantity);
      }, 0) || 0;
      return sum + orderCost;
    }, 0);
    const previousNetProfit = previousTotalSales - previousTotalCost;
    
    // Status counts
    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      returned: orders.filter(o => o.status === 'returned').length,
    };
    
    // Sales trend data (group by period)
    let salesTrend = [];
    if (period === 'year') {
      // Group by month
      const monthlySales = {};
      orders.forEach(order => {
        const month = format(new Date(order.createdAt), 'MMM');
        monthlySales[month] = (monthlySales[month] || 0) + order.totalSell;
      });
      salesTrend = Object.entries(monthlySales).map(([month, sales]) => ({
        _id: month,
        sales
      }));
    } else if (period === 'month') {
      // Group by week
      const weeklySales = {};
      orders.forEach(order => {
        const week = `Week ${Math.ceil(new Date(order.createdAt).getDate() / 7)}`;
        weeklySales[week] = (weeklySales[week] || 0) + order.totalSell;
      });
      salesTrend = Object.entries(weeklySales).map(([week, sales]) => ({
        _id: week,
        sales
      }));
    } else {
      // Group by day
      const dailySales = {};
      orders.forEach(order => {
        const day = format(new Date(order.createdAt), 'dd MMM');
        dailySales[day] = (dailySales[day] || 0) + order.totalSell;
      });
      salesTrend = Object.entries(dailySales).map(([day, sales]) => ({
        _id: day,
        sales
      }));
    }
    
    // Expense distribution
    const expenseDistribution = [
      { name: 'Marketing', value: expenses.filter(e => e.category === 'marketing').reduce((sum, e) => sum + e.amount, 0) },
      { name: 'Operations', value: expenses.filter(e => e.category === 'operations').reduce((sum, e) => sum + e.amount, 0) },
      { name: 'Salaries', value: expenses.filter(e => e.category === 'salary').reduce((sum, e) => sum + e.amount, 0) },
      { name: 'Utilities', value: expenses.filter(e => e.category === 'utility').reduce((sum, e) => sum + e.amount, 0) },
      { name: 'Other', value: expenses.filter(e => !['marketing', 'operations', 'salary', 'utility'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0) },
    ].filter(e => e.value > 0);
    
    // Recent activity
    const recentActivity = orders.slice(0, 5).map(order => ({
      type: 'order',
      description: `New order from ${order.customerName || 'Customer'}`,
      amount: order.totalSell,
      time: format(new Date(order.createdAt), 'hh:mm a')
    }));
    
    // Alerts
    const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold || p.stock <= 10);
    
    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalSales,
        netProfit,
        totalDue: orders.filter(o => o.paymentStatus === 'due').reduce((sum, o) => sum + o.dueAmount, 0),
        totalExpense: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
        conversionRate: 0, // You can calculate this based on your conversion tracking
        cashInHand: 0, // You can calculate this from your cash transactions
        totalProducts: products.length,
        totalCustomers: customers.length,
        codPending: orders.filter(o => o.paymentMethod === 'COD' && o.paymentStatus !== 'paid').reduce((sum, o) => sum + o.totalSell, 0),
      },
      previousPeriod: {
        totalSales: previousTotalSales,
        netProfit: previousNetProfit,
        totalOrders: previousOrders.length,
        averageOrderValue: previousOrders.length > 0 ? previousTotalSales / previousOrders.length : 0,
      },
      statusCounts,
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
      error: error.message 
    }, { status: 500 });
  }
}