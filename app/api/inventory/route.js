// app/api/inventory/route.js
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Database connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "your_database_name";

async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(dbName);
}

// GET - Fetch all products
export async function GET() {
  try {
    const db = await connectDB();
    const products = await db.collection('inventory').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      products: products,
      count: products.length
    });
    
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, stock, costPrice, sellingPrice, category, source, sku, description } = body;
    
    // Validation
    if (!name || stock === undefined) {
      return NextResponse.json(
        { success: false, message: "Name and stock are required" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const product = {
      name: name.trim(),
      stock: Number(stock) || 0,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      category: category?.trim() || "",
      source: source?.trim() || "",
      sku: sku?.trim() || "",
      description: description?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('inventory').insertOne(product);
    
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      productId: result.insertedId,
      product: { ...product, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Convert numeric fields
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.costPrice !== undefined) updateData.costPrice = Number(updateData.costPrice);
    if (updateData.sellingPrice !== undefined) updateData.sellingPrice = Number(updateData.sellingPrice);
    
    updateData.updatedAt = new Date();
    
    const db = await connectDB();
    const result = await db.collection('inventory').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (MULTIPLE METHODS SUPPORTED)
export async function DELETE(request) {
  try {
    let id;
    
    // Method 1: Try to get ID from request body (JSON)
    try {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    } catch {
      // Method 2: Try to get ID from URL query parameters
      const { searchParams } = new URL(request.url);
      id = searchParams.get('id');
    }
    
    console.log("DELETE Request - ID received:", id);
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Product ID is required. Send as JSON body: {id: 'product_id'} or query param: ?id=product_id" 
        },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const result = await db.collection('inventory').deleteOne({
      _id: new ObjectId(id)
    });
    
    console.log("Delete result:", result);
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found or already deleted" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error("DELETE Error:", error);
    
    // Handle invalid ObjectId
    if (error.message.includes("ObjectId")) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}