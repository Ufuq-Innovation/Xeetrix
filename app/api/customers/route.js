// app/api/customers/route.js
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

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

// GET - Fetch customers with filtering and sorting
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "recent";
    
    const db = await connectDB();
    const customersCollection = db.collection("customers");
    
    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }
    
    // Status filter
    if (status && status !== "all") {
      if (status === "vip") {
        query.customerType = "vip";
      } else {
        query.status = status;
      }
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case "name":
        sortOptions = { name: 1 };
        break;
      case "purchases":
        sortOptions = { totalPurchases: -1 };
        break;
      case "spent":
        sortOptions = { totalSpent: -1 };
        break;
      default: // recent
        sortOptions = { createdAt: -1 };
    }
    
    // Fetch customers
    const customers = await customersCollection
      .find(query)
      .sort(sortOptions)
      .toArray();
    
    // Calculate stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === "active").length;
    const vipCustomers = customers.filter(c => c.customerType === "vip").length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
    const avgPurchaseValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
    
    const stats = {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      totalSpent,
      totalPurchases,
      avgPurchaseValue
    };
    
    return NextResponse.json({
      success: true,
      customers,
      stats,
      count: customers.length
    });
    
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch customers"
    }, { status: 500 });
  }
}

// POST - Add new customer
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      status = "active",
      customerType = "regular",
      notes = "",
      taxNumber = "",
      company = ""
    } = body;
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: "Customer name is required"
      }, { status: 400 });
    }
    
    if (!phone || !phone.trim()) {
      return NextResponse.json({
        success: false,
        error: "Phone number is required"
      }, { status: 400 });
    }
    
    const db = await connectDB();
    const customersCollection = db.collection("customers");
    
    // Check for duplicate phone or email
    const existingCustomer = await customersCollection.findOne({
      $or: [
        { phone: phone.trim() },
        { email: email?.trim() }
      ]
    });
    
    if (existingCustomer) {
      return NextResponse.json({
        success: false,
        error: "Customer with this phone or email already exists"
      }, { status: 409 });
    }
    
    // Prepare customer document
    const customer = {
      name: name.trim(),
      email: email?.trim() || "",
      phone: phone.trim(),
      address: address?.trim() || "",
      city: city?.trim() || "",
      country: country?.trim() || "",
      status,
      customerType,
      notes: notes?.trim() || "",
      taxNumber: taxNumber?.trim() || "",
      company: company?.trim() || "",
      totalPurchases: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastPurchaseDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert customer
    const result = await customersCollection.insertOne(customer);
    
    return NextResponse.json({
      success: true,
      id: result.insertedId,
      customer: { ...customer, _id: result.insertedId },
      message: "Customer added successfully"
    });
    
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to add customer"
    }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Customer ID is required"
      }, { status: 400 });
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: "Invalid customer ID"
      }, { status: 400 });
    }
    
    const db = await connectDB();
    const customersCollection = db.collection("customers");
    
    // Check if customer exists
    const existingCustomer = await customersCollection.findOne({
      _id: new ObjectId(id)
    });
    
    if (!existingCustomer) {
      return NextResponse.json({
        success: false,
        error: "Customer not found"
      }, { status: 404 });
    }
    
    // Check for duplicate phone or email (excluding current customer)
    if (updateData.phone || updateData.email) {
      const duplicateQuery = {
        _id: { $ne: new ObjectId(id) },
        $or: []
      };
      
      if (updateData.phone) {
        duplicateQuery.$or.push({ phone: updateData.phone.trim() });
      }
      
      if (updateData.email) {
        duplicateQuery.$or.push({ email: updateData.email.trim() });
      }
      
      if (duplicateQuery.$or.length > 0) {
        const duplicate = await customersCollection.findOne(duplicateQuery);
        if (duplicate) {
          return NextResponse.json({
            success: false,
            error: "Another customer with this phone or email already exists"
          }, { status: 409 });
        }
      }
    }
    
    // Prepare update
    updateData.updatedAt = new Date();
    
    // Update customer
    const result = await customersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: "Customer updated successfully"
    });
    
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to update customer"
    }, { status: 500 });
  }
}

// DELETE - Remove customer
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Customer ID is required"
      }, { status: 400 });
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: "Invalid customer ID"
      }, { status: 400 });
    }
    
    const db = await connectDB();
    const customersCollection = db.collection("customers");
    const ordersCollection = db.collection("orders");
    
    // Check if customer has orders
    const orderCount = await ordersCollection.countDocuments({
      customerId: id
    });
    
    if (orderCount > 0) {
      return NextResponse.json({
        success: false,
        error: "Cannot delete customer with existing orders. Archive instead."
      }, { status: 400 });
    }
    
    // Delete customer
    const result = await customersCollection.deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: "Customer not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully"
    });
    
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to delete customer"
    }, { status: 500 });
  }
}