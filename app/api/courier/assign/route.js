import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Delivery from '@/models/Delivery';
import Courier from '@/models/Courier';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { courierId, deliveryIds, pickupTime, estimatedDelivery, notes } = body;

    // Validate
    if (!courierId || !deliveryIds || deliveryIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Courier and deliveries are required' },
        { status: 400 }
      );
    }

    // Check if courier exists and is active
    const courier = await Courier.findById(courierId);
    if (!courier) {
      return NextResponse.json(
        { success: false, message: 'Courier not found' },
        { status: 404 }
      );
    }

    if (courier.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Courier is not active' },
        { status: 400 }
      );
    }

    // Check if deliveries exist and are pending
    const deliveries = await Delivery.find({ 
      _id: { $in: deliveryIds },
      status: 'pending'
    });

    if (deliveries.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No pending deliveries found' },
        { status: 400 }
      );
    }

    // Update deliveries
    const updatePromises = deliveries.map(delivery =>
      Delivery.findByIdAndUpdate(
        delivery._id,
        {
          assignedTo: courierId,
          assignedCourier: {
            name: courier.name,
            phone: courier.phone
          },
          status: 'in_transit',
          $push: {
            trackingHistory: {
              status: 'in_transit',
              note: `Assigned to ${courier.name}. ${notes || ''}`,
              timestamp: new Date()
            }
          },
          updatedAt: new Date()
        }
      )
    );

    await Promise.all(updatePromises);

    // Update courier stats
    await Courier.findByIdAndUpdate(courierId, {
      $inc: { totalDeliveries: deliveries.length },
      status: 'busy',
      lastActive: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `${deliveries.length} deliveries assigned successfully`,
      assignedCount: deliveries.length
    });
  } catch (error) {
    console.error('Error assigning deliveries:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}