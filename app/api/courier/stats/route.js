import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Delivery from '@/models/Delivery';
import Courier from '@/models/Courier';

export async function GET() {
  try {
    await connectDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get counts concurrently
    const [
      pendingDeliveries,
      inTransitDeliveries,
      deliveredToday,
      activeCouriers,
      totalCouriers,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      // Pending deliveries
      Delivery.countDocuments({ status: 'pending' }),
      
      // In transit deliveries
      Delivery.countDocuments({ status: 'in_transit' }),
      
      // Delivered today
      Delivery.countDocuments({ 
        status: 'delivered',
        updatedAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Active couriers
      Courier.countDocuments({ status: 'active' }),
      
      // Total couriers
      Courier.countDocuments(),
      
      // Total revenue from delivered orders
      Delivery.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$deliveryCharge' } } }
      ]),
      
      // Monthly revenue
      Delivery.aggregate([
        { 
          $match: { 
            status: 'delivered',
            updatedAt: { 
              $gte: new Date(new Date().setDate(1)),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          } 
        },
        { $group: { _id: null, total: { $sum: '$deliveryCharge' } } }
      ])
    ]);

    // Calculate growth percentage
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
    
    const lastMonthRevenue = await Delivery.aggregate([
      { 
        $match: { 
          status: 'delivered',
          updatedAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$deliveryCharge' } } }
    ]);

    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    
    let monthlyGrowth = "0%";
    if (previousRevenue > 0) {
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      monthlyGrowth = `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    } else if (currentRevenue > 0) {
      monthlyGrowth = "+100%";
    }

    return NextResponse.json({
      success: true,
      stats: {
        pendingDeliveries,
        inTransitDeliveries,
        deliveredToday,
        activeCouriers,
        totalCouriers,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: currentRevenue,
        monthlyGrowth,
        pendingValue: pendingDeliveries * 100, // Estimate
        successRate: deliveredToday > 0 ? Math.round((deliveredToday / (deliveredToday + pendingDeliveries)) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}