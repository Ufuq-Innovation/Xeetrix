import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Courier from '@/models/Courier';

// GET - Fetch all couriers
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    
    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const couriers = await Courier.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      couriers,
      total: couriers.length
    });
  } catch (error) {
    console.error('Error fetching couriers:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new courier
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.phone || !body.vehicleNumber || !body.licenseNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if phone or vehicle number already exists
    const existingPhone = await Courier.findOne({ phone: body.phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 400 }
      );
    }

    const existingVehicle = await Courier.findOne({ vehicleNumber: body.vehicleNumber });
    if (existingVehicle) {
      return NextResponse.json(
        { success: false, message: 'Vehicle number already registered' },
        { status: 400 }
      );
    }

    // Create courier
    const courier = new Courier({
      ...body,
      joiningDate: new Date(body.joiningDate)
    });

    await courier.save();

    return NextResponse.json({
      success: true,
      message: 'Courier added successfully',
      courier
    });
  } catch (error) {
    console.error('Error creating courier:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update courier
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Courier ID is required' },
        { status: 400 }
      );
    }

    // Check if courier exists
    const courier = await Courier.findById(id);
    if (!courier) {
      return NextResponse.json(
        { success: false, message: 'Courier not found' },
        { status: 404 }
      );
    }

    // Check for duplicate phone or vehicle number
    if (updateData.phone && updateData.phone !== courier.phone) {
      const existingPhone = await Courier.findOne({ phone: updateData.phone });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: 'Phone number already registered' },
          { status: 400 }
        );
      }
    }

    if (updateData.vehicleNumber && updateData.vehicleNumber !== courier.vehicleNumber) {
      const existingVehicle = await Courier.findOne({ vehicleNumber: updateData.vehicleNumber });
      if (existingVehicle) {
        return NextResponse.json(
          { success: false, message: 'Vehicle number already registered' },
          { status: 400 }
        );
      }
    }

    // Update courier
    const updatedCourier = await Courier.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Courier updated successfully',
      courier: updatedCourier
    });
  } catch (error) {
    console.error('Error updating courier:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}