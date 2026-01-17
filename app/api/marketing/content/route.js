// app/api/marketing/content/route.js

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
    const contentCollection = db.collection("marketing_content");
    
    const content = await contentCollection
      .find({})
      .sort({ priority: -1, createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      content,
      count: content.length
    });
    
  } catch (error) {
    console.error("GET content error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, 
      type, 
      content, 
      position,
      backgroundColor,
      textColor,
      buttonText,
      buttonColor,
      buttonLink,
      imageUrl,
      videoUrl,
      status,
      scheduleDate,
      devices,
      pages,
      priority
    } = body;
    
    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Content title is required" },
        { status: 400 }
      );
    }
    
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Content is required" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const contentCollection = db.collection("marketing_content");
    
    const contentItem = {
      title: title.trim(),
      type: type || "banner",
      content: content.trim(),
      position: position || "top",
      backgroundColor: backgroundColor || "#3b82f6",
      textColor: textColor || "#ffffff",
      buttonText: buttonText || "",
      buttonColor: buttonColor || "#10b981",
      buttonLink: buttonLink || "",
      imageUrl: imageUrl || "",
      videoUrl: videoUrl || "",
      status: status || "draft",
      scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
      devices: devices || ["desktop", "mobile"],
      pages: pages || ["home"],
      priority: Number(priority) || 1,
      impressions: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await contentCollection.insertOne(contentItem);
    
    return NextResponse.json({
      success: true,
      message: "Content created successfully",
      content: { ...contentItem, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error("POST content error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create content" },
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
        { success: false, message: "Content ID is required" },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid content ID" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const contentCollection = db.collection("marketing_content");
    
    updateData.updatedAt = new Date();
    
    const result = await contentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("PUT content error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update content" },
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
        { success: false, message: "Content ID is required" },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid content ID" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const contentCollection = db.collection("marketing_content");
    
    const result = await contentCollection.deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Content not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Content deleted successfully"
    });
    
  } catch (error) {
    console.error("DELETE content error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}