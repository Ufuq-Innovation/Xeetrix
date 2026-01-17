// app/api/customers/export/route.js - নতুন ফাইল তৈরি করুন

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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

export async function GET() {
  try {
    const db = await connectDB();
    const customersCollection = db.collection('customers');
    
    const customers = await customersCollection.find({}).toArray();
    
    // Prepare CSV content
    const headers = [
      'Name',
      'Email', 
      'Phone',
      'Address',
      'City',
      'Country',
      'Company',
      'Status',
      'Customer Type',
      'Total Purchases',
      'Total Spent',
      'Created At'
    ];
    
    const rows = customers.map(customer => [
      `"${customer.name || ''}"`,
      `"${customer.email || ''}"`,
      `"${customer.phone || ''}"`,
      `"${customer.address || ''}"`,
      `"${customer.city || ''}"`,
      `"${customer.country || ''}"`,
      `"${customer.company || ''}"`,
      `"${customer.status || ''}"`,
      `"${customer.customerType || ''}"`,
      customer.totalPurchases || 0,
      customer.totalSpent || 0,
      customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create response
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}