// app/api/marketing/campaigns/route.js

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

export async function GET() {
  try {
    const db = await connectDB();
    const campaignsCollection = db.collection("marketing_campaigns");
    
    const campaigns = await campaignsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length
    });
    
  } catch (error) {
    console.error("GET campaigns error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      type, 
      targetAudience, 
      budget, 
      startDate, 
      endDate, 
      status,
      description,
      template,
      scheduleType,
      recurrence,
      channels
    } = body;
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Campaign name is required" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const campaignsCollection = db.collection("marketing_campaigns");
    
    const campaign = {
      name: name.trim(),
      type: type || "email",
      targetAudience: targetAudience || "all",
      budget: Number(budget) || 0,
      spent: 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      status: status || "draft",
      description: description?.trim() || "",
      template: template || "",
      scheduleType: scheduleType || "immediate",
      recurrence: recurrence || "once",
      channels: channels || ["email"],
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await campaignsCollection.insertOne(campaign);
    
    return NextResponse.json({
      success: true,
      message: "Campaign created successfully",
      campaign: { ...campaign, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error("POST campaigns error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create campaign" },
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
        { success: false, message: "Campaign ID is required" },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid campaign ID" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const campaignsCollection = db.collection("marketing_campaigns");
    
    updateData.updatedAt = new Date();
    
    const result = await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: "Campaign updated successfully",
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("PUT campaigns error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update campaign" },
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
        { success: false, message: "Campaign ID is required" },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid campaign ID" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const campaignsCollection = db.collection("marketing_campaigns");
    
    const result = await campaignsCollection.deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Campaign not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully"
    });
    
  } catch (error) {
    console.error("DELETE campaigns error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}