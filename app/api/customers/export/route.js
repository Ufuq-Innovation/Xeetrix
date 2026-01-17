// app/api/customers/export/route.js
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "your_database";

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
    const customersCollection = db.collection("customers");
    
    // Fetch all customers
    const customers = await customersCollection
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    // Prepare CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Address",
      "City",
      "Country",
      "Status",
      "Type",
      "Tax Number",
      "Total Purchases",
      "Total Spent",
      "Last Purchase",
      "Notes"
    ];
    
    const rows = customers.map(customer => [
      customer.name || "",
      customer.email || "",
      customer.phone || "",
      customer.company || "",
      customer.address || "",
      customer.city || "",
      customer.country || "",
      customer.status || "",
      customer.customerType || "",
      customer.taxNumber || "",
      customer.totalPurchases || 0,
      customer.totalSpent || 0,
      customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toISOString().split('T')[0] : "",
      customer.notes || ""
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    // Create response with CSV file
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Export failed"
    }, { status: 500 });
  }
}