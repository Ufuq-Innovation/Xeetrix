// app/api/marketing/templates/route.js

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
    const templatesCollection = db.collection("marketing_templates");
    
    const templates = await templatesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      templates,
      count: templates.length
    });
    
  } catch (error) {
    console.error("GET templates error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch templates" },
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
      category,
      content,
      styles,
      variables,
      previewImage,
      isPublic
    } = body;
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Template name is required" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const templatesCollection = db.collection("marketing_templates");
    
    const template = {
      name: name.trim(),
      type: type || "email",
      category: category || "promotional",
      content: content || "",
      styles: styles || {},
      variables: variables || [],
      previewImage: previewImage || "",
      isPublic: Boolean(isPublic),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await templatesCollection.insertOne(template);
    
    return NextResponse.json({
      success: true,
      message: "Template created successfully",
      template: { ...template, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error("POST templates error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create template" },
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
        { success: false, message: "Template ID is required" },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid template ID" },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const templatesCollection = db.collection("marketing_templates");
    
    updateData.updatedAt = new Date();
    
    const result = await templatesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("PUT templates error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update template" },
      { status: 500 }
    );
  }
}