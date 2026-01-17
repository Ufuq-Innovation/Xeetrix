import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    const couriers = db.collection('couriers');
    
    const body = await request.json();
    const { courierId, deliveryIds } = body;
    
    if (!courierId || !deliveryIds || deliveryIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    const courier = await couriers.findOne({ _id: new ObjectId(courierId) });
    if (!courier) {
      return NextResponse.json(
        { success: false, message: 'Courier not found' },
        { status: 404 }
      );
    }
    
    const objectIds = deliveryIds.map(id => new ObjectId(id));
    
    const result = await deliveries.updateMany(
      { _id: { $in: objectIds }, status: 'pending' },
      { 
        $set: { 
          assignedTo: courierId,
          assignedCourier: {
            name: courier.name,
            phone: courier.phone
          },
          status: 'in_transit',
          updatedAt: new Date()
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} deliveries assigned`,
      assignedCount: result.modifiedCount
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}