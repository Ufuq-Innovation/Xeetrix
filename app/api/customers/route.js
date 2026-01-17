// app/api/customers/route.js - পুরো ফাইলটি এই কোড দিয়ে replace করুন

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "xeetrix";

async function connectDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    return client.db(dbName);
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'recent';
    
    const db = await connectDB();
    const customersCollection = db.collection('customers');
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      if (status === 'vip') {
        query.customerType = 'vip';
      } else {
        query.status = status;
      }
    }
    
    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'purchases':
        sortOption = { totalPurchases: -1 };
        break;
      case 'spent':
        sortOption = { totalSpent: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const customers = await customersCollection
      .find(query)
      .sort(sortOption)
      .toArray();
    
    // Calculate stats
    const stats = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      vipCustomers: customers.filter(c => c.customerType === 'vip').length,
      totalPurchases: customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0),
      totalSpent: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      avgPurchaseValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length
        : 0
    };
    
    return NextResponse.json({
      success: true,
      customers,
      stats,
      count: customers.length
    });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      address, 
      city, 
      country, 
      company,
      status = 'active',
      customerType = 'regular',
      notes = '',
      taxNumber = ''
    } = body;
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Customer name is required' },
        { status: 400 }
      );
    }
    
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const customersCollection = db.collection('customers');
    
    // Check duplicate
    const existingCustomer = await customersCollection.findOne({
      $or: [
        { phone: phone.trim() },
        { email: email?.trim() || '' }
      ]
    });
    
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer with this phone or email already exists' },
        { status: 409 }
      );
    }
    
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    const customer = {
      name: name.trim(),
      email: email?.trim() || '',
      phone: cleanPhone,
      address: address?.trim() || '',
      city: city?.trim() || '',
      country: country?.trim() || '',
      company: company?.trim() || '',
      status: status.toLowerCase(),
      customerType: customerType.toLowerCase(),
      notes: notes?.trim() || '',
      taxNumber: taxNumber?.trim() || '',
      totalPurchases: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastPurchaseDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await customersCollection.insertOne(customer);
    
    return NextResponse.json({
      success: true,
      message: 'Customer added successfully',
      customer: { ...customer, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add customer' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid customer ID' },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const customersCollection = db.collection('customers');
    
    // Check if customer exists
    const existingCustomer = await customersCollection.findOne({
      _id: new ObjectId(id)
    });
    
    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Update phone if provided
    if (updateData.phone) {
      updateData.phone = updateData.phone.replace(/\D/g, '');
    }
    
    updateData.updatedAt = new Date();
    
    const result = await customersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid customer ID' },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const customersCollection = db.collection('customers');
    
    const result = await customersCollection.deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    });
    
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}