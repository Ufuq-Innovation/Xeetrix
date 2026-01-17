import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function PUT(request) {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    const couriers = db.collection('couriers');
    
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID and status required' },
        { status: 400 }
      );
    }
    
    const delivery = await deliveries.findOne({ _id: new ObjectId(id) });
    if (!delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      );
    }
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'delivered' && delivery.assignedTo) {
      const courier = await couriers.findOne({ _id: new ObjectId(delivery.assignedTo) });
      if (courier && courier.salaryType === 'commission') {
        const commission = (delivery.deliveryCharge * courier.commissionRate) / 100;
        await couriers.updateOne(
          { _id: new ObjectId(delivery.assignedTo) },
          { 
            $inc: { 
              successfulDeliveries: 1,
              totalEarnings: commission 
            }
          }
        );
      }
    }
    
    const result = await deliveries.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Status updated'
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}