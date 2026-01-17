import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Delivery from '@/models/Delivery';
import Courier from '@/models/Courier';

// GET - Fetch deliveries with filters
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      if (status === 'in-transit') {
        query.status = 'in_transit';
      } else {
        query.status = status;
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch deliveries with pagination
    const deliveries = await Delivery.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Delivery.countDocuments(query);

    // Populate courier info
    const deliveriesWithCourier = await Promise.all(
      deliveries.map(async (delivery) => {
        if (delivery.assignedTo) {
          const courier = await Courier.findById(delivery.assignedTo).lean();
          return {
            ...delivery,
            assignedCourier: courier ? {
              _id: courier._id,
              name: courier.name,
              phone: courier.phone
            } : null
          };
        }
        return delivery;
      })
    );

    return NextResponse.json({
      success: true,
      deliveries: deliveriesWithCourier,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new delivery
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.customerAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if orderId already exists
    if (body.orderId) {
      const existing = await Delivery.findOne({ orderId: body.orderId });
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Order ID already exists' },
          { status: 400 }
        );
      }
    }

    // Create delivery
    const delivery = new Delivery({
      ...body,
      deliveryDate: new Date(body.deliveryDate),
      trackingHistory: [{
        status: body.status || 'pending',
        note: 'Delivery created',
        timestamp: new Date()
      }]
    });

    await delivery.save();

    return NextResponse.json({
      success: true,
      message: 'Delivery created successfully',
      delivery
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update delivery
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Delivery ID is required' },
        { status: 400 }
      );
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Update tracking history if status changed
    if (updateData.status && updateData.status !== delivery.status) {
      updateData.$push = {
        trackingHistory: {
          status: updateData.status,
          note: `Status changed to ${updateData.status}`,
          timestamp: new Date()
        }
      };
    }

    // Update delivery
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    // Update courier stats if assigned
    if (updateData.assignedTo) {
      await Courier.findByIdAndUpdate(updateData.assignedTo, {
        $inc: { totalDeliveries: 1 }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery updated successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete delivery
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Delivery ID is required' },
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

    // Remove from courier's assigned deliveries if any
    if (delivery.assignedTo) {
      await Courier.findByIdAndUpdate(delivery.assignedTo, {
        $inc: { totalDeliveries: -1 }
      });
    }

    await Delivery.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}