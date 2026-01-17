import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const couriers = db.collection('couriers');
    
    const result = await couriers.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      couriers: result
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
    const couriers = db.collection('couriers');
    
    const body = await request.json();
    
    if (!body.name || !body.phone || !body.vehicleNumber) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    const courier = {
      ...body,
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await couriers.insertOne(courier);
    
    return NextResponse.json({
      success: true,
      message: 'Courier added',
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
    const couriers = db.collection('couriers');
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID required' },
        { status: 400 }
      );
    }
    
    const result = await couriers.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Courier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Courier updated'
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}