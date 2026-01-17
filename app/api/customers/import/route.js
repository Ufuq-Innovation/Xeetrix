// app/api/customers/import/route.js
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { parse } from "csv-parse/sync";

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

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file uploaded"
      }, { status: 400 });
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: "File size exceeds 5MB limit"
      }, { status: 400 });
    }
    
    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString("utf-8");
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        error: "CSV file is empty or invalid format"
      }, { status: 400 });
    }
    
    const db = await connectDB();
    const customersCollection = db.collection("customers");
    
    const imported = [];
    const errors = [];
    
    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Validate required fields
        if (!record.Name || !record.Name.trim()) {
          errors.push(`Row ${i + 1}: Name is required`);
          continue;
        }
        
        if (!record.Phone || !record.Phone.trim()) {
          errors.push(`Row ${i + 1}: Phone is required`);
          continue;
        }
        
        // Check for duplicates
        const existing = await customersCollection.findOne({
          $or: [
            { phone: record.Phone.trim() },
            { email: record.Email?.trim() }
          ]
        });
        
        if (existing) {
          errors.push(`Row ${i + 1}: Customer with this phone/email already exists`);
          continue;
        }
        
        // Prepare customer data
        const customer = {
          name: record.Name.trim(),
          email: record.Email?.trim() || "",
          phone: record.Phone.trim(),
          address: record.Address?.trim() || "",
          city: record.City?.trim() || "",
          country: record.Country?.trim() || "",
          company: record.Company?.trim() || "",
          notes: record.Notes?.trim() || "",
          status: record.Status?.trim() || "active",
          customerType: record.Type?.trim() || "regular",
          taxNumber: record["Tax Number"]?.trim() || "",
          totalPurchases: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          lastPurchaseDate: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert customer
        const result = await customersCollection.insertOne(customer);
        imported.push({
          id: result.insertedId,
          name: customer.name,
          phone: customer.phone
        });
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      details: {
        imported,
        errors: errors.slice(0, 10) // Return only first 10 errors
      },
      message: `Successfully imported ${imported.length} customers`
    });
    
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Import failed"
    }, { status: 500 });
  }
}