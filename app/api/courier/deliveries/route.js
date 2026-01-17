import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    
    let query = {};
    
    if (status && status !== 'all') {
      if (status === 'in-transit') {
        query.status = 'in_transit';
      } else {
        query.status = status;
      }
    }
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const result = await deliveries.find(query).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      deliveries: result
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    
    const body = await request.json();
    
    if (!body.customerName || !body.customerPhone || !body.customerAddress) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    const delivery = {
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!delivery.orderId) {
      const count = await deliveries.countDocuments();
      delivery.orderId = `ORD-${Date.now().toString().slice(-6)}-${count + 1}`;
    }
    
    const result = await deliveries.insertOne(delivery);
    
    return NextResponse.json({
      success: true,
      message: 'Delivery created',
      id: result.insertedId
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID required' },
        { status: 400 }
      );
    }
    
    const result = await deliveries.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Delivery updated'
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const db = await getDb();
    const deliveries = db.collection('deliveries');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID required' },
        { status: 400 }
      );
    }
    
    const result = await deliveries.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Delivery deleted'
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}