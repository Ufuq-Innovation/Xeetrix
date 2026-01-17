import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Delivery from '@/models/Delivery';
import Courier from '@/models/Courier';

export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, status, note, location } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Delivery ID and status are required' },
        { status: 400 }
      );
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      );
    }

    const updateData = {
      status,
      updatedAt: new Date(),
      $push: {
        trackingHistory: {
          status,
          note: note || `Status updated to ${status}`,
          location: location || '',
          timestamp: new Date()
        }
      }
    };

    // If delivered, update payment if COD
    if (status === 'delivered' && delivery.paymentMethod === 'cash_on_delivery') {
      updateData.paymentStatus = 'paid';
      
      // Update courier earnings if commission based
      if (delivery.assignedTo) {
        const courier = await Courier.findById(delivery.assignedTo);
        if (courier && courier.salaryType === 'commission') {
          const commission = (delivery.deliveryCharge * courier.commissionRate) / 100;
          await Courier.findByIdAndUpdate(delivery.assignedTo, {
            $inc: { 
              successfulDeliveries: 1,
              totalEarnings: commission 
            },
            status: 'active' // Set back to active after delivery
          });
        }
      }
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(id, updateData, {
      new: true
    });

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}