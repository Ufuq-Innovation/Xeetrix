// app/api/finance/route.js
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// Database connection
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

// GET - Fetch transactions with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    const db = await connectDB();
    const collection = db.collection("finance_transactions");
    
    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    if (filter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      dateFilter = { 
        date: { 
          $gte: startOfDay.toISOString(),
          $lte: endOfDay.toISOString()
        } 
      };
    } else if (filter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { date: { $gte: startOfWeek.toISOString() } };
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { date: { $gte: startOfMonth.toISOString() } };
    } else if (filter === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { date: { $gte: startOfYear.toISOString() } };
    }
    
    // Fetch transactions
    const transactions = await collection
      .find(dateFilter)
      .sort({ date: -1, createdAt: -1 })
      .toArray();
    
    // For backward compatibility, also return as expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    return NextResponse.json({ 
      success: true, 
      transactions,
      expenses,
      count: transactions.length,
      filter 
    });
    
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to fetch transactions" 
    }, { status: 500 });
  }
}

// POST - Add new transaction (income or expense)
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      type = 'expense', 
      title, 
      amount, 
      category, 
      description = '', 
      paymentMethod = 'cash',
      date 
    } = body;
    
    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction description is required" 
      }, { status: 400 });
    }
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Valid amount is required" 
      }, { status: 400 });
    }
    
    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: "Valid type (income/expense) is required" 
      }, { status: 400 });
    }
    
    const db = await connectDB();
    const collection = db.collection("finance_transactions");
    
    // Prepare transaction document
    const transaction = {
      type,
      title: title.trim(),
      amount: Number(amount),
      category: category?.trim() || (type === 'income' ? 'Sales' : 'Marketing'),
      description: description?.trim() || '',
      paymentMethod: paymentMethod?.trim() || 'cash',
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert into database
    const result = await collection.insertOne(transaction);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      transaction: { ...transaction, _id: result.insertedId },
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully`
    });
    
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to add transaction" 
    }, { status: 500 });
  }
}

// DELETE - Remove transaction
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction ID is required" 
      }, { status: 400 });
    }
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid Transaction ID format" 
      }, { status: 400 });
    }
    
    const db = await connectDB();
    const collection = db.collection("finance_transactions");
    
    // Delete transaction
    const result = await collection.deleteOne({ 
      _id: new ObjectId(id) 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Transaction deleted successfully" 
    });
    
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to delete transaction" 
    }, { status: 500 });
  }
}