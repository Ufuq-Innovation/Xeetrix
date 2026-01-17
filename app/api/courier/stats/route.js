import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    const couriers = db.collection('couriers');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      pendingDeliveries,
      inTransitDeliveries,
      deliveredToday,
      activeCouriers
    ] = await Promise.all([
      deliveries.countDocuments({ status: 'pending' }),
      deliveries.countDocuments({ status: 'in_transit' }),
      deliveries.countDocuments({ 
        status: 'delivered',
        updatedAt: { $gte: today }
      }),
      couriers.countDocuments({ status: 'active' })
    ]);
    
    return NextResponse.json({
      success: true,
      stats: {
        pendingDeliveries,
        inTransitDeliveries,
        deliveredToday,
        activeCouriers
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}